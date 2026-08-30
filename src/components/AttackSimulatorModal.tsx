import React, { useState } from 'react';
import { Terminal, ShieldAlert, Play, Cpu, Zap, Bug, Radio, Lock } from 'lucide-react';

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
      severityColor: 'text-rose-400 border-rose-500/50 bg-rose-950/30'
    },
    {
      id: 'nmap_scan',
      title: 'Nmap Stealth SYN & OS Fingerprinting Scan',
      tool: 'Kali Linux // Nmap v7.94',
      target: '10.0.0.15 (Entire Subnet)',
      mitre: 'T1046 (Network Service Discovery)',
      description: 'Executes `nmap -sS -sV -O -p 1-10000` rapid multi-port probes to map perimeter vulnerabilities.',
      icon: Radio,
      severityColor: 'text-amber-400 border-amber-500/50 bg-amber-950/30'
    },
    {
      id: 'sqli_juiceshop',
      title: 'OWASP Juice Shop / DVWA SQL Injection & XSS',
      tool: 'SQLmap / Custom Exploit Script',
      target: '10.0.0.15:80 (/rest/products/search)',
      mitre: 'T1190 (Exploit Public Application)',
      description: 'Injects UNION SELECT, boolean-based SQLi, and malicious JavaScript payloads into web endpoints.',
      icon: Bug,
      severityColor: 'text-rose-400 border-rose-500/50 bg-rose-950/30'
    },
    {
      id: 'dns_tunnel',
      title: 'DNS Tunneling & Data Exfiltration Beacon',
      tool: 'Iodine / Cobalt Strike DNS Stager',
      target: '10.0.0.1:53 (Internal DNS)',
      mitre: 'T1071.004 (DNS Protocol C2)',
      description: 'Encodes base64 payload fragments inside randomized subdomains with high Shannon entropy (>3.8).',
      icon: Zap,
      severityColor: 'text-purple-400 border-purple-500/50 bg-purple-950/30'
    }
  ];

  const handleLaunch = () => {
    setIsExecuting(true);
    onTriggerAttack(selectedAttack);
    setTimeout(() => {
      setIsExecuting(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel p-6 max-w-xl w-full border-rose-500/60 shadow-[0_0_40px_rgba(255,0,85,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-display font-black text-rose-400 text-glow-red tracking-wider">
              KALI RED-TEAM ATTACK SIMULATOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-400 font-mono text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
          Select an authorized penetration testing attack scenario to inject into the live SOC telemetry feed and observe SIEM detection rule correlation in real time.
        </p>

        {/* Attack Options Grid */}
        <div className="space-y-2.5 mb-5">
          {attackScenarios.map(attack => {
            const isSelected = selectedAttack === attack.id;
            const Icon = attack.icon;

            return (
              <div
                key={attack.id}
                onClick={() => setSelectedAttack(attack.id as any)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? `${attack.severityColor} shadow-[0_0_15px_rgba(255,0,85,0.2)]`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-display font-bold text-slate-100">
                      {attack.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {attack.tool}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-400 mb-1.5 leading-snug">
                  {attack.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Target: <span className="text-slate-300">{attack.target}</span></span>
                  <span className="text-amber-400">MITRE: {attack.mitre}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            CANCEL
          </button>

          <button
            onClick={handleLaunch}
            disabled={isExecuting}
            className="cyber-btn cyber-btn-red !px-5 !py-2.5 flex items-center gap-2"
          >
            <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'LAUNCHING ATTACK...' : 'EXECUTE SIMULATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
