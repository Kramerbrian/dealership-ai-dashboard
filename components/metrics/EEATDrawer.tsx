'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/orchestratorClient';

type Pillar = 'Experience' | 'Expertise' | 'Authority' | 'Trust';

type PillarRow = {
  pillar: Pillar;
  score: number;
  delta: number;
  evidence: { label: string; url?: string }[];
  opportunities: { title: string; impact: number; effort: string; steps: string[] }[];
};

export function EEATDrawer({ open, onClose, domain }: { open: boolean; onClose: () => void; domain: string }) {
  const [rows, setRows] = React.useState<PillarRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch<{ pillars: Record<string, any> }>(`/metrics/eeat?domain=${encodeURIComponent(domain)}`);
        if (!alive) return;
        const list: PillarRow[] = ['Experience', 'Expertise', 'Authority', 'Trust'].map((p: Pillar) => ({
          pillar: p,
          score: r.pillars?.[p.toLowerCase()]?.score ?? 0,
          delta: r.pillars?.[p.toLowerCase()]?.delta ?? 0,
          evidence: r.pillars?.[p.toLowerCase()]?.evidence ?? [],
          opportunities: r.pillars?.[p.toLowerCase()]?.opportunities ?? []
        }));
        setRows(list);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false };
  }, [open, domain]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[420px] bg-neutral-900 text-white border-l border-neutral-800 shadow-2xl flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Quality Authority Index</div>
            <div className="text-lg font-semibold">E-E-A-T Breakdown</div>
          </div>
          <button className="text-neutral-400 hover:text-white" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 overflow-auto">
          {loading && <div className="text-sm text-neutral-400">Loading…</div>}
          {rows.map(r => (
            <section key={r.pillar} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{r.pillar}</div>
                <div className={`${(r.delta >= 0 ? 'text-emerald-400' : 'text-rose-400')} text-sm`}>
                  {r.score} ({r.delta >= 0 ? '+' : ''}{r.delta})
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">Evidence</div>
                {r.evidence.length === 0 && (
                  <div className="text-xs text-neutral-500">
                    No evidence; add org/author schema, citations, or policy pages.
                  </div>
                )}
                {r.evidence.map((e, i) => (
                  <div key={i} className="text-xs flex justify-between gap-2">
                    <span className="text-neutral-300">{e.label}</span>
                    {e.url && <a className="text-sky-400 underline" href={e.url} target="_blank" rel="noreferrer">open</a>}
                  </div>
                ))}
                <div className="text-xs text-neutral-400 mt-3">Opportunities</div>
                {r.opportunities.length === 0 && <div className="text-xs text-neutral-500">No recommendations.</div>}
                {r.opportunities.map((o, i) => (
                  <div key={i} className="p-3 bg-neutral-800/50 rounded border border-neutral-700 mb-2">
                    <div className="text-sm font-medium">{o.title}</div>
                    <div className="text-xs text-neutral-400">
                      Impact: +{o.impact} pts • Effort: {o.effort}
                    </div>
                    <ul className="mt-2 list-disc list-inside text-xs text-neutral-300">
                      {o.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                    <div className="mt-2">
                      <RunOpportunity steps={o.steps} domain={domain} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}

function RunOpportunity({ steps, domain }: { steps: string[]; domain: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await Promise.all(steps.map(async s => {
            // naive example: map keywords to fix endpoints
            if (/schema/i.test(s)) await fetch('/api/fix/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'schema', domain }) });
            if (/review/i.test(s)) await fetch('/api/fix/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'review', domain }) });
          }));
        } finally { setBusy(false); }
      }}
      className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
    >
      {busy ? 'Applying…' : 'Run Fixes'}
    </button>
  );
}

