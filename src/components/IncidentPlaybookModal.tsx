import React, { useState } from 'react';
import { ThreatAlert } from '../types/soc';
import { ShieldCheck, ShieldAlert, Ban, Lock, Server, Globe2, CheckCircle, ArrowRight } from 'lucide-react';

interface IncidentPlaybookModalProps {
  alert: ThreatAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyMitigation: (actionType: string, target: string) => void;
}

export const IncidentPlaybookModal: React.FC<IncidentPlaybookModalProps> = ({
  alert,
  isOpen,
  onClose,
  onApplyMitigation
}) => {
  const [executedActions, setExecutedActions] = useState<string[]>([]);

  if (!isOpen || !alert) return null;

  const handleAction = (actionKey: string, actionName: string, target: string) => {
    onApplyMitigation(actionName, target);
    setExecutedActions(prev => [...prev, actionKey]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel p-6 max-w-xl w-full border-rose-500/60 shadow-[0_0_40px_rgba(255,0,85,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <div>
              <h2 className="text-base font-display font-black text-slate-100 tracking-wider">
                INCIDENT RESPONSE & CONTAINMENT PLAYBOOK
              </h2>
              <span className="text-[10px] font-mono text-rose-400">
                CASE #{alert.id} // {alert.severity.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-400 font-mono text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 mb-4 text-xs font-mono space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Threat Title:</span>
            <span className="text-rose-300 font-bold">{alert.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Adversary Source IP:</span>
            <span className="text-rose-400 font-bold">{alert.sourceIp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Asset / Port:</span>
            <span className="text-cyan-300">{alert.targetIp}:{alert.targetPort || 'all'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">MITRE ATT&CK:</span>
            <span className="text-amber-400 font-semibold">{alert.mitreTechnique}</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
            {alert.description}
          </div>
        </div>

        {/* Action Playbooks Grid */}
        <div className="space-y-2.5 mb-5">
          <h4 className="text-xs font-display font-bold text-slate-300 tracking-wider uppercase">
            Available Containment Actions:
          </h4>

          {/* Action 1: Block IP on Perimeter Firewall */}
          <div className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40">
            <div className="flex items-center gap-3">
              <Ban className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  Block Adversary IP on Firewall
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Inject iptables DROP rule for {alert.sourceIp}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction('block_ip', 'Firewall IP Blacklist', alert.sourceIp)}
              disabled={executedActions.includes('block_ip')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
                executedActions.includes('block_ip')
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                  : 'cyber-btn cyber-btn-red !py-1'
              }`}
            >
              {executedActions.includes('block_ip') ? 'BLOCKED ✓' : 'ENFORCE BLOCK'}
            </button>
          </div>

          {/* Action 2: Isolate Targeted Host */}
          <div className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  Isolate Target Host ({alert.targetIp})
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Place host in Quarantine VLAN to prevent lateral movement
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction('isolate_host', 'Host Network Isolation', alert.targetIp)}
              disabled={executedActions.includes('isolate_host')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
                executedActions.includes('isolate_host')
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                  : 'cyber-btn !py-1'
              }`}
            >
              {executedActions.includes('isolate_host') ? 'ISOLATED ✓' : 'QUARANTINE'}
            </button>
          </div>

          {/* Action 3: Lock Compromised Accounts */}
          {alert.targetUser && (
            <div className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">
                    Lock Account & Revoke Tokens
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Invalidate active sessions for user [{alert.targetUser}]
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAction('lock_user', 'Account Lockout & Session Invalidation', alert.targetUser || 'user')}
                disabled={executedActions.includes('lock_user')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
                  executedActions.includes('lock_user')
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                    : 'cyber-btn !py-1'
                }`}
              >
                {executedActions.includes('lock_user') ? 'LOCKED ✓' : 'REVOKE'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit log recorded in SOC telemetry buffer</span>
          </div>

          <button
            onClick={onClose}
            className="cyber-btn"
          >
            DISMISS / CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
