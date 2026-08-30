import { LogEvent, ThreatAlert, SecurityRule, AttackCategory, SeverityLevel } from '../types/soc';

// Predefined Security Detection Rules mapped to MITRE ATT&CK
export const DEFAULT_SECURITY_RULES: SecurityRule[] = [
  {
    id: 'RULE-BF-001',
    name: 'Brute-Force Login Pattern Detection',
    category: 'brute_force',
    mitreId: 'T1110.001 - Password Guessing',
    severity: 'critical',
    description: 'Triggers when >= 4 failed login attempts are observed from a single source IP within a 60-second window (Hydra/Medusa pattern).',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-AUTH-002',
    name: 'Repeated Authentication Anomaly',
    category: 'auth_failure',
    mitreId: 'T1078 - Valid Accounts Abuse',
    severity: 'high',
    description: 'Flags anomalous consecutive authentication failures across multiple usernames from a coordinated subnet.',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-WEB-003',
    name: 'OWASP Juice Shop / DVWA SQL Injection',
    category: 'http_sqli',
    mitreId: 'T1190 - Exploit Public-Facing Application',
    severity: 'critical',
    description: 'Identifies SQL injection syntax such as UNION SELECT, OR 1=1, boolean-based payloads, and sleep() injected into HTTP query strings or bodies.',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-WEB-004',
    name: 'Cross-Site Scripting & Path Traversal',
    category: 'http_xss',
    mitreId: 'T1059.007 - JavaScript Execution / File Inclusion',
    severity: 'high',
    description: 'Detects client-side exploit payloads, <script> tags, DOM event handlers, and ../../etc/passwd directory fuzzing attempts.',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-DNS-005',
    name: 'DNS Tunneling & Data Exfiltration',
    category: 'dns_tunneling',
    mitreId: 'T1071.004 - DNS Communication Protocol',
    severity: 'critical',
    description: 'Detects high Shannon entropy (>3.8), long encoded subdomains (>30 chars), and abnormal volume of TXT queries indicating Cobalt Strike or Iodine tunneling.',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-SCAN-006',
    name: 'Nmap / Wireshark Port Scanning Activity',
    category: 'port_scan',
    mitreId: 'T1046 - Network Service Discovery',
    severity: 'high',
    description: 'Detects rapid multi-port TCP SYN, FIN, NULL sweeps, and OS fingerprinting indicators from a single source.',
    enabled: true,
    triggerCount: 0
  },
  {
    id: 'RULE-IP-007',
    name: 'Suspicious Source IP & Threat Intel Hit',
    category: 'suspicious_ip',
    mitreId: 'T1595 - Active Scanning & Botnet C2',
    severity: 'medium',
    description: 'Flags traffic originating from high-risk Tor exit nodes, known bulletproof hosts, or coordinated botnet IPs.',
    enabled: true,
    triggerCount: 0
  }
];

// Helper: Calculate Shannon Entropy for DNS domains
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies: { [key: string]: number } = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

// Known attack signatures
const SQLI_REGEX = /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|SLEEP|BENCHMARK)\b|'|--|\/\*|\*\/|#|;|1=1|1' OR '1'='1|OR\s+\d+=\d+)/i;
const XSS_REGEX = /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=|alert\(|eval\(|document\.cookie|<img\s+src=x)/i;
const PATH_TRAVERSAL_REGEX = /(\.\.\/|\.\.\\|%2e%2e%2f|\/etc\/passwd|win\.ini|boot\.ini)/i;
const KNOWN_SUSPICIOUS_IPS = new Set([
  '185.220.101.5',
  '45.154.255.89',
  '194.26.29.112',
  '91.240.118.172',
  '198.51.100.44',
  '103.251.167.20'
]);

export interface DetectionResult {
  isSuspicious: boolean;
  category: AttackCategory;
  severity: SeverityLevel;
  ruleId?: string;
  ruleTitle?: string;
  mitreCode?: string;
  reason?: string;
  confidenceScore: number;
}

/**
 * Evaluates a single event against immediate signature and anomaly rules
 */
export function evaluateEventSignatures(event: Partial<LogEvent>): DetectionResult {
  // 1. Check HTTP Requests (OWASP Juice Shop / DVWA)
  if (event.protocol === 'HTTP' || event.protocol === 'HTTPS' || event.eventType === 'HTTP_REQUEST') {
    const url = event.details?.url || '';
    const payload = event.rawPayload || '';
    const combined = `${url} ${payload}`;

    if (SQLI_REGEX.test(combined)) {
      return {
        isSuspicious: true,
        category: 'http_sqli',
        severity: 'critical',
        ruleId: 'RULE-WEB-003',
        ruleTitle: 'OWASP Juice Shop / DVWA SQL Injection Detected',
        mitreCode: 'T1190',
        reason: `SQL Injection pattern matched in HTTP request: ${url}`,
        confidenceScore: 96
      };
    }

    if (XSS_REGEX.test(combined)) {
      return {
        isSuspicious: true,
        category: 'http_xss',
        severity: 'high',
        ruleId: 'RULE-WEB-004',
        ruleTitle: 'Cross-Site Scripting (XSS) Exploit Attempt',
        mitreCode: 'T1059.007',
        reason: `Malicious JavaScript/DOM payload identified in parameter payload`,
        confidenceScore: 92
      };
    }

    if (PATH_TRAVERSAL_REGEX.test(combined)) {
      return {
        isSuspicious: true,
        category: 'http_traversal',
        severity: 'high',
        ruleId: 'RULE-WEB-004',
        ruleTitle: 'Path Traversal / LFI Attempt',
        mitreCode: 'T1059.007',
        reason: `Directory traversal sequences detected targeting server root file system`,
        confidenceScore: 94
      };
    }
  }

  // 2. Check DNS Activity
  if (event.protocol === 'DNS' || event.eventType === 'DNS_QUERY') {
    const query = event.details?.dnsQuery || '';
    const subdomain = query.split('.')[0] || '';
    const entropy = event.details?.dnsEntropy ?? calculateShannonEntropy(subdomain);

    if (subdomain.length > 28 && entropy > 3.75) {
      return {
        isSuspicious: true,
        category: 'dns_tunneling',
        severity: 'critical',
        ruleId: 'RULE-DNS-005',
        ruleTitle: 'High-Entropy DNS Tunneling / Exfiltration',
        mitreCode: 'T1071.004',
        reason: `Anomalous subdomain length (${subdomain.length} chars) with high Shannon Entropy (${entropy})`,
        confidenceScore: 95
      };
    }

    if (event.details?.dnsType === 'TXT' && subdomain.length > 20) {
      return {
        isSuspicious: true,
        category: 'dns_anomaly',
        severity: 'medium',
        ruleId: 'RULE-DNS-005',
        ruleTitle: 'Suspicious DNS TXT Record Volume',
        mitreCode: 'T1071.004',
        reason: `Encapsulated payload queries observed over DNS TXT record`,
        confidenceScore: 80
      };
    }
  }

  // 3. Check Port Scanning & Nmap signatures
  if (event.eventType === 'PORT_PROBE' || event.details?.toolSignature === 'Nmap') {
    const scanType = event.details?.portScanType || 'SYN_STEALTH';
    return {
      isSuspicious: true,
      category: 'port_scan',
      severity: 'high',
      ruleId: 'RULE-SCAN-006',
      ruleTitle: `Nmap Network Reconnaissance (${scanType})`,
      mitreCode: 'T1046',
      reason: `Nmap probe sequence targeting internal port ${event.destinationPort}`,
      confidenceScore: 90
    };
  }

  // 4. Check Suspicious Source IPs
  if (event.sourceIp && KNOWN_SUSPICIOUS_IPS.has(event.sourceIp)) {
    return {
      isSuspicious: true,
      category: 'suspicious_ip',
      severity: 'medium',
      ruleId: 'RULE-IP-007',
      ruleTitle: 'Blacklisted Threat Actor IP Activity',
      mitreCode: 'T1595',
      reason: `Source IP ${event.sourceIp} matches known malicious C2/Scanner database`,
      confidenceScore: 88
    };
  }

  // 5. Auth failures (Individual)
  if (event.eventType === 'AUTH_FAILED') {
    return {
      isSuspicious: true,
      category: 'auth_failure',
      severity: 'low',
      ruleId: 'RULE-AUTH-002',
      ruleTitle: 'Authentication Failure Logged',
      mitreCode: 'T1078',
      reason: `Failed login attempt for user '${event.username || 'unknown'}'`,
      confidenceScore: 70
    };
  }

  return {
    isSuspicious: false,
    category: 'normal_traffic',
    severity: 'info',
    confidenceScore: 0
  };
}

/**
 * Stateful Correlation Engine: Analyzes sliding time windows of events
 * to generate aggregated ThreatAlerts (Brute Force, Distributed Scans)
 */
export function correlateEvents(events: LogEvent[]): ThreatAlert[] {
  const alerts: ThreatAlert[] = [];
  const now = Date.now();
  const ONE_MINUTE_MS = 60 * 1000;
  const TWO_MINUTES_MS = 2 * 60 * 1000;

  // Group events by Source IP
  const ipGroups = new Map<string, LogEvent[]>();
  for (const ev of events) {
    const list = ipGroups.get(ev.sourceIp) || [];
    list.push(ev);
    ipGroups.set(ev.sourceIp, list);
  }

  ipGroups.forEach((ipEvents, ip) => {
    // 1. Correlate Brute-Force Attacks (Hydra / SSH / Web Login)
    const recentAuthFails = ipEvents.filter(e => 
      e.eventType === 'AUTH_FAILED' && 
      (now - new Date(e.timestamp).getTime()) <= ONE_MINUTE_MS
    );

    if (recentAuthFails.length >= 4) {
      const targetedUsers = Array.from(new Set(recentAuthFails.map(e => e.username || 'unknown')));
      alerts.push({
        id: `ALERT-BF-${ip.replace(/\./g, '-')}-${recentAuthFails[0].id}`,
        timestamp: recentAuthFails[0].timestamp,
        title: `Coordinated Brute-Force Attack from ${ip}`,
        category: 'brute_force',
        severity: recentAuthFails.length >= 8 ? 'critical' : 'high',
        sourceIp: ip,
        targetIp: recentAuthFails[0].destinationIp,
        targetUser: targetedUsers.join(', '),
        targetPort: recentAuthFails[0].destinationPort,
        mitreTechnique: 'T1110.001 - Brute Force / Password Guessing',
        description: `Observed ${recentAuthFails.length} failed authentication attempts within 60s against targeted users [${targetedUsers.join(', ')}].`,
        evidenceCount: recentAuthFails.length,
        confidenceScore: Math.min(99, 75 + recentAuthFails.length * 4),
        recommendedAction: `Apply immediate IP blacklist rule on boundary firewall for ${ip} and enforce account lockout.`,
        status: 'ACTIVE',
        eventIds: recentAuthFails.map(e => e.id)
      });
    }

    // 2. Correlate Multi-Port Port Scanning (Nmap sweeps)
    const recentPortProbes = ipEvents.filter(e => 
      (e.eventType === 'PORT_PROBE' || e.category === 'port_scan') &&
      (now - new Date(e.timestamp).getTime()) <= TWO_MINUTES_MS
    );

    const probedPorts = new Set(recentPortProbes.map(e => e.destinationPort));
    if (probedPorts.size >= 5 || recentPortProbes.length >= 8) {
      alerts.push({
        id: `ALERT-SCAN-${ip.replace(/\./g, '-')}-${recentPortProbes[0].id}`,
        timestamp: recentPortProbes[0].timestamp,
        title: `Nmap Reconnaissance Scan Detected from ${ip}`,
        category: 'port_scan',
        severity: 'high',
        sourceIp: ip,
        targetIp: recentPortProbes[0].destinationIp,
        targetPort: recentPortProbes[0].destinationPort,
        mitreTechnique: 'T1046 - Network Service Scanning',
        description: `Source IP scanned ${probedPorts.size} distinct ports (${Array.from(probedPorts).slice(0, 8).join(', ')}...) using rapid SYN/FIN flags.`,
        evidenceCount: recentPortProbes.length,
        confidenceScore: 94,
        recommendedAction: `Drop all incoming TCP/UDP traffic from source ${ip} and review exposed perimeter services.`,
        status: 'ACTIVE',
        eventIds: recentPortProbes.map(e => e.id)
      });
    }

    // 3. Correlate High-Volume SQLi & Web Attacks (Juice Shop / DVWA)
    const recentWebAttacks = ipEvents.filter(e => 
      (e.category === 'http_sqli' || e.category === 'http_xss' || e.category === 'http_traversal') &&
      (now - new Date(e.timestamp).getTime()) <= TWO_MINUTES_MS
    );

    if (recentWebAttacks.length >= 2) {
      alerts.push({
        id: `ALERT-WEB-${ip.replace(/\./g, '-')}-${recentWebAttacks[0].id}`,
        timestamp: recentWebAttacks[0].timestamp,
        title: `Web Application Exploit Campaign from ${ip}`,
        category: recentWebAttacks[0].category,
        severity: 'critical',
        sourceIp: ip,
        targetIp: recentWebAttacks[0].destinationIp,
        targetPort: recentWebAttacks[0].destinationPort,
        mitreTechnique: 'T1190 - Exploit Public-Facing Application',
        description: `Multiple web exploit payloads (SQLi / XSS / Path Traversal) directed at Web Server [${recentWebAttacks[0].destinationIp}:80/443].`,
        evidenceCount: recentWebAttacks.length,
        confidenceScore: 98,
        recommendedAction: `Enable WAF auto-block rule for ${ip}, invalidate session cookies, and inspect application database query logs.`,
        status: 'ACTIVE',
        eventIds: recentWebAttacks.map(e => e.id)
      });
    }

    // 4. Correlate DNS Tunneling / Exfiltration
    const recentDnsAttacks = ipEvents.filter(e =>
      (e.category === 'dns_tunneling' || e.category === 'dns_anomaly') &&
      (now - new Date(e.timestamp).getTime()) <= TWO_MINUTES_MS
    );

    if (recentDnsAttacks.length >= 2) {
      alerts.push({
        id: `ALERT-DNS-${ip.replace(/\./g, '-')}-${recentDnsAttacks[0].id}`,
        timestamp: recentDnsAttacks[0].timestamp,
        title: `Covert DNS Tunneling & Exfiltration from ${ip}`,
        category: 'dns_tunneling',
        severity: 'critical',
        sourceIp: ip,
        targetIp: recentDnsAttacks[0].destinationIp,
        targetPort: 53,
        mitreTechnique: 'T1071.004 - DNS Exfiltration Channel',
        description: `High-entropy DNS payload exfiltration detected over port 53. Evidence of base32/base64 encoded payloads in recursive queries.`,
        evidenceCount: recentDnsAttacks.length,
        confidenceScore: 96,
        recommendedAction: `Sinkhole domain in local DNS resolver, isolate client workstation, and capture PCAP for forensic decoding.`,
        status: 'ACTIVE',
        eventIds: recentDnsAttacks.map(e => e.id)
      });
    }
  });

  return alerts;
}
