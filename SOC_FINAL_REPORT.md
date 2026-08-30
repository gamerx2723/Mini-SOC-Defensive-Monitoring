# 🛡️ SOC X — Mini Security Operations Center (SOC) Final Defensive Monitoring Report

**Document Title**: Mini-SOC Defensive Cybersecurity Telemetry & Threat Monitoring Report  
**Author**: Cybersecurity Defense & SIEM Engineering Operations Team  
**Classification**: TLP:AMBER // Internal SOC Operations  
**Platform Version**: SOC X v2.0 (Executive 3D Cyber Edition)  
**Date**: August 30, 2026  

---

## 1. Executive Summary
This document provides the formal incident investigation, architecture breakdown, and detection engineering report for the **SOC X Defensive Monitoring System**. The platform was deployed across an isolated virtual lab environment to monitor network traffic, authentication attempts, web application interaction, and DNS protocol integrity.

During the monitoring window, multiple multi-stage cyber attack campaigns were simulated and analyzed using authorized security tools (Kali Linux, Hydra, Nmap, SQLmap, and Iodine) targeting vulnerable laboratory assets (Bastion Gateway, Web DMZ, OWASP Juice Shop, and DVWA). The SOC X behavioral correlation engine successfully intercepted, categorized, mapped to MITRE ATT&CK, and triaged all malicious operations.

---

## 2. Lab Architecture & Network Topology

The monitored laboratory infrastructure is partitioned into three isolated security zones configured with virtualized firewalls and host-based telemetry agents:

```
                                [ EXTERNAL ADVERSARY ]
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
```

### Lab Nodes & Roles:
| Hostname | IP Address | OS / Image | Services / Exposed Ports | Role |
| :--- | :--- | :--- | :--- | :--- |
| `gw-perimeter` | `10.0.0.1` | pfSense / FreeBSD | 80/TCP, 443/TCP, 53/UDP | Perimeter Firewall & DNS Gateway |
| `web-juiceshop` | `10.0.0.15` | Ubuntu 22.04 LTS | 80/TCP (HTTP), 3000/TCP (Juice Shop) | Public Web Application & Exploit Target |
| `auth-bastion` | `10.0.0.22` | Debian 12 | 22/TCP (OpenSSH), 389/TCP (LDAP) | Central Authentication & Jump Host |
| `db-cluster` | `10.0.0.30` | PostgreSQL 16 | 5432/TCP (Database Backend) | Enterprise Customer Database |
| `soc-core` | `10.0.0.99` | SOC X SIEM Daemon | 9000/TCP (Web HUD), 514/UDP (Syslog) | Telemetry Collector & Threat Engine |

---

## 3. Security Tools & Technologies

| Tool / Environment | Version / Release | Operational Purpose in Lab |
| :--- | :--- | :--- |
| **Kali Linux** | 2024.1 Rolling | Red-team penetration testing platform used to execute controlled attacks. |
| **Hydra** | v9.5 | High-speed dictionary brute-force utility against SSH/auth services. |
| **Nmap** | v7.94 | Network scanner used for stealth TCP SYN port scans (`-sS`) & service discovery. |
| **Wireshark / TShark** | v4.2.2 | Packet capture and deep protocol analysis for DNS exfiltration and HTTP headers. |
| **OWASP Juice Shop** | v15.0.0 | Controlled intentionally vulnerable NodeJS web application for SQLi/XSS testing. |
| **DVWA** | v1.10 | PHP/MySQL vulnerable web application for credential stuffing and traversal testing. |
| **SOC X Engine** | v2.0 | Real-time sliding-window correlation engine with MITRE ATT&CK rule matrix. |

---

## 4. Telemetry Data Sources & Ingestion Pipelines

1. **Authentication & Syslog Telemetry (`/var/log/auth.log`)**:
   - Ingests SSH, PAM, and sudo log records formatted in standard BSD syslog RFC 3164.
   - Monitors failed authentication codes (`sshd: Failed password for invalid user <name> from <ip>`).
2. **Web Server Access Logs (`/var/log/nginx/access.log`)**:
   - Ingests combined Nginx/Apache format logs including HTTP method, URI query parameters, response status codes, and user-agent strings.
3. **DNS Query & Server Logs (BIND9 / Unbound Query Log)**:
   - Ingests all outbound DNS requests, resolving domain names, entropy values, and query types (`A`, `TXT`, `CNAME`).
4. **Perimeter Firewall NetFlow & Connection Probes**:
   - Ingests TCP SYN flag connection logs, port-destination counters, and ICMP sweep telemetry.

---

## 5. Threat Detection Methodology & Correlation Rules

The SOC X detection engine employs sliding-window thresholding and statistical anomaly analysis:

```
               ┌────────────────────────────────────────────────────────┐
               │              RAW MULTI-SOURCE LOG STREAM              │
               │   (Syslog, Nginx Access, DNS Queries, Firewall SYN)    │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │               UNIVERSAL PARSING PIPELINE               │
               │  - Normalized Log Schema (Timestamp, IP, Proto, Event) │
               │  - Shannon Entropy Calculation on Domain Names         │
               │  - GeoIP Enrichment & Heuristic Payload Categorization │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │             SLIDING-WINDOW SIEM CORRELATION            │
               │  - Brute Force: ≥3 Auth Failures per IP in 60s window  │
               │  - Port Scan: Probes to ≥3 Distinct Ports per IP in 30s│
               │  - Web Injection: SQLi Regex / XSS Script Signatures   │
               │  - DNS Tunneling: Query Length >35 chars & Entropy >3.8│
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │             ACTIONABLE INCIDENT GENERATION             │
               │   - Alert ID, Severity, MITRE TTP, Remediation SOP     │
               └────────────────────────────────────────────────────────┘
```

### Active Detection Rules Matrix:
1. **Rule ID `RULE-001` — Multi-Attempt Authentication Brute-Force**:
   - **Condition**: $\ge 3$ failed login events (`AUTH_FAILED`) from identical source IP within 60 seconds.
   - **MITRE ATT&CK**: T1110.001 (Password Guessing).
2. **Rule ID `RULE-002` — Sequential Port Scanning & Perimeter Recon**:
   - **Condition**: $\ge 3$ connection attempts across distinct destination ports from one source IP within 30 seconds.
   - **MITRE ATT&CK**: T1046 (Network Service Discovery).
3. **Rule ID `RULE-003` — SQL Injection Attack on Web Application**:
   - **Condition**: Detection of SQL syntax strings (`UNION SELECT`, `' OR '1'='1`, `information_schema`, `--`) in HTTP requests.
   - **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application).
4. **Rule ID `RULE-004` — DNS Data Exfiltration & Covert Channel Tunneling**:
   - **Condition**: Outbound DNS queries with subdomains $> 35$ characters and Shannon Entropy $> 3.8$.
   - **MITRE ATT&CK**: T1071.004 (Application Layer Protocol: DNS).

---

## 6. Comprehensive Incident Dossiers & Forensic Reports

### Incident Report #1: Distributed SSH Brute-Force Campaign
- **Incident ID**: `INC-20260830-001`
- **Date/Time**: `2026-08-30T06:20:05Z`
- **Source IP**: `185.220.101.5` (Frankfurt, Germany — Tor Exit Relay)
- **Target Host/Port**: `10.0.0.22:22` (`auth-bastion`)
- **Event Classification**: `AUTH_FAILED` (High-Frequency Credential Stuffing)
- **Severity**: 🔴 **CRITICAL**
- **Evidence**:
  ```text
  Aug 30 06:20:01 auth-bastion sshd[3412]: Failed password for invalid user root from 185.220.101.5 port 48122 ssh2
  Aug 30 06:20:02 auth-bastion sshd[3415]: Failed password for invalid user admin from 185.220.101.5 port 48124 ssh2
  Aug 30 06:20:03 auth-bastion sshd[3418]: Failed password for invalid user administrator from 185.220.101.5 port 48126 ssh2
  Aug 30 06:20:04 auth-bastion sshd[3420]: Failed password for invalid user support from 185.220.101.5 port 48128 ssh2
  ```
- **Forensic Analysis**: The adversary utilized Kali Linux Hydra automated dictionary tooling to iterate administrative usernames against SSH port 22. Four failed authentication attempts occurred inside a 4-second window.
- **Recommended Mitigation**:
  1. Enforce automatic IP blacklisting on perimeter firewall for `185.220.101.5`.
  2. Implement SSH key-only authentication; disable password authentication (`PasswordAuthentication no`).
  3. Deploy `fail2ban` with maximum 3 retry attempts before a 24-hour jail drop.

---

### Incident Report #2: OWASP Juice Shop SQL Injection & Bypass
- **Incident ID**: `INC-20260830-002`
- **Date/Time**: `2026-08-30T06:22:15Z`
- **Source IP**: `194.26.29.112` (Kyiv, Ukraine)
- **Target Host/Port**: `10.0.0.15:80` (`web-juiceshop` / `/rest/products/search`)
- **Event Classification**: `HTTP_REQUEST` (SQL Injection & Data Extraction)
- **Severity**: 🔴 **CRITICAL**
- **Evidence**:
  ```text
  194.26.29.112 - - [30/Aug/2026:06:22:10 +0000] "GET /rest/products/search?q=' UNION SELECT id, email, password FROM Users -- HTTP/1.1" 500 1204
  194.26.29.112 - - [30/Aug/2026:06:22:15 +0000] "POST /rest/user/login?email=' OR '1'='1' -- HTTP/1.1" 200 450
  ```
- **Forensic Analysis**: Adversary executed Union-based SQL injection against product catalog search, resulting in a database schema error (HTTP 500), followed by an authentication bypass payload (`' OR '1'='1' --`) resulting in unauthorized session establishment (HTTP 200).
- **Recommended Mitigation**:
  1. Migrate all database queries to Parameterized Prepared Statements / ORM queries.
  2. Deploy Web Application Firewall (WAF) rule group targeting SQLi string structures.
  3. Invalidate current active session tokens for the compromised web application.

---

### Incident Report #3: High-Entropy DNS Data Exfiltration Tunnel
- **Incident ID**: `INC-20260830-003`
- **Date/Time**: `2026-08-30T06:24:45Z`
- **Source IP**: `91.240.118.172` (Amsterdam, Netherlands)
- **Target Host/Port**: `10.0.0.1:53` (`gw-perimeter` Internal DNS Resolver)
- **Event Classification**: `DNS_QUERY` (Covert C2 Tunneling / Exfiltration)
- **Severity**: 🟠 **HIGH**
- **Evidence**:
  ```text
  DNS Query: 4a6566666572736f6e2d5365637265742d44617461.tunnel.c2-adversary.com (Type TXT, Entropy: 4.12)
  DNS Query: 50617373776f7264732d44756d702d32303236.tunnel.c2-adversary.com (Type TXT, Entropy: 4.05)
  ```
- **Forensic Analysis**: Adversary established a DNS covert tunnel transmitting hex/base64 encoded database credentials chunked into subdomains. The Shannon entropy score of 4.12 significantly exceeds the baseline normal domain threshold (2.8).
- **Recommended Mitigation**:
  1. Configure DNS sinkholing on internal resolver for `*.c2-adversary.com`.
  2. Implement DNS Inspection filtering to block queries with subdomains $> 35$ characters and entropy $> 3.8$.
  3. Isolate compromised workstation host initiating outbound exfiltration queries.

---

### Incident Report #4: Stealth SYN Reconnaissance & Port Probe
- **Incident ID**: `INC-20260830-004`
- **Date/Time**: `2026-08-30T06:25:04Z`
- **Source IP**: `91.240.118.172` (Amsterdam, Netherlands)
- **Target Host/Port**: `10.0.0.15` (Ports 21, 22, 80, 443, 3306)
- **Event Classification**: `PORT_PROBE` (TCP SYN Stealth Scan)
- **Severity**: 🟡 **MEDIUM**
- **Evidence**:
  ```json
  {"timestamp":"2026-08-30T06:25:00Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":21,"protocol":"TCP","event_type":"PORT_PROBE"}
  {"timestamp":"2026-08-30T06:25:01Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":22,"protocol":"TCP","event_type":"PORT_PROBE"}
  {"timestamp":"2026-08-30T06:25:04Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":3306,"protocol":"TCP","event_type":"PORT_PROBE"}
  ```
- **Forensic Analysis**: Rapid automated scanning tool (Nmap SYN scan) surveyed 5 common ports across 4 seconds to map exposed services before targeted exploitation.
- **Recommended Mitigation**:
  1. Drop all unsolicited external TCP SYN probes on perimeter firewall.
  2. Close non-essential ports (21/FTP, 3306/MySQL) from public subnet exposure.

---

## 7. Key Findings & SOC Defense Recommendations

1. **Zero-Trust Network Segmentation**:
   - Database clusters and internal bastion hosts should never reside in the same layer as public web interfaces. Ensure strict firewall ACLs isolate VLAN 10.0.0.0/24.
2. **Automated Incident Response Playbooks**:
   - Integrate automated containment triggers (firewall IP blacklist injection and quarantine VLAN routing) to reduce Mean Time to Respond (MTTR) from minutes to under 500 milliseconds.
3. **Comprehensive Logging & Centralized SIEM Retention**:
   - Maintain centralized log aggregation with tamper-proof log forwarding over TLS to preserve evidentiary integrity for forensic audits.

---

**Report Authorized By**: SOC X Lead Incident Commander  
**Signature**: `SEC-OPS//VERIFIED-2026-08-30`
