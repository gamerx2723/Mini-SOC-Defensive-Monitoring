import React, { useState, useEffect, useMemo } from 'react';
import { LogEvent, ThreatAlert, SocMetrics, SecurityRule, AssetNode, AttackVectorArc } from './types/soc';
import { DEFAULT_SECURITY_RULES, correlateEvents } from './engine/detectionEngine';
import { generateInitialCorpus, generateAttackBurst, generateAttackArcs, INITIAL_ASSET_NODES } from './engine/sampleDataGenerator';

import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { ThreeGlobe } from './components/ThreeGlobe';
import { ThreeTopology } from './components/ThreeTopology';
import { SecurityAnalysisPanel } from './components/SecurityAnalysisPanel';
import { EventTimeline } from './components/EventTimeline';
import { HttpDnsInspector } from './components/HttpDnsInspector';
import { TopEntities } from './components/TopEntities';
import { AttackSimulatorModal } from './components/AttackSimulatorModal';
import { LogIngestionModal } from './components/LogIngestionModal';
import { IncidentPlaybookModal } from './components/IncidentPlaybookModal';

import { Shield, Globe2, Network, Terminal, Radio, Sliders, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Primary Security Telemetry State
  const [events, setEvents] = useState<LogEvent[]>(() => generateInitialCorpus(40));
  const [rules, setRules] = useState<SecurityRule[]>(DEFAULT_SECURITY_RULES);
  const [assets, setAssets] = useState<AssetNode[]>(INITIAL_ASSET_NODES);
  const [isStreaming, setIsStreaming] = useState(true);

  // 2. Active Tab & Modals State
  const [activeTab, setActiveTab] = useState<'COMMAND_CENTER' | 'EVENT_STREAM' | 'HTTP_DNS' | 'TOPOLOGY'>('COMMAND_CENTER');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [selectedPlaybookAlert, setSelectedPlaybookAlert] = useState<ThreatAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3. SIEM Correlation & Alert Generation
  const alerts: ThreatAlert[] = useMemo(() => {
    return correlateEvents(events);
  }, [events]);

  // Update Detection Rules Trigger Counts based on correlated alerts
  useEffect(() => {
    setRules(prevRules => {
      return prevRules.map(rule => {
        const matchingAlerts = alerts.filter(a => a.category === rule.category);
        return {
          ...rule,
          triggerCount: matchingAlerts.reduce((acc, a) => acc + a.evidenceCount, 0)
        };
      });
    });
  }, [alerts]);

  // 4. Calculate Aggregate SOC Metrics
  const metrics: SocMetrics = useMemo(() => {
    let failedLogins = 0;
    let successfulLogins = 0;
    let suspiciousEvents = 0;
    let httpTotal = 0;
    let httpSuspicious = 0;
    let dnsTotal = 0;
    let dnsSuspicious = 0;
    let portScansDetected = 0;
    let bruteForceIncidents = 0;

    events.forEach(e => {
      if (e.eventType === 'AUTH_FAILED') failedLogins++;
      if (e.eventType === 'AUTH_SUCCESS') successfulLogins++;
      if (e.isSuspicious) suspiciousEvents++;
      if (e.protocol === 'HTTP' || e.protocol === 'HTTPS') {
        httpTotal++;
        if (e.isSuspicious) httpSuspicious++;
      }
      if (e.protocol === 'DNS') {
        dnsTotal++;
        if (e.isSuspicious) dnsSuspicious++;
      }
      if (e.category === 'port_scan') portScansDetected++;
      if (e.category === 'brute_force') bruteForceIncidents++;
    });

    // Threat Index formula (0 to 100)
    const baseScore = Math.min(60, alerts.length * 15);
    const criticalBonus = alerts.filter(a => a.severity === 'critical').length * 20;
    const suspiciousBonus = Math.min(20, Math.floor(suspiciousEvents * 0.8));
    const threatIndexScore = Math.min(100, Math.max(12, baseScore + criticalBonus + suspiciousBonus));

    return {
      totalEvents: events.length,
      failedLogins,
      successfulLogins,
      suspiciousEvents,
      activeThreatCount: alerts.length,
      threatIndexScore,
      httpTotal,
      httpSuspicious,
      dnsTotal,
      dnsSuspicious,
      portScansDetected,
      bruteForceIncidents
    };
  }, [events, alerts]);

  // 5. Generate Dynamic 3D Attack Arcs
  const attackArcs: AttackVectorArc[] = useMemo(() => {
    return generateAttackArcs(events);
  }, [events]);

  // 6. Live Streaming Traffic Generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Randomly inject legitimate background activity or occasional anomalous probe
      const isProbe = Math.random() < 0.25;
      const now = new Date().toISOString();

      if (isProbe) {
        // Mild random scan probe
        const probePorts = [80, 443, 22, 3306, 8080, 53];
        const p = probePorts[Math.floor(Math.random() * probePorts.length)];
        const newEvent: LogEvent = {
          id: `EVT-AUTO-${Date.now()}`,
          timestamp: now,
          sourceIp: '185.220.101.5',
          destinationIp: '10.0.0.15',
          destinationPort: p,
          protocol: 'TCP',
          eventType: 'PORT_PROBE',
          status: 'ALERT',
          severity: 'medium',
          category: 'port_scan',
          rawPayload: `TCP SYN probe from 185.220.101.5:41203 -> 10.0.0.15:${p}`,
          details: { portScanType: 'SYN_STEALTH', toolSignature: 'Nmap' },
          geo: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.11, lng: 8.68 },
          isSuspicious: true
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 199)]);
      } else {
        // Normal legitimate web or auth event
        const isAuth = Math.random() < 0.3;
        const newEvent: LogEvent = {
          id: `EVT-AUTO-${Date.now()}`,
          timestamp: now,
          sourceIp: '10.0.1.45',
          destinationIp: isAuth ? '10.0.0.22' : '10.0.0.15',
          destinationPort: isAuth ? 22 : 443,
          protocol: isAuth ? 'SSH' : 'HTTPS',
          eventType: isAuth ? 'AUTH_SUCCESS' : 'HTTP_REQUEST',
          username: 'alice.dev',
          status: 'SUCCESS',
          severity: 'info',
          category: 'normal_traffic',
          rawPayload: isAuth ? 'Accepted key for alice.dev' : 'GET /static/bundle.js 200 OK',
          details: { url: '/static/bundle.js', httpMethod: 'GET', httpStatus: 200 },
          geo: { city: 'Internal Lab', country: 'Internal', countryCode: 'LAN', lat: 37.77, lng: -122.42 },
          isSuspicious: false
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 199)]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Handler: Execute Attack Simulator scenario
  const handleTriggerAttack = (attackType: 'hydra_bf' | 'nmap_scan' | 'sqli_juiceshop' | 'dns_tunnel') => {
    const burst = generateAttackBurst(attackType);
    setEvents(prev => [...burst, ...prev]);
    showToast(`🚨 Simulated Attack Injected: ${attackType.toUpperCase()} (${burst.length} events)`);
  };

  // Handler: Ingest parsed custom logs
  const handleIngestLogs = (parsedEvents: LogEvent[]) => {
    setEvents(prev => [...parsedEvents, ...prev]);
    showToast(`✓ Ingested ${parsedEvents.length} custom security events into SIEM buffer`);
  };

  // Handler: Apply incident mitigation containment
  const handleApplyMitigation = (actionName: string, target: string) => {
    showToast(`🛡️ Containment Executed: ${actionName} applied to [${target}]`);
    // Inject audit log
    const auditLog: LogEvent = {
      id: `EVT-AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceIp: '10.0.0.99',
      destinationIp: target.includes('.') ? target : '10.0.0.1',
      destinationPort: 443,
      protocol: 'HTTPS',
      eventType: 'NETWORK_ALERT',
      status: 'BLOCKED',
      severity: 'info',
      category: 'normal_traffic',
      rawPayload: `SOC CONTAINMENT ACTION: [${actionName}] successfully enforced on target [${target}]. Rule ID: POL-BLK-${Date.now()}`,
      details: {},
      geo: { city: 'SOC HQ', country: 'Defense Center', countryCode: 'LAN', lat: 37.77, lng: -122.42 },
      isSuspicious: false
    };
    setEvents(prev => [auditLog, ...prev]);
  };

  // Handler: Toggle detection rule
  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Handler: Reset telemetry
  const handleResetData = () => {
    setEvents(generateInitialCorpus(35));
    showToast('🔄 Telemetry buffer reset to baseline state');
  };

  return (
    <div className="min-h-screen cyber-grid p-3 md:p-6 flex flex-col justify-between max-w-[1700px] mx-auto">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 glass-panel !bg-cyan-950/90 border-cyan-400 p-3.5 flex items-center gap-3 text-cyan-200 text-xs font-mono shadow-[0_0_25px_rgba(0,240,255,0.4)] animate-bounce">
          <AlertTriangle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        metrics={metrics}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main 5 Metric Cards */}
      <MetricsOverview metrics={metrics} />

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { id: 'COMMAND_CENTER', label: '3D COMMAND CENTER & SIEM', icon: Globe2 },
          { id: 'EVENT_STREAM', label: 'LIVE EVENT TIMELINE', icon: Terminal },
          { id: 'HTTP_DNS', label: 'HTTP / DNS PROTOCOL INSPECTOR', icon: Network },
          { id: 'TOPOLOGY', label: '3D DEFENSE ASSET TOPOLOGY', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-display text-xs tracking-wider font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Full 3D Command Center & Overview */}
      {activeTab === 'COMMAND_CENTER' && (
        <div className="space-y-4">
          {/* 3D Visualizers Row: Threat Globe + Defense Topology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ThreeGlobe attackArcs={attackArcs} />
            <ThreeTopology assets={assets} />
          </div>

          {/* Analytics & Detection Row: Security Analysis + Top Entities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <SecurityAnalysisPanel
                alerts={alerts}
                rules={rules}
                onOpenPlaybook={(alert) => setSelectedPlaybookAlert(alert)}
                onToggleRule={handleToggleRule}
              />
            </div>
            <div className="lg:col-span-5">
              <TopEntities events={events} />
            </div>
          </div>

          {/* Quick Stream Preview at Bottom */}
          <EventTimeline events={events} />
        </div>
      )}

      {/* Tab 2: Dedicated Event Timeline */}
      {activeTab === 'EVENT_STREAM' && (
        <div className="space-y-4">
          <EventTimeline events={events} />
        </div>
      )}

      {/* Tab 3: HTTP & DNS Deep Inspector */}
      {activeTab === 'HTTP_DNS' && (
        <div className="space-y-4">
          <HttpDnsInspector events={events} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopEntities events={events} />
            <SecurityAnalysisPanel
              alerts={alerts}
              rules={rules}
              onOpenPlaybook={(alert) => setSelectedPlaybookAlert(alert)}
              onToggleRule={handleToggleRule}
            />
          </div>
        </div>
      )}

      {/* Tab 4: 3D Network Topology Grid */}
      {activeTab === 'TOPOLOGY' && (
        <div className="space-y-4">
          <ThreeTopology assets={assets} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <ThreeGlobe attackArcs={attackArcs} />
            </div>
            <div className="lg:col-span-6">
              <SecurityAnalysisPanel
                alerts={alerts}
                rules={rules}
                onOpenPlaybook={(alert) => setSelectedPlaybookAlert(alert)}
                onToggleRule={handleToggleRule}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AttackSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onTriggerAttack={handleTriggerAttack}
      />

      <LogIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onIngestLogs={handleIngestLogs}
      />

      <IncidentPlaybookModal
        alert={selectedPlaybookAlert}
        isOpen={!!selectedPlaybookAlert}
        onClose={() => setSelectedPlaybookAlert(null)}
        onApplyMitigation={handleApplyMitigation}
      />

      {/* Futuristic SOC Footer */}
      <footer className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>SOC DEFENSIVE ENGINE ACTIVE // MITRE ATT&CK MATRIX MAPPED</span>
        </div>
        <div>
          <span>AEGIS-X SECURITY OPERATIONS CENTER &bull; LAB TELEMETRY LAB</span>
        </div>
      </footer>
    </div>
  );
};
