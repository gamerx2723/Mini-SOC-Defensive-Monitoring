import React, { useState } from 'react';
import { UploadCloud, Check, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="soc-card p-6 md:p-8 max-w-2xl w-full border-neutral-700 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white tracking-wider">
                Raw Log Telemetry Ingestion
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                Universal Parser (Syslog, Combined Nginx, Nmap, JSON)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono text-xl font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-300 mb-4 font-mono">
          Paste multi-format security logs or select an authorized preset payload to ingest into the SIEM correlation pipeline:
        </p>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          <button
            onClick={() => handleApplyPreset('hydra')}
            className="soc-btn soc-btn-silver !h-7 !px-3 !text-xs !text-rose-300"
          >
            Hydra SSH Brute-Force
          </button>
          <button
            onClick={() => handleApplyPreset('juiceshop')}
            className="soc-btn soc-btn-silver !h-7 !px-3 !text-xs !text-amber-300"
          >
            Juice Shop SQLi / XSS
          </button>
          <button
            onClick={() => handleApplyPreset('nmap_json')}
            className="soc-btn soc-btn-silver !h-7 !px-3 !text-xs !text-neutral-200"
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
          className="w-full bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all leading-relaxed"
        />

        {parsedPreviewCount !== null && (
          <div className="flex items-center gap-2 mt-3 text-xs font-mono text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Parser parsed {parsedPreviewCount} security events ready for ingestion</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="soc-btn soc-btn-silver !h-9 !px-5 text-xs"
          >
            CANCEL
          </button>

          <button
            onClick={handleParseAndSubmit}
            disabled={!logText.trim()}
            className="soc-btn soc-btn-gold !h-9 !px-6"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" />
            <span>INGEST & CORRELATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
