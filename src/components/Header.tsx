import React, { useState, useEffect } from 'react';
import { Radio, Terminal, UploadCloud, RefreshCw, Activity } from 'lucide-react';
import { SocMetrics } from '../types/soc';

interface HeaderProps {
  metrics: SocMetrics;
  isStreaming: boolean;
  activeTab: 'COMMAND_CENTER' | 'EVENT_STREAM' | 'HTTP_DNS' | 'TOPOLOGY';
  onSelectTab: (tab: 'COMMAND_CENTER' | 'EVENT_STREAM' | 'HTTP_DNS' | 'TOPOLOGY') => void;
  onToggleStreaming: () => void;
  onOpenSimulator: () => void;
  onOpenIngestion: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  isStreaming,
  activeTab,
  onSelectTab,
  onToggleStreaming,
  onOpenSimulator,
  onOpenIngestion,
  onResetData
}) => {
  const [time, setTime] = useState<string>(new Date().toUTCString().replace('GMT', 'UTC'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: 'COMMAND_CENTER' | 'EVENT_STREAM' | 'HTTP_DNS' | 'TOPOLOGY'; label: string }[] = [
    { id: 'COMMAND_CENTER', label: '3D Command Center' },
    { id: 'EVENT_STREAM', label: 'Live Timeline Stream' },
    { id: 'HTTP_DNS', label: 'HTTP / DNS Forensics' },
    { id: 'TOPOLOGY', label: 'Asset Defense Grid' }
  ];

  return (
    <header className="soc-card p-5 md:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-neutral-900 p-[1px] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-display font-bold text-white tracking-wider">
                SOC <span className="text-amber-400">X</span>
              </h1>
              <span className="badge-gold text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                DEFENSIVE SIEM
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Security Operations Center & Threat Correlation Engine
            </p>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`soc-nav-tab ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry Controls & Status */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* DEFCON Status Pill */}
          <div className="px-3.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${metrics.threatIndexScore > 60 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-neutral-400">DEFCON {metrics.threatIndexScore > 60 ? '2' : '4'}:</span>
            <span className={metrics.threatIndexScore > 60 ? 'text-rose-400 font-bold' : 'text-amber-400 font-semibold'}>
              {metrics.threatIndexScore}/100
            </span>
          </div>

          {/* Live Feed Toggle */}
          <button
            onClick={onToggleStreaming}
            className={`soc-btn soc-btn-silver !h-9 !px-3.5 text-xs ${isStreaming ? '!border-emerald-500/50 !text-emerald-300' : ''}`}
            title="Toggle Live Event Stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : 'text-neutral-500'}`} />
            <span>{isStreaming ? 'LIVE FEED' : 'PAUSED'}</span>
          </button>

          {/* Attack Simulator Button */}
          <button
            id="btn-attack-simulator"
            onClick={onOpenSimulator}
            className="soc-btn soc-btn-danger !h-9 !px-4 text-xs"
            title="Launch Kali Attack Simulation Suite"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ATTACK SIMULATOR</span>
          </button>

          {/* Ingest Logs Button */}
          <button
            onClick={onOpenIngestion}
            className="soc-btn soc-btn-silver !h-9 !px-3.5 text-xs hidden sm:inline-flex"
            title="Ingest Custom Raw Telemetry"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>INGEST LOGS</span>
          </button>

          {/* Reset Buffer */}
          <button
            onClick={onResetData}
            className="soc-btn soc-btn-silver !h-9 !px-2.5"
            title="Reset Telemetry Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400 hover:text-white" />
          </button>

        </div>
      </div>
    </header>
  );
};
