import React, { useState } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
import { parseRawLogs } from '../engine/logParser';
import { LogEvent } from '../types/soc';

interface LogIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestLogs: (parsedEvents: LogEvent[]) => void;
}

const PRESET_LOG_SNIPPETS = {
  hydra: `Aug 30 06:20:01 auth-bastion sshd[3412]: Failed password for invalid user root from 185.220.101.5 port 48122 ssh2
Aug 30 06:20:02 auth-bastion sshd[3415]: Failed password for invalid user admin from 185.220.101.5 port 48124 ssh2
Aug 30 06:20:03 auth-bastion sshd[3418]: Failed password for invalid user administrator from 185.220.101.5 port 48126 ssh2
Aug 30 06:20:04 auth-bastion sshd[3420]: Failed password for invalid user support from 185.220.101.5 port 48128 ssh2
Aug 30 06:20:05 auth-bastion sshd[3422]: Failed password for invalid user oracle from 185.220.101.5 port 48130 ssh2`,

  juiceshop: `194.26.29.112 - - [30/Aug/2026:06:22:10 +0000] "GET /rest/products/search?q=' UNION SELECT id, email, password FROM Users -- HTTP/1.1" 500 1204
194.26.29.112 - - [30/Aug/2026:06:22:15 +0000] "POST /rest/user/login?email=' OR '1'='1' -- HTTP/1.1" 200 450
194.26.29.112 - - [30/Aug/2026:06:22:20 +0000] "GET /api/Feedbacks?comment=<script>alert('pwned')</script> HTTP/1.1" 403 620
194.26.29.112 - - [30/Aug/2026:06:22:25 +0000] "GET /ftp/eastere.gg?file=../../../../etc/passwd HTTP/1.1" 403 350`,

  nmap_json: `{"timestamp":"2026-08-30T06:25:00Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":21,"protocol":"TCP","event_type":"PORT_PROBE","status":"ALERT"}
{"timestamp":"2026-08-30T06:25:01Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":22,"protocol":"TCP","event_type":"PORT_PROBE","status":"ALERT"}
{"timestamp":"2026-08-30T06:25:02Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":80,"protocol":"TCP","event_type":"PORT_PROBE","status":"ALERT"}
{"timestamp":"2026-08-30T06:25:03Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":443,"protocol":"TCP","event_type":"PORT_PROBE","status":"ALERT"}
{"timestamp":"2026-08-30T06:25:04Z","src_ip":"91.240.118.172","dest_ip":"10.0.0.15","dest_port":3306,"protocol":"TCP","event_type":"PORT_PROBE","status":"ALERT"}`
};

export const LogIngestionModal: React.FC<LogIngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestLogs
}) => {
  const [logText, setLogText] = useState('');
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParseAndSubmit = () => {
    if (!logText.trim()) return;
    const events = parseRawLogs(logText);
    onIngestLogs(events);
    setLogText('');
    setParsedPreviewCount(null);
    onClose();
  };

  const handleApplyPreset = (key: keyof typeof PRESET_LOG_SNIPPETS) => {
    const text = PRESET_LOG_SNIPPETS[key];
    setLogText(text);
    const evts = parseRawLogs(text);
    setParsedPreviewCount(evts.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel p-6 max-w-2xl w-full border-cyan-500/60 shadow-[0_0_40px_rgba(0,240,255,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-display font-black text-cyan-400 text-glow-cyan tracking-wider">
              RAW LOG INGESTION & SIEM PARSER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-400 font-mono text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        <p className="text-xs font-mono text-slate-300 mb-3">
          Paste raw Syslog, Apache/Nginx combined access logs, Splunk JSON, or load one of the attack presets below to feed directly into the SIEM correlator.
        </p>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Presets:
          </span>
          <button
            onClick={() => handleApplyPreset('hydra')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-rose-300 transition-all"
          >
            Hydra SSH Brute-Force Log
          </button>
          <button
            onClick={() => handleApplyPreset('juiceshop')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 transition-all"
          >
            Juice Shop SQLi / XSS Log
          </button>
          <button
            onClick={() => handleApplyPreset('nmap_json')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-all"
          >
            Nmap Port Scan JSON
          </button>
        </div>

        {/* Text Area */}
        <textarea
          rows={9}
          placeholder="Paste raw log lines here..."
          value={logText}
          onChange={(e) => {
            setLogText(e.target.value);
            const count = parseRawLogs(e.target.value).length;
            setParsedPreviewCount(count);
          }}
          className="w-full bg-slate-950 p-3 rounded-lg border border-slate-700 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all leading-relaxed"
        />

        {parsedPreviewCount !== null && (
          <div className="flex items-center gap-2 mt-2 text-xs font-mono text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Parser parsed {parsedPreviewCount} valid security events ready for ingestion</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            CANCEL
          </button>

          <button
            onClick={handleParseAndSubmit}
            disabled={!logText.trim()}
            className="cyber-btn !px-5 !py-2.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>INGEST & CORRELATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
