import React from 'react';
import { LogEvent, EntityCount } from '../types/soc';
import { Users, Crosshair, ShieldAlert, Globe } from 'lucide-react';

interface TopEntitiesProps {
  events: LogEvent[];
}

export const TopEntities: React.FC<TopEntitiesProps> = ({ events }) => {
  // Aggregate Top Source IPs
  const ipMap = new Map<string, { count: number; country: string; isSuspicious: boolean }>();
  // Aggregate Top Usernames
  const userMap = new Map<string, { count: number; failed: number; success: number }>();

  events.forEach(e => {
    // Source IP
    const currentIp = ipMap.get(e.sourceIp) || { count: 0, country: e.geo?.country || 'Unknown', isSuspicious: false };
    currentIp.count++;
    if (e.isSuspicious) currentIp.isSuspicious = true;
    ipMap.set(e.sourceIp, currentIp);

    // Usernames
    if (e.username) {
      const currentUser = userMap.get(e.username) || { count: 0, failed: 0, success: 0 };
      currentUser.count++;
      if (e.eventType === 'AUTH_FAILED') currentUser.failed++;
      if (e.eventType === 'AUTH_SUCCESS') currentUser.success++;
      userMap.set(e.username, currentUser);
    }
  });

  const topIps = Array.from(ipMap.entries())
    .map(([ip, data]) => ({ name: ip, count: data.count, country: data.country, isMalicious: data.isSuspicious }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topUsers = Array.from(userMap.entries())
    .map(([user, data]) => ({ name: user, count: data.count, failed: data.failed, success: data.success }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxIpCount = topIps[0]?.count || 1;
  const maxUserCount = topUsers[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Source IPs */}
      <div className="glass-panel p-4 flex flex-col">
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20 mb-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-display font-bold text-slate-100 uppercase tracking-wider">
              Top Source IPs & Threat Vectors
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">RANKED BY VOLUME</span>
        </div>

        <div className="space-y-2.5 flex-1">
          {topIps.map((ip, idx) => {
            const percentage = Math.round((ip.count / maxIpCount) * 100);
            return (
              <div key={ip.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-3">#{idx + 1}</span>
                    <span className={`font-semibold ${ip.isMalicious ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                      {ip.name}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 inline" /> {ip.country}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">{ip.count} events</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ip.isMalicious
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Target Usernames */}
      <div className="glass-panel p-4 flex flex-col">
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-display font-bold text-slate-100 uppercase tracking-wider">
              Top Usernames Targeted / Active
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">AUTH CORRELATION</span>
        </div>

        <div className="space-y-2.5 flex-1">
          {topUsers.map((u, idx) => {
            const percentage = Math.round((u.count / maxUserCount) * 100);
            return (
              <div key={u.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-3">#{idx + 1}</span>
                    <span className="text-slate-200 font-semibold">{u.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-rose-400 font-bold">{u.failed} fail</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400 font-bold">{u.success} ok</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${(u.failed / (u.count || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(u.success / (u.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
