import { LogEvent, GeoLocation } from '../types/soc';
import { evaluateEventSignatures } from './detectionEngine';

// Default geographic resolution mock for common attacker subnets
export function resolveGeoLocation(ip: string): GeoLocation {
  if (ip.startsWith('185.220.') || ip.startsWith('45.154.')) {
    return { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.1109, lng: 8.6821 };
  }
  if (ip.startsWith('194.26.') || ip.startsWith('91.240.')) {
    return { city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041 };
  }
  if (ip.startsWith('103.251.') || ip.startsWith('114.')) {
    return { city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 };
  }
  if (ip.startsWith('198.51.') || ip.startsWith('142.')) {
    return { city: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.7767, lng: -96.7970 };
  }
  if (ip.startsWith('185.190.')) {
    return { city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278 };
  }
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
    return { city: 'Local SOC Lab', country: 'Internal Network', countryCode: 'LAN', lat: 37.7749, lng: -122.4194 };
  }
  return { city: 'External Origin', country: 'Global WAN', countryCode: 'WAN', lat: 40.7128, lng: -74.0060 };
}

/**
 * Parses raw textual log data into structured LogEvent objects
 */
export function parseRawLogs(rawText: string): LogEvent[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedEvents: LogEvent[] = [];

  for (const line of lines) {
    try {
      // 1. Try parsing JSON format
      if (line.startsWith('{') && line.endsWith('}')) {
        const json = JSON.parse(line);
        const sourceIp = json.src_ip || json.sourceIp || json.ip || '192.168.1.50';
        const destIp = json.dest_ip || json.destinationIp || '10.0.0.15';
        const eventType = json.event_type || (json.status === 'failed' ? 'AUTH_FAILED' : 'HTTP_REQUEST');
        const geo = resolveGeoLocation(sourceIp);

        const partialEvent: Partial<LogEvent> = {
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: json.timestamp || new Date().toISOString(),
          sourceIp,
          destinationIp: destIp,
          destinationPort: json.dest_port || json.port || 80,
          protocol: json.protocol || 'HTTP',
          eventType: eventType,
          username: json.user || json.username,
          status: json.status === 'failed' ? 'FAILURE' : 'SUCCESS',
          rawPayload: line,
          details: {
            url: json.url || json.path,
            httpMethod: json.method || 'GET',
            dnsQuery: json.query || json.domain,
            dnsType: json.record_type || 'A',
            userAgent: json.user_agent
          },
          geo
        };

        const evalResult = evaluateEventSignatures(partialEvent);
        parsedEvents.push({
          ...(partialEvent as LogEvent),
          severity: evalResult.severity,
          category: evalResult.category,
          isSuspicious: evalResult.isSuspicious
        });
        continue;
      }

      // 2. Syslog / Auth Log format (e.g. sshd failed password)
      const sshFailedMatch = line.match(/sshd\[\d+\]:\s+Failed password for (?:invalid user )?(\w+) from ([\d\.]+) port (\d+)/i);
      if (sshFailedMatch) {
        const username = sshFailedMatch[1];
        const sourceIp = sshFailedMatch[2];
        const sourcePort = parseInt(sshFailedMatch[3], 10);
        const geo = resolveGeoLocation(sourceIp);

        const partialEvent: Partial<LogEvent> = {
          id: `EVT-AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceIp,
          destinationIp: '10.0.0.22', // Auth server
          sourcePort,
          destinationPort: 22,
          protocol: 'SSH',
          eventType: 'AUTH_FAILED',
          username,
          status: 'FAILURE',
          rawPayload: line,
          details: {
            toolSignature: 'Hydra'
          },
          geo
        };

        const evalResult = evaluateEventSignatures(partialEvent);
        parsedEvents.push({
          ...(partialEvent as LogEvent),
          severity: evalResult.severity,
          category: 'brute_force',
          isSuspicious: true
        });
        continue;
      }

      // 3. Syslog Auth Accepted
      const sshAcceptedMatch = line.match(/sshd\[\d+\]:\s+Accepted password for (\w+) from ([\d\.]+) port (\d+)/i);
      if (sshAcceptedMatch) {
        const username = sshAcceptedMatch[1];
        const sourceIp = sshAcceptedMatch[2];
        const geo = resolveGeoLocation(sourceIp);

        parsedEvents.push({
          id: `EVT-AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceIp,
          destinationIp: '10.0.0.22',
          destinationPort: 22,
          protocol: 'SSH',
          eventType: 'AUTH_SUCCESS',
          username,
          status: 'SUCCESS',
          severity: 'info',
          category: 'normal_traffic',
          rawPayload: line,
          details: {},
          geo,
          isSuspicious: false
        });
        continue;
      }

      // 4. Apache / Nginx Combined Log format
      const apacheMatch = line.match(/^([\d\.]+)\s+-\s+(\S+)\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^"]+)\s+HTTP\/[\d\.]+"\s+(\d{3})\s+(\d+)/);
      if (apacheMatch) {
        const sourceIp = apacheMatch[1];
        const username = apacheMatch[2] !== '-' ? apacheMatch[2] : undefined;
        const method = apacheMatch[4] as 'GET' | 'POST';
        const url = apacheMatch[5];
        const httpStatus = parseInt(apacheMatch[6], 10);
        const geo = resolveGeoLocation(sourceIp);

        const partialEvent: Partial<LogEvent> = {
          id: `EVT-HTTP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceIp,
          destinationIp: '10.0.0.15', // Juice Shop App
          destinationPort: 80,
          protocol: 'HTTP',
          eventType: 'HTTP_REQUEST',
          username,
          status: httpStatus >= 400 ? 'ALERT' : 'SUCCESS',
          rawPayload: line,
          details: {
            url,
            httpMethod: method,
            httpStatus
          },
          geo
        };

        const evalResult = evaluateEventSignatures(partialEvent);
        parsedEvents.push({
          ...(partialEvent as LogEvent),
          severity: evalResult.severity,
          category: evalResult.category,
          isSuspicious: evalResult.isSuspicious
        });
        continue;
      }

      // 5. Generic line fallback
      const ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      const sourceIp = ipMatch ? ipMatch[0] : '192.168.1.100';
      const geo = resolveGeoLocation(sourceIp);

      const partialEvent: Partial<LogEvent> = {
        id: `EVT-GEN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        sourceIp,
        destinationIp: '10.0.0.1',
        destinationPort: 80,
        protocol: 'TCP',
        eventType: 'NETWORK_ALERT',
        status: 'INFO',
        rawPayload: line,
        details: {},
        geo
      };

      const evalResult = evaluateEventSignatures(partialEvent);
      parsedEvents.push({
        ...(partialEvent as LogEvent),
        severity: evalResult.severity,
        category: evalResult.category,
        isSuspicious: evalResult.isSuspicious
      });

    } catch (e) {
      console.warn('Failed parsing log line:', line, e);
    }
  }

  return parsedEvents;
}
