export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AttackCategory = 
  | 'brute_force'
  | 'auth_failure'
  | 'http_sqli'
  | 'http_xss'
  | 'http_traversal'
  | 'dns_tunneling'
  | 'dns_anomaly'
  | 'port_scan'
  | 'suspicious_ip'
  | 'normal_traffic';

export interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export interface LogEvent {
  id: string;
  timestamp: string; // ISO string
  sourceIp: string;
  destinationIp: string;
  sourcePort?: number;
  destinationPort: number;
  protocol: 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP' | 'TCP' | 'UDP' | 'ICMP';
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'HTTP_REQUEST' | 'DNS_QUERY' | 'PORT_PROBE' | 'NETWORK_ALERT';
  username?: string;
  status: 'SUCCESS' | 'FAILURE' | 'ALERT' | 'BLOCKED' | 'INFO';
  severity: SeverityLevel;
  category: AttackCategory;
  rawPayload: string;
  details: {
    url?: string;
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    httpStatus?: number;
    dnsQuery?: string;
    dnsType?: 'A' | 'AAAA' | 'TXT' | 'CNAME' | 'MX' | 'PTR';
    dnsEntropy?: number;
    portScanType?: 'SYN_STEALTH' | 'FIN_SCAN' | 'NULL_SCAN' | 'CONNECT_SCAN' | 'XMAS_SCAN';
    toolSignature?: 'Nmap' | 'Hydra' | 'SQLmap' | 'Wireshark' | 'JuiceShopExploit' | 'DVWA_Payload' | 'Dirb' | 'CustomScript';
    payloadSnippet?: string;
    userAgent?: string;
  };
  geo: GeoLocation;
  isSuspicious: boolean;
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  title: string;
  category: AttackCategory;
  severity: SeverityLevel;
  sourceIp: string;
  targetIp: string;
  targetUser?: string;
  targetPort?: number;
  mitreTechnique: string;
  description: string;
  evidenceCount: number;
  confidenceScore: number; // 0 - 100%
  recommendedAction: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'FALSE_POSITIVE';
  eventIds: string[];
}

export interface SocMetrics {
  totalEvents: number;
  failedLogins: number;
  successfulLogins: number;
  suspiciousEvents: number;
  activeThreatCount: number;
  threatIndexScore: number; // 0 - 100
  httpTotal: number;
  httpSuspicious: number;
  dnsTotal: number;
  dnsSuspicious: number;
  portScansDetected: number;
  bruteForceIncidents: number;
}

export interface EntityCount {
  name: string;
  count: number;
  category?: string;
  country?: string;
  riskScore?: number;
  isMalicious?: boolean;
}

export interface AssetNode {
  id: string;
  name: string;
  ip: string;
  role: 'FIREWALL' | 'DMZ_PROXY' | 'JUICE_SHOP_APP' | 'AUTH_SERVER' | 'DATABASE' | 'SIEM_CORE' | 'ATTACKER_NODE';
  status: 'HEALTHY' | 'UNDER_ATTACK' | 'COMPROMISED' | 'ISOLATED';
  openPorts: number[];
  vulnerabilities: string[];
  activeThreats: number;
  position3D: [number, number, number];
}

export interface AttackVectorArc {
  id: string;
  sourceLat: number;
  sourceLng: number;
  destLat: number;
  destLng: number;
  sourceCity: string;
  country: string;
  severity: SeverityLevel;
  category: AttackCategory;
  progress: number;
}

export interface SecurityRule {
  id: string;
  name: string;
  category: AttackCategory;
  mitreId: string;
  severity: SeverityLevel;
  description: string;
  enabled: boolean;
  triggerCount: number;
}
