import React from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, UserCheck, Activity, AlertOctagon, TrendingUp } from 'lucide-react';
import { SocMetrics } from '../types/soc';

interface MetricsOverviewProps {
  metrics: SocMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'TOTAL EVENTS',
      value: metrics.totalEvents.toLocaleString(),
      subtext: 'Across all network sensors',
      icon: Activity,
      borderColor: 'border-cyan-500/30',
      glowColor: 'text-cyan-400 text-glow-cyan',
      iconBg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/50',
      trend: '+12% / min'
    },
    {
      title: 'FAILED LOGINS',
      value: metrics.failedLogins.toLocaleString(),
      subtext: `${metrics.bruteForceIncidents} Brute-force incidents`,
      icon: KeyRound,
      borderColor: 'border-rose-500/30',
      glowColor: 'text-rose-400 text-glow-red',
      iconBg: 'bg-rose-950/60 text-rose-400 border-rose-500/50',
      trend: 'Hydra / SSH Attacks'
    },
    {
      title: 'AUTH SUCCESS',
      value: metrics.successfulLogins.toLocaleString(),
      subtext: 'Authorized user sessions',
      icon: UserCheck,
      borderColor: 'border-emerald-500/30',
      glowColor: 'text-emerald-400 text-glow-emerald',
      iconBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50',
      trend: 'Valid Credentials'
    },
    {
      title: 'SUSPICIOUS EVENTS',
      value: metrics.suspiciousEvents.toLocaleString(),
      subtext: `${metrics.activeThreatCount} Correlated threat alerts`,
      icon: AlertOctagon,
      borderColor: 'border-amber-500/30',
      glowColor: 'text-amber-400 text-glow-amber',
      iconBg: 'bg-amber-950/60 text-amber-400 border-amber-500/50',
      trend: 'MITRE Signatures'
    },
    {
      title: 'THREAT INDEX',
      value: `${metrics.threatIndexScore}/100`,
      subtext: metrics.threatIndexScore > 60 ? 'Critical Threat Level' : 'Monitoring Nominal',
      icon: ShieldAlert,
      borderColor: metrics.threatIndexScore > 60 ? 'border-rose-500/50' : 'border-cyan-500/30',
      glowColor: metrics.threatIndexScore > 60 ? 'text-rose-400 text-glow-red' : 'text-cyan-400 text-glow-cyan',
      iconBg: metrics.threatIndexScore > 60 ? 'bg-rose-950/60 text-rose-400 border-rose-500/50' : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/50',
      trend: 'Dynamic SIEM Score'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel p-4 flex flex-col justify-between relative overflow-hidden border ${card.borderColor}`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-display font-semibold tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconBg}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Main Value */}
            <div className="my-1">
              <span className={`text-2xl lg:text-3xl font-mono font-bold ${card.glowColor}`}>
                {card.value}
              </span>
            </div>

            {/* Footer with subtext & trend */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              <span className="truncate max-w-[130px]">{card.subtext}</span>
              <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 inline" />
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
