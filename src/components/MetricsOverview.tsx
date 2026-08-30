import React from 'react';
import { KeyRound, UserCheck, Activity, AlertOctagon, ShieldAlert, TrendingUp } from 'lucide-react';
import { SocMetrics } from '../types/soc';

interface MetricsOverviewProps {
  metrics: SocMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'TOTAL EVENTS',
      value: metrics.totalEvents.toLocaleString(),
      subtext: 'Across all internal & DMZ sensors',
      trend: '+12% / min',
      icon: Activity,
      color: 'text-white',
      accentGlow: 'from-slate-100/10 to-transparent',
      borderColor: 'border-neutral-800'
    },
    {
      title: 'FAILED LOGINS',
      value: metrics.failedLogins.toLocaleString(),
      subtext: `${metrics.bruteForceIncidents} Brute-force incidents detected`,
      trend: 'Hydra / Spray',
      icon: KeyRound,
      color: 'text-rose-400',
      accentGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'border-rose-900/30'
    },
    {
      title: 'AUTH SUCCESS',
      value: metrics.successfulLogins.toLocaleString(),
      subtext: 'Authorized user credentials verified',
      trend: 'Legitimate',
      icon: UserCheck,
      color: 'text-emerald-400',
      accentGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-900/30'
    },
    {
      title: 'SUSPICIOUS EVENTS',
      value: metrics.suspiciousEvents.toLocaleString(),
      subtext: `${metrics.activeThreatCount} Correlated security alerts`,
      trend: 'MITRE Triggers',
      icon: AlertOctagon,
      color: 'text-amber-400',
      accentGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-900/30'
    },
    {
      title: 'THREAT INDEX SCORE',
      value: `${metrics.threatIndexScore}/100`,
      subtext: metrics.threatIndexScore > 60 ? 'DEFCON 2 Severe Risk Active' : 'Perimeter Defense Nominal',
      trend: 'Dynamic SIEM',
      icon: ShieldAlert,
      color: metrics.threatIndexScore > 60 ? 'text-rose-400' : 'text-amber-400',
      accentGlow: metrics.threatIndexScore > 60 ? 'from-rose-500/15 to-transparent' : 'from-amber-500/15 to-transparent',
      borderColor: metrics.threatIndexScore > 60 ? 'border-rose-500/40' : 'border-amber-500/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`soc-card p-5 lg:p-6 flex flex-col justify-between overflow-hidden ${card.borderColor}`}
          >
            {/* Top Accent Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentGlow}`} />

            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold text-neutral-400 tracking-wider">
                {card.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-center shadow-inner">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            {/* Metric Value */}
            <div className="mb-4">
              <span className={`text-3xl lg:text-4xl font-mono font-bold tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>

            {/* Footer Subtext & Trend */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="truncate max-w-[140px] text-neutral-300">{card.subtext}</span>
              <span className="text-amber-400/90 font-semibold flex items-center gap-1 shrink-0">
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
