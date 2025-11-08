"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getApiBase } from "@/lib/apiConfig";

type Evidence = { label: string; url?: string };
type Opportunity = { title: string; impact: number; effort: string; steps: string[] };
type Pillar = "experience" | "expertise" | "authority" | "trust";

type PillarData = {
  score: number;
  delta: number;
  evidence: Evidence[];
  opportunities: Opportunity[];
};

export default function EEATDrawer({
  domain,
  open,
  onClose
}: {
  domain: string;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [pillars, setPillars] = useState<Record<Pillar, PillarData> | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;

      setLoading(true);
      try {
        const res = await fetch(`${getApiBase()}/metrics/eeat?domain=${encodeURIComponent(domain)}`, { cache: "no-cache" });
        const json = await res.json();
        if (!alive) return;
        setPillars(json.pillars);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, domain]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        className="absolute right-0 top-0 w-[420px] h-full bg-white/05 backdrop-blur-xl border-l border-white/10 text-white"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="text-xs text-white/60">Quality Authority Index</div>
            <div className="text-lg font-semibold">E-E-A-T Breakdown</div>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white"><X /></button>
        </div>

        {loading && <div className="p-4 text-white/70 text-sm">Loading…</div>}

        {!loading && pillars && (
          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
            {(["experience","expertise","authority","trust"] as Pillar[]).map((p) => {
              const row = pillars[p];
              if (!row) return null;

              return (
                <section key={p} className="p-4 rounded-xl bg-white/08 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold capitalize">{p}</div>
                    <div className="text-right">
                      <div className="text-xl font-light">{row.score}</div>
                      <div className={"text-xs flex items-center gap-1 " + (row.delta >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {row.delta >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {row.delta >= 0 ? `+${row.delta}` : row.delta} pts
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="mt-3">
                    <div className="text-xs text-white/60">Evidence</div>
                    <div className="space-y-1 mt-1">
                      {row.evidence.length === 0 && <div className="text-xs text-white/50">No evidence provided.</div>}
                      {row.evidence.map((e, i) => (
                        <div key={i} className="text-xs flex items-center justify-between">
                          <span className="text-white/80">{e.label}</span>
                          {e.url && <a className="text-sky-400 underline" href={e.url} target="_blank">open</a>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60 mb-1">Opportunities</div>
                    <div className="space-y-2">
                      {row.opportunities.length === 0 && <div className="text-xs text-white/50">No recommendations.</div>}
                      {row.opportunities.map((o, i) => (
                        <div key={i} className="p-3 rounded bg-white/06 border border-white/10">
                          <div className="text-sm font-medium">{o.title}</div>
                          <div className="text-xs text-white/60">Impact: +{o.impact} pts • Effort: {o.effort}</div>
                          <ul className="text-xs text-white/70 list-disc list-inside mt-1">
                            {o.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                          {/* Hook into your Fix Pack if desired */}
                          <button
                            className="mt-2 px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-500"
                            onClick={async () => {
                              await fetch(`/api/fix/deploy`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ kind: "schema", domain }) });
                            }}
                          >
                            Run Fix
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </motion.aside>
    </div>
  );
}
