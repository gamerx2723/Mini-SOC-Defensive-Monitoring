# Mini Security Operations Center (SOC) - Project State & Architecture

**Last Updated**: 2026-08-30
**System Classification**: Defensive Cybersecurity Monitoring & Threat Detection Platform
**Interface Tier**: Futuristic Glassmorphism 3D Cyber HUD Command Center

---

## 1. Project Overview
The Mini SOC is an enterprise-grade defensive security monitoring and threat correlation platform. It ingests network, server, authentication, and application telemetry in real time, applies behavioral detection rules against modern cyber attack tactics (MITRE ATT&CK mapped), and presents live actionable intelligence via an interactive 3D Cyber Command Center.

---

## 2. Directory & File Structure

```
Code Cryptical IT Innovatives/
├── MEMORY.md                         # Permanent append-only log of all functionality and development decisions
├── PROJECT_STATE.md                  # Comprehensive reference manual for the entire project state and file registry
├── package.json                      # NPM dependencies, scripts, and build configuration
├── vite.config.ts                    # Vite build system configuration with plugins and dev server settings
├── tsconfig.json                     # TypeScript strict mode and path configuration
├── tsconfig.node.json                # TypeScript node configuration for Vite tooling
├── index.html                        # Main HTML entry with Orbitron & Inter Google typography and Cyber styling
├── src/
│   ├── main.tsx                      # React root entry point and error boundaries
│   ├── App.tsx                       # Main SOC Command Center layout, state orchestrator, and real-time feeds
│   ├── index.css                     # Cyberpunk design system, glassmorphism tokens, neon glow shaders, animations
│   ├── types/
│   │   └── soc.ts                    # TypeScript models for Logs, DetectionRules, Alerts, Metrics, AttackVectors
│   ├── engine/
│   │   ├── detectionEngine.ts        # Correlation & threat detection algorithms (Brute-Force, Nmap, SQLi, DNS)
│   │   ├── logParser.ts              # Multi-format parser for Syslog, Apache/Nginx, Nmap, Zeek/Wireshark, Suricata
│   │   └── sampleDataGenerator.ts    # Authentic multi-source security event corpus & streaming attack generator
│   └── components/
│       ├── Header.tsx                # Cyber SOC status bar, real-time threat index gauge, live telemetry clock
│       ├── MetricsOverview.tsx       # 5 core glassmorphism metric cards (Total, Failed, Success, Suspicious, Risk)
│       ├── ThreeGlobe.tsx            # Interactive 3D Threat Globe with animated attack arcs, geo-markers, particle core
│       ├── ThreeTopology.tsx         # 3D Asset Topology visualizer (Firewall, DMZ, Juice Shop, DB, SIEM)
│       ├── SecurityAnalysisPanel.tsx # Security analysis engine status, triggered rules, and threat severity filter
│       ├── EventTimeline.tsx         # Real-time event log stream with search, protocol filters, and raw payload inspect
│       ├── HttpDnsInspector.tsx      # HTTP/DNS deep-dive packet inspection (OWASP & DNS tunneling telemetry)
│       ├── TopEntities.tsx           # Bar rankings for Top Source IPs, Target Usernames, and Port Targets
│       ├── AttackSimulatorModal.tsx  # Kali Linux attack simulation suite (Nmap, Hydra, Juice Shop SQLi, DGA)
│       ├── LogIngestionModal.tsx     # Custom raw log ingestion modal supporting Syslog, Apache, JSON, and PCAP summaries
│       └── IncidentPlaybookModal.tsx # Incident response modal with containment playbooks (Block IP, Host Isolation)
```

---

## 3. Purpose of Every Document & Component

| File / Component | Purpose & Responsibilities |
| :--- | :--- |
| `MEMORY.md` | **Append-only** permanent record of all capabilities, features, and decisions. Never edited backwards. |
| `PROJECT_STATE.md` | Active system documentation, architecture overview, file descriptions, and feature status. |
| `package.json` | Project manifest declaring dependencies (React, Vite, Three.js, Lucide Icons, Canvas utilities). |
| `vite.config.ts` | Configures Vite bundler, React plugin, port configurations, and build optimizations. |
| `tsconfig.json` | Strict TypeScript configuration ensuring strong typing across security log models and 3D scenes. |
| `index.html` | Root web page with Cyberpunk theme colors, favicon, meta security tags, and font definitions. |
| `src/main.tsx` | React 18 bootstrap mounting the root application inside `#root`. |
| `src/App.tsx` | State hub managing log streams, detection alerts, active attack simulations, filters, and active tab views. |
| `src/index.css` | Glassmorphism design tokens (`backdrop-filter`, `rgba(15, 23, 42, 0.75)`), neon borders, radar animation keyframes. |
| `src/types/soc.ts` | Data interfaces for `LogEvent`, `ThreatAlert`, `SecurityRule`, `AssetNode`, `AttackVector`, `SocMetrics`. |
| `src/engine/detectionEngine.ts` | Core SIEM correlation engine executing behavioral rules (Brute-Force, Port Scans, SQLi/XSS, DNS Tunneling). |
| `src/engine/logParser.ts` | Ingestion engine transforming raw Syslog, Apache, Nmap XML/text, Suricata, and JSON into standard `LogEvent` objects. |
| `src/engine/sampleDataGenerator.ts` | Generates realistic authorized lab telemetry (Kali Nmap, Hydra SSH, Juice Shop, DVWA, Suricata alerts). |
| `src/components/Header.tsx` | Displays command center status, threat level radar, active stream status, and time synchronization. |
| `src/components/MetricsOverview.tsx` | Displays Total Events, Failed Logins, Successful Logins, Suspicious Events, and Threat Index Score. |
| `src/components/ThreeGlobe.tsx` | Three.js powered 3D globe with real-time ballistic curve arcs showing cyber attacks traveling across global coordinates. |
| `src/components/ThreeTopology.tsx` | Three.js 3D network topology visualization showing security zones (WAN, Firewall, DMZ, LAN, DB). |
| `src/components/SecurityAnalysisPanel.tsx` | Displays active alerts, rule triggers, MITRE ATT&CK mapping, and threat confidence scores. |
| `src/components/EventTimeline.tsx` | Chronological interactive event table with instant search, severity filtering, and JSON inspector. |
| `src/components/HttpDnsInspector.tsx` | Special diagnostic pane showing HTTP attack signatures (Juice Shop / DVWA) and DNS tunneling entropy scores. |
| `src/components/TopEntities.tsx` | Visual analytics rankings for Top 5 Attacker IPs, Top Target Usernames, and Most Attacked Ports. |
| `src/components/AttackSimulatorModal.tsx` | Interactive tool allowing users to simulate Kali Linux attacks (Nmap, Hydra, SQLmap, DNS Tunnel) live. |
| `src/components/LogIngestionModal.tsx` | Allows operators to paste or upload custom logs (Syslog, Apache, Nmap, JSON) for instant parsing & analysis. |
| `src/components/IncidentPlaybookModal.tsx` | Enables defensive triage and containment actions (IP Blacklisting, Port Lockdown, Host Isolation). |

---

## 4. Detection Rules & MITRE ATT&CK Matrix

1. **Brute-Force & Credential Stuffing (T1110)**:
   - Threshold: $\ge 5$ failed authentication attempts within 60 seconds against SSH, RDP, or Web Login from a single IP.
2. **Repeated Authentication Failures (T1078)**:
   - Multi-account spray detection from single IP or single account targeted by multiple IPs.
3. **Suspicious HTTP Requests (T1190 - Exploit Public-Facing Application)**:
   - SQL Injection patterns (`UNION SELECT`, `' OR '1'='1`, `sleep(5)`).
   - Cross-Site Scripting (`<script>`, `onerror=alert()`, `javascript:`).
   - Path Traversal & LFI/RFI (`../../etc/passwd`, `win.ini`).
   - OWASP Juice Shop / DVWA exploit signatures (`/rest/user/login`, `/api/Feedbacks`).
4. **Unusual DNS Activity (T1071.004 - DNS Exfiltration / Tunneling)**:
   - High Shannon Entropy in subdomains ($> 3.8$).
   - Abnormally long domain query names ($> 35$ characters).
   - High volume TXT/NULL record queries per second.
5. **Port Scanning & Reconnaissance (T1046 - Network Service Discovery)**:
   - Rapid sequential or distributed port probing (Nmap SYN `-sS`, FIN `-sF`, NULL `-sN`, OS Detection `-O`).
6. **Suspicious Source IP Activity (T1595 - Active Scanning)**:
   - Geo-anomaly detection, known malicious IP blacklists, and anomalous protocol distribution.
