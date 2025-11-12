'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/orchestratorClient';
import { KPI_DISPLAY_NAMES } from '@/lib/kpi';
import { EEATDrawer } from './EEATDrawer';

type QaiData = {
  value: number;              // 0-100
  delta: number;
  factors: { key: string; weight: number; score: number; note?: string }[];
  evidence: { type: string; label: string; url?: string }[];
};

export function QaiModal({
  domain,
  open,
  onClose
}: { domain: string; open: boolean; onClose: () => void }) {
  const [data, setData] = React.useState<QaiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [eeatOpen, setEeatOpen] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await apiFetch<{ metric: string; value: number; delta: number; factors: any[]; evidence: any[] }>(`/metrics/qai?domain=${encodeURIComponent(domain)}`);
        if (!alive) return;
        setData({ value: r.value, delta: r.delta, factors: r.factors, evidence: r.evidence });
      } catch (e: any) { if (alive) setErr(e.message) } finally { if (alive) setLoading(false) }
    })();
    return () => { alive = false };
  }, [open, domain]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div>
              <div className="text-sm text-neutral-400">Quality Authority Index</div>
              <div className="text-2xl font-semibold">
                QAI: {data?.value ?? '—'} 
                <span className={`${((data?.delta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400')} text-sm ml-2`}>
                  {data && (data.delta >= 0 ? `+${data.delta}` : data.delta)} pts
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Ingredients shown below. Weightings disclosed; proprietary formula not exposed.
              </div>
            </div>
            <button className="text-neutral-400 hover:text-white" onClick={onClose}>✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Drivers</h4>
              <div className="space-y-3 max-h-72 overflow-auto pr-2">
                {loading && <div className="text-sm text-neutral-400">Loading…</div>}
                {data?.factors?.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700">
                    <div className="flex justify-between text-sm">
                      <div className="font-medium">{f.key}</div>
                      <div className="text-neutral-400">{Math.round(f.score)} / 100</div>
                    </div>
                    <div className="w-full bg-neutral-700 h-1 rounded mt-2">
                      <div className="h-1 bg-emerald-500 rounded" style={{ width: `${f.score}%` }} />
                    </div>
                    {f.note && <div className="text-xs text-neutral-400 mt-2">{f.note}</div>}
                    <div className="text-2xs text-neutral-500 mt-1">Weight: {(f.weight * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Evidence</h4>
              <div className="space-y-3 max-h-72 overflow-auto pr-2">
                {data?.evidence?.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700">
                    <div className="text-sm font-medium">{e.label}</div>
                    <div className="text-xs text-neutral-400">{e.type}</div>
                    {e.url && <a className="text-xs text-sky-400 underline" href={e.url} target="_blank" rel="noreferrer">Open</a>}
                  </div>
                )) || <div className="text-sm text-neutral-400">No evidence available.</div>}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEeatOpen(true)}
                  className="px-3 py-2 rounded-lg border border-neutral-700 text-sm hover:bg-neutral-800"
                >
                  Open E-E-A-T
                </button>
                <button
                  onClick={async () => { await apiFetch('/fix/deploy', { method: 'POST', body: { kind: 'schema' } }); }}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
                >
                  Run Schema Coverage Fix
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EEATDrawer open={eeatOpen} onClose={() => setEeatOpen(false)} domain={domain} />
    </>
  );
}

