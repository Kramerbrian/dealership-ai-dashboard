import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Types
export type Pillar = "SEO" | "AEO" | "GEO";

export type Weights = Record<Pillar, number>; // values in [20,50], sum to 100

export type PillarScores = Record<Pillar, number>; // 0-100

export interface TrendPoint {
  t: string | number; // label or index
  v: number; // 0-100
}

export interface AIVisibilityCardProps {
  dealerName?: string;
  indexTrend: TrendPoint[]; // overall index trend for sparkline
  pillarTrends?: Partial<Record<Pillar, TrendPoint[]>>;
  pillarScores: PillarScores;
  initialWeights?: Weights; // default { GEO:40, AEO:35, SEO:25 }
  onWeightsChange?: (w: Weights) => void;
  onExportCitations?: () => void; // optional
}

// Guardrails
const MIN_W = 20;
const MAX_W = 50;
const SUM_W = 100;

// Presets
const PRESETS: { key: string; label: string; w: Weights }[] = [
  { key: "baseline", label: "Baseline (GEO 40 / AEO 35 / SEO 25)", w: { GEO: 40, AEO: 35, SEO: 25 } },
  { key: "aeo", label: "AEO‑Heavy (35 / 45 / 20)", w: { GEO: 35, AEO: 45, SEO: 20 } },
  { key: "seo", label: "SEO‑Heavy (35 / 25 / 40)", w: { GEO: 35, AEO: 25, SEO: 40 } },
];

// Utility – clamp and round to 1 decimal (though we show integers in UI)
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// Auto-balance other pillars so sum stays 100 while respecting guardrails
function rebalanceWeights(current: Weights, changedKey: Pillar, newVal: number): Weights {
  const clamped = clamp(newVal, MIN_W, MAX_W);
  const others = (Object.keys(current) as Pillar[]).filter((k) => k !== changedKey);
  const remaining = SUM_W - clamped;

  // Distribute remaining across the other two, proportionally to their current values
  const sumOthers = current[others[0]] + current[others[1]];
  let w1 = round1((current[others[0]] / sumOthers) * remaining);
  let w2 = round1(remaining - w1);

  // Enforce bounds; if we violate, push/pull from the counterpart
  const adjustWithinBounds = (w: number) => clamp(w, MIN_W, MAX_W);
  w1 = adjustWithinBounds(w1);
  w2 = adjustWithinBounds(w2);

  // If bounds forced a shift, normalize back to remaining
  const total = w1 + w2;
  if (total !== remaining) {
    const scale = remaining / total;
    w1 = round1(adjustWithinBounds(w1 * scale));
    w2 = round1(adjustWithinBounds(remaining - w1));
  }

  // Last pass to fix any rounding leaks
  const leak = remaining - (w1 + w2);
  if (Math.abs(leak) >= 0.1) {
    // Nudge the pillar with more headroom
    if (w1 < MAX_W) w1 = round1(w1 + leak);
    else w2 = round1(w2 + leak);
  }

  return {
    [changedKey]: round1(clamped),
    [others[0]]: round1(w1),
    [others[1]]: round1(w2),
  } as Weights;
}

// Compute composite index using weights on the provided pillarScores
function computeIndex(scores: PillarScores, w: Weights) {
  const sum = scores.GEO * (w.GEO / 100) + scores.AEO * (w.AEO / 100) + scores.SEO * (w.SEO / 100);
  return Math.round(sum * 10) / 10; // 1 decimal
}

// Nice conic-gradient ring util
function ringStyle(percent: number) {
  const p = clamp(percent, 0, 100);
  return {
    background: `conic-gradient(var(--ring) ${p * 3.6}deg, var(--ring-muted) ${p * 3.6}deg)`,
  } as React.CSSProperties;
}

// Pillar pretty names
const PILLAR_LABEL: Record<Pillar, string> = { GEO: "GEO (Local)", AEO: "AEO (Answer Engines)", SEO: "SEO (Search)" };

// Mini sparkline fallback data
const fallbackTrend = Array.from({ length: 16 }).map((_, i) => ({ t: i, v: 50 + Math.sin(i / 2) * 10 }));

// Component
const AIVisibilityCard: React.FC<AIVisibilityCardProps> = ({
  dealerName = "Dealer",
  indexTrend,
  pillarTrends,
  pillarScores,
  initialWeights = { GEO: 40, AEO: 35, SEO: 25 },
  onWeightsChange,
  onExportCitations,
}) => {
  const [weights, setWeights] = useState<Weights>(initialWeights);
  const indexScore = useMemo(() => computeIndex(pillarScores, weights), [pillarScores, weights]);

  const handleSlider = (k: Pillar, val: number) => {
    const next = rebalanceWeights(weights, k, val);
    setWeights(next);
    onWeightsChange?.(next);
  };

  const applyPreset = (w: Weights) => {
    setWeights(w);
    onWeightsChange?.(w);
  };

  const topDriver: Pillar = (Object.keys(pillarScores) as Pillar[])
    .sort((a, b) => pillarScores[b] - pillarScores[a])[0];

  return (
    <div
      className="w-full rounded-2xl p-4 sm:p-6 bg-white/70 dark:bg-neutral-900/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur border border-neutral-200/60 dark:border-neutral-800 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
      style={{
        // CSS vars for the ring (light mode)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--ring": "#10b981",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--ring-muted": "#e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold tracking-tight truncate">AI Visibility Index</h3>
          <p className="text-sm text-neutral-500 truncate">{dealerName} · Top driver: {topDriver}</p>
        </div>
        <div className="flex items-center gap-2">
          {onExportCitations && (
            <button
              onClick={onExportCitations}
              className="hidden sm:inline-flex px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              Export Citations CSV
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Index Ring + Sparkline */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
            <div
              className="absolute inset-0 rounded-full"
              style={ringStyle(indexScore)}
            />
            <div className="absolute inset-2 rounded-full bg-white dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800" />
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                key={indexScore}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-2xl sm:text-3xl font-bold tabular-nums"
              >
                {indexScore.toFixed(1)}
              </motion.div>
              <div className="text-xs text-neutral-500 -mt-1">/ 100</div>
            </div>
          </div>
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="text-xs text-neutral-500 mb-1">Last 16 periods</div>
            <div className="w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indexTrend?.length ? indexTrend : fallbackTrend}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    dot={false}
                    strokeWidth={2}
                    stroke="#10b981"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm mt-2"><span className="font-medium">Trend:</span> {(() => {
              const d = (indexTrend?.length ? indexTrend : fallbackTrend);
              const delta = Math.round(((d[d.length - 1].v - d[0].v) / Math.max(1, d[0].v)) * 1000) / 10;
              const s = (delta >= 0 ? "+" : "") + delta + "%";
              return s;
            })()}</div>
          </div>
        </div>

        {/* Pillar tiles */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(pillarScores) as Pillar[]).map((p) => (
            <div key={p} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm text-neutral-500 truncate">{PILLAR_LABEL[p]}</div>
                <div className="text-sm tabular-nums font-semibold">{pillarScores[p].toFixed(1)}</div>
              </div>
              <div className="w-full h-8 sm:h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pillarTrends?.[p]?.length ? pillarTrends[p] : fallbackTrend}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      dot={false}
                      strokeWidth={2}
                      stroke="#10b981"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Weight</span>
                  <span className="tabular-nums">{weights[p].toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={MIN_W}
                  max={MAX_W}
                  step={1}
                  value={weights[p]}
                  onChange={(e) => handleSlider(p, Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presets & Footer */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((pr) => (
            <button
              key={pr.key}
              onClick={() => applyPreset(pr.w)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 whitespace-nowrap"
            >
              {pr.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-neutral-500 leading-relaxed">
          Guardrails: each pillar 20–50%. Sum is always 100%. We auto‑balance others on drag.
        </div>
      </div>

      {/* CSS vars for dark mode ring colors */}
      <style jsx>{`
        :global(.dark) .ring-colors { --ring: #4ade80; --ring-muted: #1f2937; }
      `}</style>
    </div>
  );
};

export default AIVisibilityCard;
