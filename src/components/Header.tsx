import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Radio, Terminal, UploadCloud, RefreshCw, Cpu, Volume2, VolumeX } from 'lucide-react';
import { SocMetrics } from '../types/soc';

interface HeaderProps {
  metrics: SocMetrics;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenSimulator: () => void;
  onOpenIngestion: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  isStreaming,
  onToggleStreaming,
  onOpenSimulator,
  onOpenIngestion,
  onResetData
}) => {
  const [time, setTime] = useState<string>(new Date().toUTCString().replace('GMT', 'UTC'));
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getThreatBadge = (score: number) => {
    if (score >= 70) {
      return {
        label: 'DEFCON 2 // SEVERE THREAT',
        color: 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_15px_rgba(255,0,85,0.4)]',
        pulse: 'bg-rose-500 animate-ping'
      };
    }
    if (score >= 40) {
      return {
        label: 'DEFCON 3 // ELEVATED THREAT',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-[0_0_15px_rgba(255,170,0,0.3)]',
        pulse: 'bg-amber-500 animate-ping'
      };
    }
    return {
      label: 'DEFCON 4 // NOMINAL GUARD',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(0,255,136,0.3)]',
      pulse: 'bg-emerald-500 animate-ping'
    };
  };

  const threatBadge = getThreatBadge(metrics.threatIndexScore);

  return (
    <header className="glass-panel p-4 mb-4 border-cyan-500/30">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & SOC Status */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div className="absolute inset-0 rounded-xl border border-cyan-400/40 radar-sweep" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-display font-black tracking-wider text-cyan-400 text-glow-cyan">
                AEGIS-X // MINI SOC
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-500/40">
                v2.4 SEC-OPS
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>DEFENSIVE SIEM MONITORING & THREAT CORRELATOR</span>
            </p>
          </div>
        </div>

        {/* Threat Level Indicator & Live Time */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${threatBadge.color}`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${threatBadge.pulse}`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            <span>{threatBadge.label} ({metrics.threatIndexScore}/100)</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300">
            {time}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          <button
            onClick={onToggleStreaming}
            className={`cyber-btn ${isStreaming ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500' : 'border-slate-600 text-slate-400'}`}
            title="Toggle Live Event Ingestion Stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isStreaming ? 'FEED ACTIVE' : 'FEED PAUSED'}</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="cyber-btn cyber-btn-red"
            title="Launch Kali Attack Simulator"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ATTACK SIMULATOR</span>
          </button>

          <button
            onClick={onOpenIngestion}
            className="cyber-btn"
            title="Ingest Raw Custom Logs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>INGEST LOGS</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-all"
            title="Reset Telemetry Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
