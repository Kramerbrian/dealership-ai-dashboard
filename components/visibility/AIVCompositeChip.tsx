"use client";

import { useEffect, useMemo, useState } from "react";
import Sparkline from "@/components/visibility/Sparkline";

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

type Presence = {
  domain: string;
  engines: Array<{ name: EngineName; presencePct: number }>;
  lastCheckedISO: string;
  connected?: boolean;
};

type Weights = Record<EngineName, number>;

export default function AIVCompositeChip({
  domain,
  weights,              // pass from server (registry)
  className
}: {
  domain?: string;
  weights: Weights;     // { ChatGPT:0.35, Perplexity:0.25, Gemini:0.25, Copilot:0.15 }
  className?: string;
}) {
  const [data, setData] = useState<Presence | null>(null);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<number[] | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      const q = new URLSearchParams();
      if (domain) q.set("domain", domain);
      const res = await fetch(`/api/visibility/presence?${q.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (ok) setData(json);
    })();
    return () => { ok = false; };
  }, [domain]);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const q = new URLSearchParams();
        if (domain) q.set("domain", domain);
        const res = await fetch(`/api/visibility/history?${q.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (ok) setHistory(json?.aiv || null);
      } catch {
        /* noop */
      }
    })();
    return () => {
      ok = false;
    };
  }, [domain]);

  const { score, terms } = useMemo(() => {
    const engines = data?.engines || [];
    // only include engines returned (tenant prefs respected by API)
    let sum = 0;
    const t: Array<{ name: EngineName; w: number; p: number }> = [];
    for (const e of engines) {
      const w = weights[e.name] ?? 0;
      const p = e.presencePct ?? 0;
      sum += w * p;
      t.push({ name: e.name, w, p });
    }
    const s = Math.round(sum);
    return { score: s, terms: t.sort((a, b) => (weights[b.name] ?? 0) - (weights[a.name] ?? 0)) };
  }, [data, weights]);

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 transition-colors"
        aria-label="AIV Composite Score"
      >
        AIV <span className="ml-1 text-white font-bold">{score}</span><span className="text-white/70">/100</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-lg border border-white/15 bg-black/90 backdrop-blur-lg p-4 shadow-xl z-50"
          role="tooltip"
        >
          <div className="text-white/80 text-sm font-medium mb-2">How this score is computed</div>
          <div className="text-white/70 text-xs mb-3">
            Σ (weight × presence) across enabled engines.
          </div>

          <ul className="space-y-2">
            {terms.map(t => (
              <li key={t.name} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{t.name}</span>
                <span className="text-white/60">
                  w {t.w.toFixed(2)} × {t.p.toFixed(0)}% = {(t.w * t.p).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 text-xs text-white/50">
            Composite score rounds to nearest integer. Engine weights from Formula Registry.
          </div>
          {history && history.length >= 2 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="text-xs text-white/60 mb-1">AIV 7-day trend</div>
              <Sparkline values={history} width={260} height={50} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

