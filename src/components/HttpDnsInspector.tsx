import React, { useState } from 'react';
import { LogEvent } from '../types/soc';
import { Globe2, Network, ShieldAlert, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

interface HttpDnsInspectorProps {
  events: LogEvent[];
}

export const HttpDnsInspector: React.FC<HttpDnsInspectorProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HTTP' | 'DNS'>('HTTP');

  const httpEvents = events.filter(e => e.protocol === 'HTTP' || e.protocol === 'HTTPS' || e.eventType === 'HTTP_REQUEST');
  const dnsEvents = events.filter(e => e.protocol === 'DNS' || e.eventType === 'DNS_QUERY');

  return (
    <div className="glass-panel p-4 flex flex-col h-[380px]">
      {/* Header with Protocol Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          {activeTab === 'HTTP' ? (
            <Globe2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <Network className="w-5 h-5 text-purple-400" />
          )}
          <h2 className="text-sm font-display font-bold text-slate-100 tracking-wider">
            {activeTab === 'HTTP' ? 'HTTP/HTTPS TRAFFIC & OWASP JUICE SHOP' : 'DNS PROTOCOL & TUNNELING INSPECTOR'}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('HTTP')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'HTTP' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HTTP ({httpEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('DNS')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'DNS' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DNS ({dnsEvents.length})
          </button>
        </div>
      </div>

      {/* HTTP Inspector View */}
      {activeTab === 'HTTP' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {httpEvents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-mono">
              NO HTTP LOGS IN CURRENT BUFFER
            </div>
          ) : (
            httpEvents.map(evt => {
              const isMalicious = evt.isSuspicious;

              return (
                <div
                  key={evt.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    isMalicious
                      ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.details.httpMethod === 'POST' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {evt.details.httpMethod || 'GET'}
                      </span>
                      <span className="text-slate-400 text-[11px]">{evt.sourceIp}</span>
                      <span className="text-slate-600">➔</span>
                      <span className="text-slate-300 text-[11px]">{evt.destinationIp}:{evt.destinationPort}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        (evt.details.httpStatus || 200) >= 400 ? 'text-rose-400 bg-rose-950/80 border border-rose-800' : 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                      }`}>
                        HTTP {evt.details.httpStatus || 200}
                      </span>
                      {isMalicious && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/90 px-1.5 py-0.5 rounded border border-rose-600">
                          {evt.category.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80 text-slate-300 break-all text-[11px]">
                    <span className="text-cyan-400 font-semibold">{evt.details.url || '/'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DNS Inspector View */}
      {activeTab === 'DNS' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {dnsEvents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-mono">
              NO DNS LOGS IN CURRENT BUFFER
            </div>
          ) : (
            dnsEvents.map(evt => {
              const isTunneling = evt.category === 'dns_tunneling' || evt.category === 'dns_anomaly';
              const entropy = evt.details.dnsEntropy || 0;

              return (
                <div
                  key={evt.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    isTunneling
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_12px_rgba(157,78,221,0.2)]'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                        {evt.details.dnsType || 'A'} RECORD
                      </span>
                      <span className="text-slate-400">{evt.sourceIp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        entropy > 3.8 ? 'bg-rose-950/90 text-rose-300 border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        Entropy: {entropy > 0 ? entropy : 'Nominal'}
                      </span>
                      {isTunneling && (
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-900/80 px-2 py-0.5 rounded border border-purple-500">
                          COVERT EXFIL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80 text-purple-300 break-all text-[11px]">
                    <span className="text-slate-400">Query: </span>
                    {evt.details.dnsQuery || 'unknown-query'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
