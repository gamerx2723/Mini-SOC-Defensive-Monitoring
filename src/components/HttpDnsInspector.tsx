import React, { useState } from 'react';
import { LogEvent } from '../types/soc';
import { Globe2, Network } from 'lucide-react';

interface HttpDnsInspectorProps {
  events: LogEvent[];
}

export const HttpDnsInspector: React.FC<HttpDnsInspectorProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HTTP' | 'DNS'>('HTTP');

  const httpEvents = events.filter(e => e.protocol === 'HTTP' || e.protocol === 'HTTPS' || e.eventType === 'HTTP_REQUEST');
  const dnsEvents = events.filter(e => e.protocol === 'DNS' || e.eventType === 'DNS_QUERY');

  return (
    <div className="soc-card p-5 lg:p-6 flex flex-col h-[420px]">
      {/* Header with Protocol Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            {activeTab === 'HTTP' ? (
              <Globe2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Network className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wider uppercase">
              {activeTab === 'HTTP' ? 'HTTP / Web Application Security' : 'DNS Traffic & Covert Tunneling'}
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">
              {activeTab === 'HTTP' ? 'OWASP Juice Shop & DVWA Exploit Inspection' : 'Shannon Entropy & Subdomain Exfiltration Diagnostics'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('HTTP')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'HTTP'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            HTTP / WEB ({httpEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('DNS')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'DNS'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            DNS EXFIL ({dnsEvents.length})
          </button>
        </div>
      </div>

      {/* HTTP Inspector View */}
      {activeTab === 'HTTP' && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {httpEvents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500 text-xs font-mono">
              NO HTTP TELEMETRY IN CURRENT BUFFER
            </div>
          ) : (
            httpEvents.map(evt => {
              const isMalicious = evt.isSuspicious;

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    isMalicious
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                      : 'bg-neutral-900/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.details.httpMethod === 'POST' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                      }`}>
                        {evt.details.httpMethod || 'GET'}
                      </span>
                      <span className="text-neutral-400">{evt.sourceIp}</span>
                      <span className="text-neutral-600">➔</span>
                      <span className="text-neutral-300">{evt.destinationIp}:{evt.destinationPort}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        (evt.details.httpStatus || 200) >= 400 ? 'text-rose-300 bg-rose-950/80 border border-rose-800' : 'text-emerald-300 bg-emerald-950/80 border border-emerald-800'
                      }`}>
                        HTTP {evt.details.httpStatus || 200}
                      </span>
                      {isMalicious && (
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-600">
                          {evt.category.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-neutral-200 break-all text-[11px]">
                    <span className="text-amber-400 font-semibold">{evt.details.url || '/'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DNS Inspector View */}
      {activeTab === 'DNS' && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {dnsEvents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500 text-xs font-mono">
              NO DNS TELEMETRY IN CURRENT BUFFER
            </div>
          ) : (
            dnsEvents.map(evt => {
              const isTunneling = evt.category === 'dns_tunneling' || evt.category === 'dns_anomaly';
              const entropy = evt.details.dnsEntropy || 0;

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    isTunneling
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-neutral-900/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                        {evt.details.dnsType || 'A'} RECORD
                      </span>
                      <span className="text-neutral-400">{evt.sourceIp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        entropy > 3.8 ? 'bg-rose-950/90 text-rose-300 border-rose-500' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        Entropy: {entropy > 0 ? entropy : 'Nominal'}
                      </span>
                      {isTunneling && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500">
                          COVERT EXFIL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-amber-300 break-all text-[11px]">
                    <span className="text-neutral-500">Query: </span>
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
