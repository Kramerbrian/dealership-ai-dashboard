"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getApiBase } from "@/lib/apiConfig";

type Factor = { key: string; weight: number; score: number; note?: string };
type Evidence = { type: string; label: string; url?: string };

export default function QaiModal({
  domain,
  open,
  onClose,
  onOpenEEAT
}: {
  domain: string;
  open: boolean;
  onClose: () => void;
  onOpenEEAT: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<number>(0);
  const [delta, setDelta] = useState<number>(0);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;

      setLoading(true); setError(undefined);
      try {
        const res = await fetch(`${getApiBase()}/metrics/qai?domain=${encodeURIComponent(domain)}`, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setValue(json.value);
        setDelta(json.delta);
        setFactors(json.factors || []);
        setEvidence(json.evidence || []);
      } catch (e: any) {
        if (alive) setError(String(e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, domain]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="absolute left-1/2 -translate-x-1/2 top-12 w-full max-w-3xl bg-white/05 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-white overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="text-sm text-white/60">Quality Authority Index</div>
            <div className="text-2xl font-semibold">
              QAI: {loading ? "…" : value}{" "}
              <span className={(delta >= 0 ? "text-emerald-400" : "text-red-400") + " text-sm ml-2"}>
                {loading ? "" : delta >= 0 ? `+${delta} pts` : `${delta} pts`}
              </span>
            </div>
          </div>
          <button className="p-2 text-white/70 hover:text-white" onClick={onClose}><X /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div>
            <div className="text-sm font-semibold mb-2">Drivers</div>
            {error && <div className="text-sm text-red-400 mb-2">Error: {error}</div>}
            {loading && <div className="text-sm text-white/70">Loading…</div>}
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {factors.map((f, i) => (
                <div key={i} className="p-3 bg-white/08 rounded border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{f.key}</div>
                    <div className="text-sm text-white/70">{Math.round(f.score)} / 100</div>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded">
                    <div className="h-2 bg-emerald-500 rounded" style={{ width: `${f.score}%` }} />
                  </div>
                  <div className="text-xs text-white/50 mt-1">Weight: {(f.weight * 100).toFixed(0)}%</div>
                  {f.note && <div className="text-xs text-white/60 mt-2">{f.note}</div>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Evidence</div>
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {evidence.map((e, i) => (
                <div key={i} className="p-3 bg-white/08 rounded border border-white/10">
                  <div className="text-sm font-medium">{e.label}</div>
                  <div className="text-xs text-white/60">{e.type}</div>
                  {e.url && <a className="text-xs text-sky-400 underline" href={e.url} target="_blank">Open</a>}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={onOpenEEAT}
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/08 hover:bg-white/12 text-sm"
              >
                Open E-E-A-T
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
