# Implementation Plan - Mini Security Operations Center (SOC)

Build a high-level, production-grade Defensive Cybersecurity Monitoring & SIEM Platform (Mini SOC) equipped with real-time threat detection, authorized sample log feeds, attack simulator (Kali/Nmap/Wireshark/OWASP Juice Shop signatures), and a futuristic 3D Cyber HUD dashboard with glassmorphism.

---

## 1. Project Overview & Architecture

### System Stack
- **Frontend & 3D Visualization**:
  - React 18 + Vite + TypeScript
  - **Three.js & Custom Canvas**:
    - **3D Interactive Threat Globe & Arc Network**: Real-time 3D globe visualizing attack origins, destination nodes, and geo-threat vectors with glowing particle rings.
    - **3D Network Topology Map**: Interactive force-directed node visualization showing infected/targeted assets, firewall gates, and SIEM correlators.
    - **Glassmorphism Cyber HUD**: High-end cyberpunk/military-grade SOC design with frosted glass cards, dynamic radar sweep, and customizable alerts.
- **Backend & Detection Engine**:
  - Unified high-speed client/server log correlator with streaming simulation:
    - **Brute-Force & Credential Stuffing Correlator** (windowed sliding scale)
    - **Port Scan & Nmap Pattern Recognizer** (SYN/FIN/Null scans, rapid port delta)
    - **Web Attack Analyzer** (SQLi, XSS, Path Traversal, Juice Shop / DVWA telemetry)
    - **DNS Anomaly Inspector** (DNS Tunneling, DGA entropy analysis, high query bursts)
    - **Threat Intelligence IP Reputation & Geo-location scoring**
- **Log Generator & Lab Integrations**:
  - Pre-built authentic log corpus: Syslog, Auth log (SSH/PAM), Apache/Nginx Web logs, Wireshark/Zeek PCAP logs, Suricata/Snort alerts, Nmap XML/grepable output.
  - Live Interactive **Attack Simulation Console** (Simulate Kali Nmap scans, Hydra Brute-force, OWASP Juice Shop SQLi, DNS Tunneling on-demand).
- **Core Memory & Documentation Files**:
  - `MEMORY.md`: **Append-only** chronological memory log of all capabilities, decisions, and milestones.
  - `PROJECT_STATE.md`: **Live comprehensive reference manual** documenting active file structure, per-file purpose, component roles, detection engine rules, and runtime status.

---

## 2. Key Modules & Features

```
+-------------------------------------------------------------------------------+
|                       MINI SOC DEFENSE COMMAND CENTER                         |
+-------------------------------------------------------------------------------+
| [Header]: System Status, Live Threat Index, WebSocket Pulse, Alert Banner     |
+-------------------------------------------------------------------------------+
| [3D Centerstage]:                                                             |
|   - 3D Interactive Cyber Globe with Attack Vector Arcs & Particle Glow        |
|   - 3D SIEM Asset Topology (Firewall -> DMZ -> Juice Shop -> DB Server)       |
+-------------------------------------------------------------------------------+
| [Metrics Grid]:                                                               |
|   - Total Events | Failed Logins | Auth Success | Suspicious Events | Risk    |
+-------------------------------------------------------------------------------+
| [Security Analysis & Threat Detections]:                                      |
|   - Brute-Force Engine (Hydra / SSH / Web Login)                             |
|   - Web Application Firewall Inspector (OWASP Juice Shop / DVWA exploits)     |
|   - Network & Port Scan Telemetry (Nmap / Wireshark TCP/UDP probes)           |
|   - DNS Anomaly & Exfiltration Detector (DGA / Tunneling)                     |
|   - Threat Intelligence & Suspicious IP Geo-Mapping                           |
+-------------------------------------------------------------------------------+
| [Live Visualizers & Timeline]:                                                |
|   - Real-time Timeline Stream with Filterable Severity (Critical/High/Med/Low)|
|   - Top Source IPs & Target Usernames Bar Visuals                             |
|   - Protocol Activity Distribution (HTTP, DNS, SSH, HTTPS, ICMP)             |
+-------------------------------------------------------------------------------+
| [Tools & Attack Simulator Hub]:                                               |
|   - Ingest Custom Logs (JSON, Syslog, CSV, PCAP summary)                     |
|   - 1-Click Attack Simulator (Nmap Scan, Juice Shop SQLi, Hydra Brute-Force)  |
|   - Incident Triage & Response Playbook Actions                               |
+-------------------------------------------------------------------------------+
```

---

## 3. Proposed File Structure & Document Purposes

```
Code Cryptical IT Innovatives/
├── MEMORY.md                         # [NEW] Append-only record of functionality additions & architectural history
├── PROJECT_STATE.md                  # [NEW] Complete project overview, file tree, document purposes, and tech specs
├── package.json                      # [NEW] Project dependencies & scripts
├── vite.config.ts                    # [NEW] Vite configuration with alias and server setup
├── tsconfig.json                     # [NEW] TypeScript compiler configuration
├── index.html                        # [NEW] HTML entry with Google Orbitron / Inter fonts & cyber styling
├── src/
│   ├── main.tsx                      # [NEW] React entry point
│   ├── App.tsx                       # [NEW] Main SOC Command Center layout & tabs
│   ├── index.css                     # [NEW] Glassmorphism tokens, neon glows, cyber animations, scrollbars
│   ├── types/
│   │   └── soc.ts                    # [NEW] TypeScript interfaces for Logs, Alerts, Metrics, AttackVectors
│   ├── engine/
│   │   ├── detectionEngine.ts        # [NEW] Real-time correlation algorithms (Brute-force, Nmap, SQLi, DNS)
│   │   ├── logParser.ts              # [NEW] Multi-format parser (Syslog, Apache, Nmap, Zeek, Suricata)
│   │   └── sampleDataGenerator.ts    # [NEW] Authentic sample logs and live streaming attack generator
│   ├── components/
│   │   ├── Header.tsx                # [NEW] SOC status, threat index score, live clock, sound toggle
│   │   ├── MetricsOverview.tsx       # [NEW] 5 core metrics with trend sparklines & glass cards
│   │   ├── ThreeGlobe.tsx            # [NEW] 3D Threat Globe with animated attack arcs, ping points, rotations
│   │   ├── ThreeTopology.tsx         # [NEW] 3D Asset Topology visualizer (DMZ, DB, Juice Shop, Gateway)
│   │   ├── SecurityAnalysisPanel.tsx # [NEW] Active threat detection breakdown & rule triggers
│   │   ├── EventTimeline.tsx         # [NEW] Real-time filtering event log stream with details modal
│   │   ├── HttpDnsInspector.tsx      # [NEW] Specialized packet & query breakdown for HTTP/DNS attacks
│   │   ├── TopEntities.tsx           # [NEW] Visual bar rankings of Top Source IPs and Target Usernames
│   │   ├── AttackSimulatorModal.tsx  # [NEW] Attack injection center (Nmap, Hydra, JuiceShop SQLi, DGA)
│   │   ├── LogIngestionModal.tsx     # [NEW] Custom log uploader/paste box with instant parser
│   │   └── IncidentPlaybookModal.tsx # [NEW] SOC Incident Response Playbook (Block IP, Isolate host)
```

---

## 4. Verification & Testing Plan

### Automated / Interactive Validation
1. **Dependency & Build Check**:
   - Install dependencies (`three`, `@types/three`, `lucide-react`, `canvas-confetti`, etc.).
   - Execute `npm run build` or TypeScript compile checks.
2. **Detection Logic Validation**:
   - Test detection of Brute-Force SSH attacks (> 5 failed logins within 60s).
   - Test detection of Nmap port scanning (> 10 ports probed from single IP).
   - Test detection of OWASP Juice Shop SQL Injection (`' OR 1=1 --`) and XSS payload (`<script>`).
   - Test detection of DNS Tunneling (high entropy domain length > 30 chars or excessive TXT queries).
3. **UI/UX & 3D Verification**:
   - Verify 3D Globe renders with smooth 60fps arc animations and geo-location pins.
   - Verify 3D Asset Topology renders interactive nodes.
   - Check responsive glassmorphic cards, glowing borders, and charts.
4. **Documentation Check**:
   - Ensure `MEMORY.md` is populated and strictly kept append-only.
   - Ensure `PROJECT_STATE.md` reflects complete up-to-date documentation.

---

## User Review Required

> [!NOTE]
> All files will be documented in `PROJECT_STATE.md` with their exact roles, and `MEMORY.md` will strictly maintain an append-only timeline of all implemented capabilities.
