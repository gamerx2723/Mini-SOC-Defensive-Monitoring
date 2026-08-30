import React, { useState } from 'react';
import { ThreatAlert, SecurityRule } from '../types/soc';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Play, Filter, Cpu, Wrench } from 'lucide-react';

interface SecurityAnalysisPanelProps {
  alerts: ThreatAlert[];
  rules: SecurityRule[];
  onOpenPlaybook: (alert: ThreatAlert) => void;
  onToggleRule: (ruleId: string) => void;
}

export const SecurityAnalysisPanel: React.FC<SecurityAnalysisPanelProps> = ({
  alerts,
  rules,
  onOpenPlaybook,
  onToggleRule
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'RULES'>('ALERTS');

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity.toUpperCase() === selectedSeverity;
  });

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      {/* Panel Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-sm font-display font-bold text-slate-100 tracking-wider">
            SECURITY ANALYSIS & THREAT DETECTION
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-400 border border-rose-500/40">
            {alerts.length} ACTIVE INCIDENTS
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'ALERTS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LIVE ALERTS ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'RULES' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DETECTION RULES ({rules.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Live Correlated Alerts */}
      {activeTab === 'ALERTS' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Filter Row */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Severity:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-0.5 rounded border text-[11px] transition-all ${
                  selectedSeverity === sev
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
                <span>NO CORRELATED THREATS MATCHING FILTER</span>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const isHigh = alert.severity === 'high';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCritical
                        ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400 shadow-[0_0_15px_rgba(255,0,85,0.15)]'
                        : isHigh
                        ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            isCritical ? 'badge-critical' : (isHigh ? 'badge-high' : 'badge-medium')
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h3 className="text-xs font-display font-semibold text-slate-100">
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                        {alert.confidenceScore}% CONFIDENCE
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-slate-300 mb-2 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-semibold">
                          MITRE: <span className="text-slate-200">{alert.mitreTechnique}</span>
                        </span>
                        <span>
                          Source IP: <span className="text-rose-400 font-bold">{alert.sourceIp}</span>
                        </span>
                        {alert.targetUser && (
                          <span>
                            User: <span className="text-amber-300">{alert.targetUser}</span>
                          </span>
                        )}
                        <span>Evidence: {alert.evidenceCount} Events</span>
                      </div>

                      <button
                        onClick={() => onOpenPlaybook(alert)}
                        className="cyber-btn cyber-btn-red !py-1 !px-2.5 !text-[10px]"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>RESPOND / CONTAIN</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Configured Detection Rules */}
      {activeTab === 'RULES' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                    {rule.id}
                  </span>
                  <h4 className="text-xs font-display font-semibold text-slate-200">
                    {rule.name}
                  </h4>
                  <span className="text-[10px] font-mono text-amber-400">
                    [{rule.mitreId}]
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-snug">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  Fired: <span className="text-cyan-300 font-bold">{rule.triggerCount}x</span>
                </span>
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                    rule.enabled
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
