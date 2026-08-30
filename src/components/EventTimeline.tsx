import React, { useState, useMemo } from 'react';
import { LogEvent } from '../types/soc';
import { Clock, Search, Filter, Terminal, Shield, ExternalLink, Code2, AlertTriangle } from 'lucide-react';

interface EventTimelineProps {
  events: LogEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectedEvent, setInspectedEvent] = useState<LogEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Protocol filter
      if (selectedProtocol !== 'ALL' && e.protocol !== selectedProtocol) return false;
      // Category filter
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.sourceIp.toLowerCase().includes(q) ||
        e.destinationIp.toLowerCase().includes(q) ||
        (e.username && e.username.toLowerCase().includes(q)) ||
        (e.details.url && e.details.url.toLowerCase().includes(q)) ||
        (e.details.dnsQuery && e.details.dnsQuery.toLowerCase().includes(q)) ||
        e.rawPayload.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery, selectedProtocol, selectedCategory]);

  return (
    <div className="glass-panel p-4 flex flex-col h-[460px]">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-display font-bold text-slate-100 tracking-wider">
            SECURITY EVENT TIMELINE & LOG STREAM
          </h2>
          <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            {filteredEvents.length} / {events.length} LOGS
          </span>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP, User, URL, Payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Protocol & Category Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3 text-cyan-400" /> Proto:
        </span>
        {['ALL', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'TCP'].map(proto => (
          <button
            key={proto}
            onClick={() => setSelectedProtocol(proto)}
            className={`px-2 py-0.5 rounded border text-[11px] transition-all ${
              selectedProtocol === proto
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {proto}
          </button>
        ))}

        <span className="text-slate-400 ml-2 text-[11px]">Category:</span>
        {[
          { id: 'ALL', label: 'ALL' },
          { id: 'brute_force', label: 'Brute-Force' },
          { id: 'http_sqli', label: 'SQLi / JuiceShop' },
          { id: 'dns_tunneling', label: 'DNS Tunnel' },
          { id: 'port_scan', label: 'Port Scan' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-0.5 rounded border text-[11px] transition-all ${
              selectedCategory === cat.id
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Event Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Severity</th>
              <th className="py-2 px-3">Source IP</th>
              <th className="py-2 px-3">Destination</th>
              <th className="py-2 px-3">Proto</th>
              <th className="py-2 px-3">Event Type / Target</th>
              <th className="py-2 px-3">Payload Summary</th>
              <th className="py-2 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredEvents.map(evt => {
              const isSuspicious = evt.isSuspicious;
              return (
                <tr
                  key={evt.id}
                  onClick={() => setInspectedEvent(evt)}
                  className={`cursor-pointer transition-colors ${
                    isSuspicious ? 'hover:bg-rose-950/20 bg-slate-950/40' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border badge-${evt.severity}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-cyan-300 whitespace-nowrap">
                    {evt.sourceIp}
                    {evt.geo && (
                      <span className="text-[10px] text-slate-500 ml-1.5">
                        ({evt.geo.countryCode})
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {evt.destinationIp}:{evt.destinationPort}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {evt.protocol}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-slate-200 font-semibold">{evt.eventType}</span>
                    {evt.username && (
                      <span className="text-amber-400 ml-1 text-[10px]">[{evt.username}]</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-400 max-w-[280px] truncate">
                    {evt.details.url || evt.details.dnsQuery || evt.rawPayload}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-cyan-400 hover:text-cyan-300">
                      <Code2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Raw Payload Inspector Modal */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-5 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-display font-bold text-slate-100">
                  EVENT FORENSICS & PAYLOAD DECODER
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-slate-400 hover:text-rose-400 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-3 rounded border border-slate-800">
                <div><span className="text-slate-500">Event ID:</span> <span className="text-cyan-300">{inspectedEvent.id}</span></div>
                <div><span className="text-slate-500">Timestamp:</span> <span className="text-slate-300">{inspectedEvent.timestamp}</span></div>
                <div><span className="text-slate-500">Source:</span> <span className="text-rose-400 font-bold">{inspectedEvent.sourceIp}:{inspectedEvent.sourcePort || 'any'}</span> ({inspectedEvent.geo.city}, {inspectedEvent.geo.country})</div>
                <div><span className="text-slate-500">Destination:</span> <span className="text-slate-300">{inspectedEvent.destinationIp}:{inspectedEvent.destinationPort}</span></div>
                <div><span className="text-slate-500">Protocol:</span> <span className="text-cyan-400">{inspectedEvent.protocol}</span></div>
                <div><span className="text-slate-500">Category:</span> <span className="text-amber-400">{inspectedEvent.category}</span></div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-cyan-400 block mb-1">
                  RAW LOG LINE / PAYLOAD:
                </label>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-rose-300 break-all leading-relaxed font-mono">
                  {inspectedEvent.rawPayload}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  STRUCTURED EVENT JSON:
                </label>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-400 overflow-x-auto text-[11px]">
                  {JSON.stringify(inspectedEvent, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectedEvent(null)}
                className="cyber-btn"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
