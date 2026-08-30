<div align="center">

# 🛡️ SOC X — Defensive Security Operations Center & SIEM

### *Executive 3D Cyber Threat Monitoring & Incident Response Platform*

[![GitHub Stars](https://img.shields.io/github/stars/gamerx2723/Mini-SOC-Defensive-Monitoring?style=for-the-badge&color=d4af37&logo=github)](https://github.com/gamerx2723/Mini-SOC-Defensive-Monitoring)
[![License](https://img.shields.io/badge/License-MIT-e2e8f0?style=for-the-badge&logo=opensourceinitiative&logoColor=black)](LICENSE)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-Mapped%20v14.1-ff3366?style=for-the-badge&logo=target)](https://attack.mitre.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Visualizers-f5d77f?style=for-the-badge&logo=three.js&logoColor=black)](https://threejs.org/)
[![React 18](https://img.shields.io/badge/React%2018-TypeScript-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Status](https://img.shields.io/badge/Status-Operational%20v2.0-10b981?style=for-the-badge&logo=statuspage)](http://localhost:3000/)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=3000&pause=1000&color=D4AF37&center=true&vCenter=true&width=750&lines=DEFENSIVE+CYBERSECURITY+TELEMETRY+ANALYZER;REAL-TIME+SLIDING-WINDOW+THREAT+CORRELATION;INTERACTIVE+3D+THREAT+GLOBE+%26+ASSET+TOPOLOGY;KALI+LINUX+RED-TEAM+ATTACK+SIMULATION+BURSTS;AUTOMATED+INCIDENT+RESPONSE+CONTAINMENT+PLAYBOOKS" alt="Typing Banner" />

<br/>

---

### 🌐 [Live Local Deployment](http://localhost:3000/) &bull; 📑 [Formal SOC Final Report](SOC_FINAL_REPORT.md) &bull; 🎨 [Design System Blueprint](FRONTEND_DESIGN_SYSTEM.md)

---

</div>

<br/>

## 📸 System Interface & Command Center Preview

<div align="center">

### 🪐 3D Executive Command Center Overview
![SOC X Command Center Overview](UI%20Screenshots/01_SOC_X_Command_Center_Overview.png)

</div>

<br/>

## 🎯 Platform Highlights

```
⚜️ LUXURY STEALTH PALETTE     Black (#040407) • Metallic Silver (#e2e8f0) • Champagne Gold (#d4af37)
🌌 ACTIVE BACKGROUND          HTML5 Canvas Particle Constellation with Dynamic Mouse Proximity Linkage
🎯 CUSTOM DUAL CYBER CURSOR   Precision Gold Dot + Lerp-Smoothed Trailing Magnetic Ring
🔮 3D GLOBAL THREAT GLOBE     Interactive Three.js Wireframe Sphere with Ballistic Geo Attack Arcs
🛡️ 3D ASSET DEFENSE GRID      Three.js DMZ & Internal Cluster Mesh with Pulsing Host Halos
⚡ SLIDING-WINDOW SIEM        Real-time Correlation Engine mapped directly to MITRE ATT&CK Matrix
🧪 KALI ATTACK SIMULATOR      Red-Team Burst Injector (Hydra SSH, Nmap SYN, Juice Shop SQLi, DNS Tunnel)
🚨 INCIDENT CONTAINMENT       Automated SOAR-style Response Actions (Firewall IP Drop, Host Isolation)
```

---

## 📸 Multi-Screen Telemetry Suite

<div align="center">

| 3D Network Topology Grid | Live Event Stream & Forensics |
| :---: | :---: |
| ![Asset Defense Grid](UI%20Screenshots/04_Asset_Defense_Grid_Topology.png) | ![Event Timeline Stream](UI%20Screenshots/02_Live_Event_Timeline_Stream.png) |

| Web Application (OWASP) & DNS Exfiltration | Kali Red-Team Attack Simulator |
| :---: | :---: |
| ![HTTP and DNS Forensics](UI%20Screenshots/03_HTTP_and_DNS_Security_Forensics.png) | ![Kali Attack Simulator](UI%20Screenshots/05_Kali_RedTeam_Attack_Simulator_Modal.png) |

| Universal Log Ingestion Parser | Incident Response Containment Playbook |
| :---: | :---: |
| ![Log Ingestion Parser](UI%20Screenshots/06_Raw_Log_Ingestion_Universal_Parser_Modal.png) | ![Incident Containment Playbook](UI%20Screenshots/07_Incident_Response_Containment_Playbook_Modal.png) |

</div>

---

## 🏛️ Lab Architecture & Network Topology

The monitored laboratory infrastructure is partitioned into three isolated security zones with host telemetry collectors and firewall inspection gateways:

```
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
```

---

## 🔍 Correlation Engine & MITRE ATT&CK Matrix

SOC X continuously correlates raw syslog, web access, DNS query, and firewall NetFlow streams against automated behavioral rules:

| Rule ID | Threat Detection Vector | Trigger Condition | MITRE ATT&CK Technique |
| :--- | :--- | :--- | :--- |
| `RULE-001` | **Authentication Brute-Force** | $\ge 3$ `AUTH_FAILED` events from 1 IP in 60s | **T1110.001** (Password Guessing) |
| `RULE-002` | **Sequential Port Scanning** | Probes to $\ge 3$ distinct destination ports in 30s | **T1046** (Network Service Discovery) |
| `RULE-003` | **SQL Injection / Web Exploit** | SQL syntax (`UNION SELECT`, `' OR '1'='1'`) in HTTP | **T1190** (Exploit Public-Facing App) |
| `RULE-004` | **DNS Covert Exfiltration** | Subdomain $>35$ chars & Shannon Entropy $>3.8$ | **T1071.004** (DNS Protocol C2) |

---

## 🛠️ Security Tool Integrations

- **Kali Linux 2024.1**: Integrated Red-Team scenario trigger suite.
- **Hydra v9.5**: Dictionary credential attacks against SSH bastion port 22.
- **Nmap v7.94**: Stealth TCP SYN port sweep across subnet assets.
- **Wireshark / TShark**: Packet-level payload inspection and forensic hex viewer.
- **OWASP Juice Shop & DVWA**: Intentionally vulnerable web applications monitored for injection vectors.
- **SOC X SIEM**: Real-time sliding-window stream processor with sub-millisecond alert correlation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- NPM (v9.0.0 or higher)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/gamerx2723/Mini-SOC-Defensive-Monitoring.git

# 2. Enter project root
cd Mini-SOC-Defensive-Monitoring

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build production bundle
npm run build
```

The application will be accessible at `http://localhost:3000/`.

---

## 📁 Repository Structure

```
Mini-SOC-Defensive-Monitoring/
├── README.md                         # Animated GitHub showcase with architecture & screenshots
├── SOC_FINAL_REPORT.md               # Formal cybersecurity monitoring report & incident dossiers
├── FRONTEND_DESIGN_SYSTEM.md         # Design system blueprint for UI replication
├── MEMORY.md                         # Append-only chronological memory log
├── PROJECT_STATE.md                  # Comprehensive technical reference manual
├── UI Screenshots/                   # Full-resolution 1920x1080 PNG gallery (9 screens)
├── index.html                        # HTML entry with luxury typography
├── src/
│   ├── main.tsx                      # React root entry
│   ├── App.tsx                       # SOC X Command Center orchestrator
│   ├── index.css                     # Standalone Vanilla CSS luxury design system
│   ├── types/soc.ts                  # TypeScript models for telemetry & SIEM alerts
│   ├── engine/
│   │   ├── detectionEngine.ts        # Correlation algorithms & MITRE rule engine
│   │   ├── logParser.ts              # Universal multi-format log parser
│   │   └── sampleDataGenerator.ts    # Synthetic security event generator
│   └── components/
│       ├── CustomCursor.tsx          # Dual-layer magnetic cyber cursor
│       ├── InteractiveBackground.tsx # HTML5 Canvas particle constellation
│       ├── Header.tsx                # Status bar & executive threat gauge
│       ├── MetricsOverview.tsx       # 5 core glassmorphic executive metric cards
│       ├── ThreeGlobe.tsx            # Three.js 3D Threat Globe
│       ├── ThreeTopology.tsx         # Three.js 3D Defense Grid
│       ├── SecurityAnalysisPanel.tsx # Threat detection & active rule matrix
│       ├── EventTimeline.tsx         # Real-time event stream & forensic inspector
│       ├── HttpDnsInspector.tsx      # HTTP & DNS protocol deep-dive diagnostics
│       ├── TopEntities.tsx           # Threat origin IPs & targeted user accounts
│       ├── AttackSimulatorModal.tsx  # Kali Red-Team attack injection suite
│       ├── LogIngestionModal.tsx     # Custom raw log ingestion modal
│       └── IncidentPlaybookModal.tsx # Incident response containment playbooks
```

---

## 📜 Documentation Index

- 📑 **[SOC Final Defensive Monitoring Report](SOC_FINAL_REPORT.md)**: Full lab setup, forensic event breakdowns, and MITRE mitigations.
- 🎨 **[Frontend Design System & Blueprint](FRONTEND_DESIGN_SYSTEM.md)**: Detailed CSS formulas, typography stacks, and Three.js shader guide.
- 📋 **[Project State & Manual](PROJECT_STATE.md)**: Component reference and architecture manual.
- 🧠 **[Append-Only Memory Log](MEMORY.md)**: Complete development history and rollback checkpoints.

---

<div align="center">

**SOC X — Developed for Advanced Defensive Cybersecurity Operations**  
*Maintained by [@gamerx2723](https://github.com/gamerx2723)*

</div>
