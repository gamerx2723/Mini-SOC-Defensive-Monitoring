import React, { useState } from 'react';
import { ThreatAlert } from '../types/soc';
import { ShieldAlert, Ban, Lock, Server, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="soc-card p-6 md:p-8 max-w-xl w-full border-neutral-700 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white tracking-wider">
                Incident Response & Containment
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                CASE #{alert.id} // {alert.severity.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono text-xl font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 mb-5 text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500">Threat Title:</span>
            <span className="text-rose-300 font-semibold">{alert.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Adversary Source IP:</span>
            <span className="text-rose-400 font-bold">{alert.sourceIp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Target Asset / Port:</span>
            <span className="text-neutral-200">{alert.targetIp}:{alert.targetPort || 'all'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">MITRE ATT&CK:</span>
            <span className="text-amber-400 font-semibold">{alert.mitreTechnique}</span>
          </div>
          <div className="pt-2.5 border-t border-neutral-800 text-neutral-300 leading-relaxed text-[11px]">
            {alert.description}
          </div>
        </div>

        {/* Action Playbooks Grid */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-display font-bold text-neutral-300 tracking-wider uppercase">
            Available Containment Actions:
          </h4>

          {/* Action 1: Block IP on Perimeter Firewall */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700">
            <div className="flex items-center gap-3">
              <Ban className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs font-semibold text-white">
                  Block Adversary IP on Firewall
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Inject perimeter DROP rule for {alert.sourceIp}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction('block_ip', 'Firewall IP Blacklist', alert.sourceIp)}
              disabled={executedActions.includes('block_ip')}
              className={`soc-btn !h-8 !px-3.5 !text-xs ${
                executedActions.includes('block_ip')
                  ? 'soc-btn-gold'
                  : 'soc-btn-danger'
              }`}
            >
              {executedActions.includes('block_ip') ? 'BLOCKED ✓' : 'ENFORCE BLOCK'}
            </button>
          </div>

          {/* Action 2: Isolate Targeted Host */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">
                  Isolate Host ({alert.targetIp})
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Place host in Quarantine VLAN to prevent lateral movement
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction('isolate_host', 'Host Network Isolation', alert.targetIp)}
              disabled={executedActions.includes('isolate_host')}
              className={`soc-btn !h-8 !px-3.5 !text-xs ${
                executedActions.includes('isolate_host')
                  ? 'soc-btn-gold'
                  : 'soc-btn-silver'
              }`}
            >
              {executedActions.includes('isolate_host') ? 'ISOLATED ✓' : 'QUARANTINE'}
            </button>
          </div>

          {/* Action 3: Lock Compromised Accounts */}
          {alert.targetUser && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Lock Account & Revoke Tokens
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Invalidate active sessions for user [{alert.targetUser}]
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAction('lock_user', 'Account Lockout & Session Invalidation', alert.targetUser || 'user')}
                disabled={executedActions.includes('lock_user')}
                className={`soc-btn !h-8 !px-3.5 !text-xs ${
                  executedActions.includes('lock_user')
                    ? 'soc-btn-gold'
                    : 'soc-btn-silver'
                }`}
              >
                {executedActions.includes('lock_user') ? 'LOCKED ✓' : 'REVOKE'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit log recorded in SOC X buffer</span>
          </div>

          <button
            onClick={onClose}
            className="soc-btn soc-btn-gold !h-9 !px-6"
          >
            DISMISS / CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
