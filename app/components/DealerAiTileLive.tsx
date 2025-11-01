'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeAiScores } from '@/lib/client/useAiScoreStream';

interface DealerAiTileLiveProps {
  dealerId: string;
}

interface Rollup {
  avi: number;
  ati: number;
  cis: number;
}

interface VinScores {
  avi: number;
  ati: number;
  cis: number;
}

export function DealerAiTileLive({ dealerId }: DealerAiTileLiveProps) {
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const latest = useRef<Record<string, VinScores>>({});

  useEffect(() => {
    const unsub = subscribeAiScores(
      { dealerId },
      (evt) => {
        if (evt.type === 'ai-score') {
          const { vin, avi, ati, cis } = evt.data;
          latest.current[vin] = { avi, ati, cis };

          // Lightweight moving average for live tile
          const vals = Object.values(latest.current);
          const avg = (k: keyof VinScores) =>
            Math.round(
              vals.reduce((s, v) => s + v[k], 0) / Math.max(1, vals.length)
            );
          
          setRollup({
            avi: avg('avi'),
            ati: avg('ati'),
            cis: avg('cis'),
          });
        }
      },
      (error) => {
        console.warn('SSE connection error:', error);
      }
    );

    return unsub;
  }, [dealerId]);

  if (!rollup) {
    return (
      <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
        <div className="text-sm text-gray-500 animate-pulse">Listening for updates…</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="AVI" value={rollup.avi} />
      <Metric label="ATI" value={rollup.ati} />
      <Metric label="CIS" value={rollup.cis} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm border bg-white/80 backdrop-blur ring-1 ring-gray-900/5">
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 font-mono tabular-nums">
        {value}
      </div>
    </div>
  );
}

