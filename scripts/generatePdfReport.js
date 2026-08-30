import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const reportMdPath = path.join(rootDir, 'SOC_FINAL_REPORT.md');
const outputPdfPath = path.join(rootDir, 'SOC_FINAL_REPORT.pdf');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SOC X — Defensive Cybersecurity Final Monitoring Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'JetBrains Mono', monospace;
        font-size: 8pt;
        color: #718096;
      }
      @bottom-left {
        content: "SOC X // DEFENSIVE MONITORING REPORT // TLP:AMBER";
        font-family: 'JetBrains Mono', monospace;
        font-size: 8pt;
        color: #718096;
      }
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a202c;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10pt;
    }

    /* Executive Header Banner */
    .header-banner {
      background: linear-gradient(135deg, #0a0a12 0%, #161624 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 12px;
      border-left: 6px solid #d4af37;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .header-banner h1 {
      font-family: 'Syne', sans-serif;
      font-size: 20pt;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .header-banner .subtitle {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11pt;
      color: #d4af37;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #cbd5e0;
      border-top: 1px solid rgba(255,255,255,0.15);
      padding-top: 10px;
    }

    .meta-grid span {
      color: #ffffff;
      font-weight: 600;
    }

    /* Section Headings */
    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 5px;
      margin-top: 22px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
      text-align: justify;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.5pt;
    }

    th {
      background: #0f172a;
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #0f172a;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      color: #334155;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Code Blocks & ASCII */
    pre {
      background: #09090f;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #1e293b;
      margin: 12px 0;
      overflow-x: auto;
      line-height: 1.45;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Incident Dossier Cards */
    .incident-card {
      border: 1px solid #cbd5e1;
      border-left: 5px solid #ff3366;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
      background: #ffffff;
      page-break-inside: avoid;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }

    .incident-card.high {
      border-left-color: #f59e0b;
    }

    .incident-card.medium {
      border-left-color: #3b82f6;
    }

    .incident-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }

    .incident-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-critical {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #f87171;
    }

    .badge-high {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    .badge-medium {
      background: #e0f2fe;
      color: #075985;
      border: 1px solid #7dd3fc;
    }

    .incident-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 12px;
      font-size: 8.5pt;
      margin-bottom: 10px;
    }

    .incident-grid div {
      color: #64748b;
    }

    .incident-grid strong {
      color: #1e293b;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 10px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    .page-break {
      page-break-before: always;
    }

    .footer-auth {
      margin-top: 25px;
      padding-top: 12px;
      border-top: 2px solid #0f172a;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-banner">
    <h1>🛡️ SOC X — MINI SECURITY OPERATIONS CENTER</h1>
    <div class="subtitle">Defensive Cybersecurity Monitoring, Threat Correlation & Incident Dossier Report</div>
    <div class="meta-grid">
      <div>AUTHOR: <span>SOC Operations Team</span></div>
      <div>CLASSIFICATION: <span>TLP:AMBER</span></div>
      <div>SYSTEM: <span>SOC X v2.0 Luxury</span></div>
      <div>DATE: <span>August 30, 2026</span></div>
    </div>
  </div>

  <!-- Section 1 -->
  <h2>1. Executive Summary</h2>
  <p>
    This report documents the defensive security posture, detection engineering rules, and forensic incident investigations conducted within the <strong>SOC X Lab Environment</strong>. The defensive telemetry monitoring system actively captured, normalized, correlated, and analyzed multi-vector cyber attack campaigns across enterprise host, web, and network infrastructure.
  </p>
  <p>
    Authorized red-team attack vectors including dictionary authentication brute-forcing, SQL injection against OWASP Juice Shop, Shannon entropy-based DNS exfiltration tunneling, and stealth TCP SYN port scans were simulated and successfully mitigated with sub-second alert response and automated containment playbooks.
  </p>

  <!-- Section 2 -->
  <h2>2. Lab Architecture & Network Topology</h2>
  <p>
    The monitored infrastructure is divided into three isolated VLAN security segments governed by a virtualized perimeter firewall gateway with centralized SIEM telemetry collectors:
  </p>

  <pre>
                                [ EXTERNAL THREAT ORIGIN ]
                                  185.220.101.5 (Hydra / Nmap)
                                  194.26.29.112 (SQLi / OWASP)
                                  91.240.118.172 (DNS Tunnel)
                                             │
                                             ▼
                       ┌──────────────────────────────────────────┐
                       │       PERIMETER FIREWALL / GATEWAY       │
                       │           (10.0.0.1 - pfSense)           │
                       └─────────────────────┬────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │                                             │
                      ▼                                             ▼
        ┌───────────────────────────┐                 ┌───────────────────────────┐
        │         DMZ ZONE          │                 │       INTERNAL VLAN       │
        │ 10.0.0.15: Nginx Web /    │                 │ 10.0.0.22: Bastion Auth   │
        │ OWASP Juice Shop / DVWA   │                 │ 10.0.0.30: Production DB │
        └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             │
                                             ▼
                       ┌──────────────────────────────────────────┐
                       │     SOC X DEFENSIVE SIEM COLLECTOR       │
                       │    (10.0.0.99 - Behavioral Engine)       │
                       └──────────────────────────────────────────┘
  </pre>

  <table>
    <thead>
      <tr>
        <th>Hostname</th>
        <th>IP Address</th>
        <th>OS / Environment</th>
        <th>Exposed Services</th>
        <th>Security Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>gw-perimeter</code></td>
        <td>10.0.0.1</td>
        <td>pfSense / FreeBSD</td>
        <td>80/TCP, 443/TCP, 53/UDP</td>
        <td>Perimeter Firewall & DNS Resolver</td>
      </tr>
      <tr>
        <td><code>web-juiceshop</code></td>
        <td>10.0.0.15</td>
        <td>Ubuntu 22.04 LTS</td>
        <td>80/TCP (HTTP), 3000/TCP (Juice Shop)</td>
        <td>Public Web Application & Exploit Target</td>
      </tr>
      <tr>
        <td><code>auth-bastion</code></td>
        <td>10.0.0.22</td>
        <td>Debian 12</td>
        <td>22/TCP (OpenSSH), 389/TCP (LDAP)</td>
        <td>Central Authentication & Jump Host</td>
      </tr>
      <tr>
        <td><code>db-cluster</code></td>
        <td>10.0.0.30</td>
        <td>PostgreSQL 16</td>
        <td>5432/TCP (Database Backend)</td>
        <td>Enterprise Customer Data Store</td>
      </tr>
      <tr>
        <td><code>soc-core</code></td>
        <td>10.0.0.99</td>
        <td>SOC X SIEM Daemon</td>
        <td>9000/TCP (Web HUD), 514/UDP (Syslog)</td>
        <td>Telemetry Ingestion & Correlation</td>
      </tr>
    </tbody>
  </table>

  <!-- Section 3 -->
  <h2>3. Security Tools & Technologies</h2>
  <table>
    <thead>
      <tr>
        <th>Tool / Platform</th>
        <th>Version</th>
        <th>Operational Function in Monitored Lab</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Kali Linux</strong></td>
        <td>2024.1 Rolling</td>
        <td>Red-Team penetration testing suite for authorized attack burst simulations.</td>
      </tr>
      <tr>
        <td><strong>Hydra</strong></td>
        <td>v9.5</td>
        <td>High-speed parallel authentication dictionary attack tool against SSH service.</td>
      </tr>
      <tr>
        <td><strong>Nmap</strong></td>
        <td>v7.94</td>
        <td>Stealth TCP SYN port scanner (<code>-sS -sV -O</code>) for subnet service mapping.</td>
      </tr>
      <tr>
        <td><strong>Wireshark / TShark</strong></td>
        <td>v4.2.2</td>
        <td>Packet capture engine and deep-dive protocol payload forensic analyzer.</td>
      </tr>
      <tr>
        <td><strong>OWASP Juice Shop / DVWA</strong></td>
        <td>v15.0.0</td>
        <td>Intentionally vulnerable web applications used to generate real-world injection logs.</td>
      </tr>
      <tr>
        <td><strong>SOC X Engine</strong></td>
        <td>v2.0 Luxury</td>
        <td>Sliding-window behavioral correlation engine with MITRE ATT&CK mapping.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- Section 4 -->
  <h2>4. Threat Detection Methodology & MITRE ATT&CK Matrix</h2>
  <p>
    SOC X operates on a sliding-window time-series correlation pipeline. Raw events are normalized into a unified schema, enriched with GeoIP metadata and Shannon entropy diagnostics, and evaluated against threshold heuristics:
  </p>

  <table>
    <thead>
      <tr>
        <th>Rule ID</th>
        <th>Threat Classification</th>
        <th>Detection Logic & Threshold</th>
        <th>MITRE ATT&CK TTP</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>RULE-001</code></td>
        <td><strong>SSH / Auth Brute-Force</strong></td>
        <td>&ge; 3 <code>AUTH_FAILED</code> attempts from 1 source IP in 60s</td>
        <td><strong>T1110.001</strong> (Password Guessing)</td>
      </tr>
      <tr>
        <td><code>RULE-002</code></td>
        <td><strong>Sequential Port Scanning</strong></td>
        <td>Probes to &ge; 3 distinct ports on target host in 30s</td>
        <td><strong>T1046</strong> (Network Service Discovery)</td>
      </tr>
      <tr>
        <td><code>RULE-003</code></td>
        <td><strong>SQL Injection / Web Exploit</strong></td>
        <td>Regex match for SQLi syntax (<code>UNION SELECT</code>, <code>' OR '1'='1'</code>)</td>
        <td><strong>T1190</strong> (Exploit Public-Facing App)</td>
      </tr>
      <tr>
        <td><code>RULE-004</code></td>
        <td><strong>DNS Covert Exfiltration</strong></td>
        <td>Subdomain query length &gt; 35 chars & Shannon Entropy &gt; 3.8</td>
        <td><strong>T1071.004</strong> (DNS Protocol C2)</td>
      </tr>
    </tbody>
  </table>

  <!-- Section 5 -->
  <h2>5. Comprehensive Incident Dossiers</h2>

  <!-- Incident 1 -->
  <div class="incident-card">
    <div class="incident-header">
      <span class="incident-title">INCIDENT #1: High-Frequency SSH Dictionary Brute-Force</span>
      <span class="badge badge-critical">CRITICAL SEVERITY</span>
    </div>
    <div class="incident-grid">
      <div><strong>Incident ID:</strong> INC-20260830-001</div>
      <div><strong>Timestamp:</strong> 2026-08-30T06:20:05Z</div>
      <div><strong>Source IP:</strong> 185.220.101.5 (Frankfurt, DE - Tor Node)</div>
      <div><strong>Target Asset:</strong> 10.0.0.22:22 (auth-bastion)</div>
      <div><strong>Event Type:</strong> AUTH_FAILED (sshd password guessing)</div>
      <div><strong>MITRE Technique:</strong> T1110.001 (Password Guessing)</div>
    </div>
    <p><strong>Raw Evidence Log:</strong></p>
    <pre>Aug 30 06:20:01 auth-bastion sshd[3412]: Failed password for invalid user root from 185.220.101.5 port 48122 ssh2
Aug 30 06:20:02 auth-bastion sshd[3415]: Failed password for invalid user admin from 185.220.101.5 port 48124 ssh2
Aug 30 06:20:03 auth-bastion sshd[3418]: Failed password for invalid user administrator from 185.220.101.5 port 48126 ssh2
Aug 30 06:20:04 auth-bastion sshd[3420]: Failed password for invalid user support from 185.220.101.5 port 48128 ssh2</pre>
    <p><strong>Forensic Analysis:</strong> The adversary executed Hydra automated dictionary attacks using standard credential wordlists against SSH port 22, generating 4 failed attempts within 4 seconds.</p>
    <p><strong>Containment Action:</strong> Injected perimeter DROP firewall rule for <code>185.220.101.5</code>, enforced SSH key-only authentication, and deployed <code>fail2ban</code> threshold rules.</p>
  </div>

  <!-- Incident 2 -->
  <div class="incident-card">
    <div class="incident-header">
      <span class="incident-title">INCIDENT #2: OWASP Juice Shop SQL Injection & Authentication Bypass</span>
      <span class="badge badge-critical">CRITICAL SEVERITY</span>
    </div>
    <div class="incident-grid">
      <div><strong>Incident ID:</strong> INC-20260830-002</div>
      <div><strong>Timestamp:</strong> 2026-08-30T06:22:15Z</div>
      <div><strong>Source IP:</strong> 194.26.29.112 (Kyiv, UA)</div>
      <div><strong>Target Asset:</strong> 10.0.0.15:80 (web-juiceshop)</div>
      <div><strong>Event Type:</strong> HTTP_REQUEST (SQL Injection)</div>
      <div><strong>MITRE Technique:</strong> T1190 (Exploit Public-Facing Application)</div>
    </div>
    <p><strong>Raw Evidence Log:</strong></p>
    <pre>194.26.29.112 - - [30/Aug/2026:06:22:10 +0000] "GET /rest/products/search?q=' UNION SELECT id, email, password FROM Users -- HTTP/1.1" 500 1204
194.26.29.112 - - [30/Aug/2026:06:22:15 +0000] "POST /rest/user/login?email=' OR '1'='1' -- HTTP/1.1" 200 450</pre>
    <p><strong>Forensic Analysis:</strong> Adversary probed search endpoints for database structure via Union-based SQLi (HTTP 500), then bypassed login logic with <code>' OR '1'='1' --</code> resulting in an unauthorized session token (HTTP 200).</p>
    <p><strong>Containment Action:</strong> Parameterized all database queries via Prepared Statements, activated WAF SQLi filter rules, and invalidated active session tokens.</p>
  </div>

  <!-- Incident 3 -->
  <div class="incident-card high">
    <div class="incident-header">
      <span class="incident-title">INCIDENT #3: High-Entropy DNS Covert Exfiltration Tunnel</span>
      <span class="badge badge-high">HIGH SEVERITY</span>
    </div>
    <div class="incident-grid">
      <div><strong>Incident ID:</strong> INC-20260830-003</div>
      <div><strong>Timestamp:</strong> 2026-08-30T06:24:45Z</div>
      <div><strong>Source IP:</strong> 91.240.118.172 (Amsterdam, NL)</div>
      <div><strong>Target Asset:</strong> 10.0.0.1:53 (Internal DNS Gateway)</div>
      <div><strong>Event Type:</strong> DNS_QUERY (Tunneling Exfiltration)</div>
      <div><strong>MITRE Technique:</strong> T1071.004 (DNS Protocol C2)</div>
    </div>
    <p><strong>Raw Evidence Log:</strong></p>
    <pre>DNS Query: 4a6566666572736f6e2d5365637265742d44617461.tunnel.c2-adversary.com (Type TXT, Entropy: 4.12)
DNS Query: 50617373776f7264732d44756d702d32303236.tunnel.c2-adversary.com (Type TXT, Entropy: 4.05)</pre>
    <p><strong>Forensic Analysis:</strong> Data exfiltration tool encoded credentials in hex-encoded subdomains. Shannon entropy score of 4.12 confirmed non-natural domain structure.</p>
    <p><strong>Containment Action:</strong> Enabled DNS sinkholing on internal resolver for <code>*.c2-adversary.com</code> and quarantined compromised host.</p>
  </div>

  <!-- Incident 4 -->
  <div class="incident-card medium">
    <div class="incident-header">
      <span class="incident-title">INCIDENT #4: Nmap Stealth TCP SYN Reconnaissance Probe</span>
      <span class="badge badge-medium">MEDIUM SEVERITY</span>
    </div>
    <div class="incident-grid">
      <div><strong>Incident ID:</strong> INC-20260830-004</div>
      <div><strong>Timestamp:</strong> 2026-08-30T06:25:04Z</div>
      <div><strong>Source IP:</strong> 91.240.118.172 (Amsterdam, NL)</div>
      <div><strong>Target Asset:</strong> 10.0.0.15 (Ports 21, 22, 80, 443, 3306)</div>
      <div><strong>Event Type:</strong> PORT_PROBE (TCP SYN Stealth Scan)</div>
      <div><strong>MITRE Technique:</strong> T1046 (Network Service Discovery)</div>
    </div>
    <p><strong>Raw Evidence Log:</strong></p>
    <pre>{"timestamp":"2026-08-30T06:25:00Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":21,"protocol":"TCP","event_type":"PORT_PROBE"}
{"timestamp":"2026-08-30T06:25:01Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":22,"protocol":"TCP","event_type":"PORT_PROBE"}
{"timestamp":"2026-08-30T06:25:04Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":3306,"protocol":"TCP","event_type":"PORT_PROBE"}</pre>
    <p><strong>Forensic Analysis:</strong> Rapid sequential TCP SYN scans probed 5 common ports in 4 seconds to identify running services prior to targeted exploitation.</p>
    <p><strong>Containment Action:</strong> Enforced silent drop of external TCP SYN probes on perimeter firewall and closed non-essential ports.</p>
  </div>

  <!-- Section 6 -->
  <h2>6. Strategic SOC Recommendations</h2>
  <ul>
    <li><strong>Zero-Trust Network Segmentation:</strong> Enforce strict firewall boundaries isolating internal databases and bastion hosts from public DMZ zones.</li>
    <li><strong>Automated Incident Response (SOAR):</strong> Trigger automatic perimeter IP blacklisting and host VLAN isolation upon multi-alert correlation to reduce MTTR under 500ms.</li>
    <li><strong>DNS Inspection Firewall:</strong> Deploy deep packet inspection filters on internal DNS gateways to immediately block queries exceeding entropy thresholds (&gt; 3.8).</li>
    <li><strong>WAF Defense-in-Depth:</strong> Place managed Web Application Firewalls in front of all web applications to inspect and sanitize SQLi and XSS payloads.</li>
  </ul>

  <!-- Signature Footer -->
  <div class="footer-auth">
    <div>REPORT AUTHORIZATION: SEC-OPS // INCIDENT COMMAND</div>
    <div>CRYPTOGRAPHIC HASH: e4b2f8a190c4d71e98a3b5c8</div>
    <div>STATUS: RESOLVED & CONTAINED</div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('Launching headless browser for PDF generation...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  console.log('Rendering PDF to:', outputPdfPath);
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log('PDF Report generated successfully!');
  process.exit(0);
}

generatePdf().catch(err => {
  console.error('Error generating PDF report:', err);
  process.exit(1);
});
