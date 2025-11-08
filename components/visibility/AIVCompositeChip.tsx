"use client";

import { useEffect, useMemo, useState } from "react";
import Sparkline from "@/components/vis/Sparkline";
import { getLastAIV, setLastAIV } from "@/lib/client/aivStorage";

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";
type Presence = { domain: string; engines: Array<{ name: EngineName; presencePct: number }>; lastCheckedISO: string; };
type Weights = Record<EngineName, number>;
type History = { composite: number[]; rows: Array<{ engines: Record<EngineName, number> }>; lastUpdatedISO: string };

export default function AIVCompositeChip({
  domain, weights, className
}: { domain?: string; weights: Weights; className?: string; }) {
  const [data, setData] = useState<Presence | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [open, setOpen] = useState(false);
  const [sinceLast, setSinceLast] = useState<number | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      const q = new URLSearchParams();
      if (domain) q.set("domain", domain);
      const [visRes, histRes] = await Promise.all([
        fetch(`/api/visibility/presence?${q.toString()}`, { cache: "no-store" }),
        fetch(`/api/visibility/history?${q.toString()}`, { cache: "no-store" })
      ]);
      const vis = visRes.ok ? await visRes.json() : null;
      const hist = histRes.ok ? await histRes.json() : null;
      if (ok) { setData(vis); setHistory(hist); }
    })();
    return () => { ok = false; };
  }, [domain]);

  const { score, terms } = useMemo(() => {
    const engines = data?.engines || [];
    let sum = 0;
    const t: Array<{ name: EngineName; w: number; p: number }> = [];
    for (const e of engines) {
      const w = weights[e.name] ?? 0;
      const p = e.presencePct ?? 0;
      sum += w * p;
      t.push({ name: e.name, w, p });
    }
    const s = Math.round(sum);
    return { score: s, terms: t.sort((a,b)=> (weights[b.name]??0)-(weights[a.name]??0)) };
  }, [data, weights]);

  // compute/store delta vs last visit
  useEffect(() => {
    if (score && score > 0) {
      const prev = getLastAIV(domain);
      if (prev) setSinceLast(score - prev.score);
      setLastAIV({ domain: domain || (data?.domain ?? "default"), score, tsISO: new Date().toISOString() });
    }
  }, [score, domain, data?.domain]);

  const deltaChip = sinceLast == null ? null : (
    <span className={`ml-2 text-xs ${sinceLast >= 0 ? "text-green-400" : "text-red-400"}`}>
      {sinceLast >= 0 ? "▲" : "▼"} {Math.abs(sinceLast)}
    </span>
  );

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}
        onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)}
        className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15"
        aria-label="AIV Composite Score"
      >
        AIV <span className="ml-1 text-white font-bold">{score}</span><span className="text-white/70">/100</span>
        {deltaChip}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] rounded-lg border border-white/15 bg-black/90 backdrop-blur-lg p-4 shadow-xl z-50">
          <div className="text-white/80 text-sm font-medium mb-2">How this score is computed</div>
          <div className="text-white/70 text-xs">Σ (weight × presence) across enabled engines.</div>

          {history?.composite?.length ? (
            <div className="mt-3">
              <Sparkline points={history.composite} width={280} height={36} />
              <div className="mt-1 text-xs text-white/50">
                Last {history.composite.length} checks • updated {timeAgo(history.lastUpdatedISO)}
              </div>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {terms.map(t => (
              <li key={t.name} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{t.name}</span>
                <span className="text-white/60">w {t.w.toFixed(2)} × {t.p.toFixed(0)}% = {(t.w*t.p).toFixed(1)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 text-xs text-white/50">
            Composite rounds to nearest integer. Engine weights from Formula Registry.
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const d = new Date(iso); const sec = Math.max(1, Math.round((Date.now()-d.getTime())/1000));
  if (sec < 60) return `${sec}s ago`; const min = Math.round(sec/60);
  if (min < 60) return `${min}m ago`; const hr = Math.round(min/60);
  return `${hr}h ago`;
}
