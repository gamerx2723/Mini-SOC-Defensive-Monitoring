import React, { useState, useMemo } from 'react';
import { LogEvent } from '../types/soc';
import { Clock, Search, Filter, Terminal, Code2 } from 'lucide-react';

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
      if (selectedProtocol !== 'ALL' && e.protocol !== selectedProtocol) return false;
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
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
    <div className="soc-card p-5 lg:p-6 flex flex-col h-[520px]">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wider uppercase">
              Security Event Timeline
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">
              Live Ingestion Buffer ({filteredEvents.length} / {events.length} Events)
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search IP, User, Payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3.5 py-2 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>
      </div>

      {/* Protocol & Category Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
        <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3 text-neutral-500" /> Protocol:
        </span>
        {['ALL', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'TCP'].map(proto => (
          <button
            key={proto}
            onClick={() => setSelectedProtocol(proto)}
            className={`px-3 py-1 rounded-md text-[11px] transition-all border ${
              selectedProtocol === proto
                ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {proto}
          </button>
        ))}

        <span className="text-neutral-400 ml-3 text-[11px]">Category:</span>
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
            className={`px-3 py-1 rounded-md text-[11px] transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Event Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] sticky top-0 z-10 border-b border-neutral-800">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Source IP</th>
              <th className="py-2.5 px-3">Destination</th>
              <th className="py-2.5 px-3">Proto</th>
              <th className="py-2.5 px-3">Event Type / User</th>
              <th className="py-2.5 px-3">Payload Summary</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-neutral-300">
            {filteredEvents.map(evt => {
              const isSuspicious = evt.isSuspicious;
              return (
                <tr
                  key={evt.id}
                  onClick={() => setInspectedEvent(evt)}
                  className={`cursor-pointer transition-colors ${
                    isSuspicious ? 'hover:bg-rose-950/20 bg-neutral-950/40' : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      evt.severity === 'critical' ? 'badge-critical' : evt.severity === 'high' ? 'badge-high' : 'badge-gold'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {evt.sourceIp}
                    {evt.geo && (
                      <span className="text-[10px] text-neutral-500 ml-1.5 font-normal">
                        ({evt.geo.countryCode})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                    {evt.destinationIp}:{evt.destinationPort}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {evt.protocol}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-neutral-200 font-semibold">{evt.eventType}</span>
                    {evt.username && (
                      <span className="text-amber-400 ml-1.5 text-[10px]">[{evt.username}]</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 max-w-[280px] truncate">
                    {evt.details.url || evt.details.dnsQuery || evt.rawPayload}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-neutral-400 hover:text-amber-400 transition-colors p-1">
                      <Code2 className="w-4 h-4 inline" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="soc-card p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-neutral-700 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-display font-bold text-white tracking-wider">
                  Event Forensics Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-neutral-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2.5 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div><span className="text-neutral-500">Event ID:</span> <span className="text-white font-medium">{inspectedEvent.id}</span></div>
                <div><span className="text-neutral-500">Timestamp:</span> <span className="text-neutral-300">{inspectedEvent.timestamp}</span></div>
                <div><span className="text-neutral-500">Source:</span> <span className="text-rose-400 font-bold">{inspectedEvent.sourceIp}:{inspectedEvent.sourcePort || 'any'}</span> ({inspectedEvent.geo.city}, {inspectedEvent.geo.country})</div>
                <div><span className="text-neutral-500">Destination:</span> <span className="text-neutral-300">{inspectedEvent.destinationIp}:{inspectedEvent.destinationPort}</span></div>
                <div><span className="text-neutral-500">Protocol:</span> <span className="text-amber-400 font-semibold">{inspectedEvent.protocol}</span></div>
                <div><span className="text-neutral-500">Category:</span> <span className="text-amber-300">{inspectedEvent.category}</span></div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1.5">
                  RAW LOG LINE / PAYLOAD:
                </label>
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-rose-300 break-all leading-relaxed font-mono">
                  {inspectedEvent.rawPayload}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                  STRUCTURED EVENT JSON:
                </label>
                <pre className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-neutral-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(inspectedEvent, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setInspectedEvent(null)}
                className="soc-btn soc-btn-gold !h-8 !px-5"
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
