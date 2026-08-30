import React, { useState } from 'react';
import { Terminal, Play, Zap, Bug, Radio, Lock } from 'lucide-react';

interface AttackSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAttack: (attackType: 'hydra_bf' | 'nmap_scan' | 'sqli_juiceshop' | 'dns_tunnel') => void;
}

export const AttackSimulatorModal: React.FC<AttackSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerAttack
}) => {
  const [selectedAttack, setSelectedAttack] = useState<'hydra_bf' | 'nmap_scan' | 'sqli_juiceshop' | 'dns_tunnel'>('hydra_bf');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const attackScenarios = [
    {
      id: 'hydra_bf',
      title: 'Hydra SSH / Auth Brute-Force',
      tool: 'Kali Linux // Hydra v9.5',
      target: '10.0.0.22:22 (Bastion Auth)',
      mitre: 'T1110.001 (Password Guessing)',
      description: 'Executes rapid dictionary attacks using rockyou.txt against accounts [root, admin, guest, support] triggering threshold correlation.',
      icon: Lock,
      severityColor: 'text-rose-400 border-rose-500/50 bg-rose-950/20'
    },
    {
      id: 'nmap_scan',
      title: 'Nmap Stealth SYN & OS Fingerprinting Scan',
      tool: 'Kali Linux // Nmap v7.94',
      target: '10.0.0.15 (Entire Subnet)',
      mitre: 'T1046 (Network Service Discovery)',
      description: 'Executes `nmap -sS -sV -O -p 1-10000` rapid multi-port probes to map perimeter vulnerabilities.',
      icon: Radio,
      severityColor: 'text-amber-400 border-amber-500/50 bg-amber-950/20'
    },
    {
      id: 'sqli_juiceshop',
      title: 'OWASP Juice Shop / DVWA SQL Injection & XSS',
      tool: 'SQLmap / Custom Exploit Script',
      target: '10.0.0.15:80 (/rest/products/search)',
      mitre: 'T1190 (Exploit Public Application)',
      description: 'Injects UNION SELECT, boolean-based SQLi, and malicious JavaScript payloads into web endpoints.',
      icon: Bug,
      severityColor: 'text-rose-400 border-rose-500/50 bg-rose-950/20'
    },
    {
      id: 'dns_tunnel',
      title: 'DNS Tunneling & Data Exfiltration Beacon',
      tool: 'Iodine / Cobalt Strike DNS Stager',
      target: '10.0.0.1:53 (Internal DNS)',
      mitre: 'T1071.004 (DNS Protocol C2)',
      description: 'Encodes base64 payload fragments inside randomized subdomains with high Shannon entropy (>3.8).',
      icon: Zap,
      severityColor: 'text-amber-400 border-amber-500/50 bg-amber-950/20'
    }
  ];

  const handleLaunch = () => {
    setIsExecuting(true);
    onTriggerAttack(selectedAttack);
    setTimeout(() => {
      setIsExecuting(false);
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="soc-card p-6 md:p-8 max-w-xl w-full border-neutral-700 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white tracking-wider">
                Kali Red-Team Attack Simulator
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                SOC X Authorized Penetration Testing Telemetry Burst
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

        <p className="text-xs text-neutral-300 mb-5 leading-relaxed font-mono">
          Select an authorized simulation profile to inject synthetic multi-vector attack traffic into the live SIEM correlation engine:
        </p>

        {/* Attack Options Grid */}
        <div className="space-y-3 mb-6">
          {attackScenarios.map(attack => {
            const isSelected = selectedAttack === attack.id;
            const Icon = attack.icon;

            return (
              <div
                key={attack.id}
                onClick={() => setSelectedAttack(attack.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-display font-semibold text-white">
                      {attack.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    {attack.tool}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-neutral-400 mb-2 leading-snug">
                  {attack.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>Target: <span className="text-neutral-200">{attack.target}</span></span>
                  <span className="text-amber-400 font-semibold">MITRE: {attack.mitre}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="soc-btn soc-btn-silver !h-9 !px-5 text-xs"
          >
            CANCEL
          </button>

          <button
            id="btn-execute-simulation"
            onClick={handleLaunch}
            disabled={isExecuting}
            className="soc-btn soc-btn-danger !h-9 !px-6"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'INJECTING BURST...' : 'EXECUTE ATTACK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
