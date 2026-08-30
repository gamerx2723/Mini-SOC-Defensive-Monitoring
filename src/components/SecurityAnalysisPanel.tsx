import React, { useState } from 'react';
import { ThreatAlert, SecurityRule } from '../types/soc';
import { ShieldAlert, CheckCircle2, Filter, Wrench } from 'lucide-react';

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
    <div className="soc-card p-5 lg:p-6 h-full flex flex-col">
      {/* Panel Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wider uppercase">
              Security Analysis & Correlation
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">
              MITRE ATT&CK Behavioral Pattern Detection
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'ALERTS'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            LIVE ALERTS ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'RULES'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-neutral-400 hover:text-white'
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
          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-neutral-500" /> Severity:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-md border text-[11px] transition-all ${
                  selectedSeverity === sev
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px]">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-xs font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                <span>NO CORRELATED THREATS MATCHING FILTER</span>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const isHigh = alert.severity === 'high';

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 shadow-[0_0_15px_rgba(255,51,102,0.1)]'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            isCritical ? 'badge-critical' : (isHigh ? 'badge-high' : 'badge-gold')
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h3 className="text-xs font-display font-semibold text-white">
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                        {alert.confidenceScore}% CONFIDENCE
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-neutral-300 mb-3 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-neutral-400 pt-2.5 border-t border-neutral-800">
                      <div className="flex items-center gap-4">
                        <span className="text-amber-400 font-semibold">
                          MITRE: <span className="text-neutral-200">{alert.mitreTechnique}</span>
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
                        className="soc-btn soc-btn-danger !h-7 !px-3 !text-[11px]"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>CONTAINMENT PLAYBOOK</span>
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
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[420px]">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-4 hover:border-neutral-700 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
                    {rule.id}
                  </span>
                  <h4 className="text-xs font-display font-semibold text-neutral-200">
                    {rule.name}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400">
                    [{rule.mitreId}]
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-400 leading-snug">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-neutral-400">
                  Fired: <span className="text-amber-300 font-bold">{rule.triggerCount}x</span>
                </span>
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                    rule.enabled
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900'
                      : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300'
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
