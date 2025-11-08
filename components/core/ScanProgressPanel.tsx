'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const LABELS: Record<string, string> = {
  aeo: 'AEO',
  schema: 'Schema',
  ugc: 'UGC',
  geo: 'GEO',
  cwv: 'CWV',
  nap: 'NAP',
  synth: 'Synthesize'
};

export function ScanProgressPanel({
  pct,
  running,
  lastEvents
}: {
  pct: number;
  running: boolean;
  lastEvents: { agent?: string; status?: string; message?: string }[];
}) {
  const latest = lastEvents.slice().reverse().find(e => e.agent && e.status);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Full Scan Progress</div>
        <div className="text-xs text-white/60">
          {running ? 'Running' : pct === 100 ? 'Complete' : 'Idle'}
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded overflow-hidden">
        <motion.div
          className="h-2 bg-sky-500"
          style={{ width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
        {running ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          <CheckCircle2 size={14} className="text-emerald-400" />
        )}
        <span>
          {latest?.agent
            ? `${LABELS[latest.agent] || latest.agent}: ${latest.message || latest.status}`
            : 'Standing by…'}
        </span>
      </div>
    </div>
  );
}

