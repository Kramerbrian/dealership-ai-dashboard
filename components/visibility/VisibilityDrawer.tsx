"use client";

import { useEffect, useState } from "react";
import Sparkline from "@/components/visibility/Sparkline";

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

interface PresenceHistory {
  date: string;
  aiv: number;
  engines: {
    ChatGPT?: number;
    Perplexity?: number;
    Gemini?: number;
    Copilot?: number;
  };
}

interface VisibilityDrawerProps {
  domain?: string;
  open: boolean;
  onClose: () => void;
}

export default function VisibilityDrawer({ domain, open, onClose }: VisibilityDrawerProps) {
  const [history, setHistory] = useState<PresenceHistory[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !domain) return;

    setLoading(true);
    (async () => {
      try {
        const q = new URLSearchParams({ domain, days: "30" });
        const res = await fetch(`/api/visibility/history?${q.toString()}`, { cache: "no-store" });
        const json = await res.json();
        setHistory(json?.history || null);
      } catch {
        setHistory(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, domain]);

  if (!open) return null;

  const engines: EngineName[] = ["ChatGPT", "Perplexity", "Gemini", "Copilot"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-white/20 bg-black/95 backdrop-blur-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Visibility History</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">Loading history...</div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-12 text-white/60">No history available</div>
        ) : (
          <div className="space-y-6">
            {/* Overall AIV Trend */}
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="text-sm font-medium text-white/80 mb-2">AIV Composite (30 days)</div>
              <Sparkline
                values={history.map(h => h.aiv)}
                width={600}
                height={80}
                stroke="#93C5FD"
                fill="rgba(147, 197, 253, 0.15)"
              />
              <div className="mt-2 text-xs text-white/50">
                Current: {history[history.length - 1]?.aiv || 0}/100
              </div>
            </div>

            {/* Per-Engine Trends */}
            <div className="grid grid-cols-2 gap-4">
              {engines.map((engine) => {
                const series = history.map(h => h.engines[engine] || 0);
                const current = series[series.length - 1] || 0;
                const hasData = series.some(v => v > 0);

                if (!hasData) return null;

                return (
                  <div
                    key={engine}
                    className="border border-white/10 rounded-lg p-4 bg-white/5"
                  >
                    <div className="text-sm font-medium text-white/80 mb-2">{engine}</div>
                    <Sparkline
                      values={series}
                      width={280}
                      height={60}
                      stroke="#60A5FA"
                      fill="rgba(96, 165, 250, 0.15)"
                    />
                    <div className="mt-2 text-xs text-white/50">
                      Current: {current}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Breakdown Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-2 text-left text-white/70">Date</th>
                      <th className="px-4 py-2 text-right text-white/70">AIV</th>
                      {engines.map(e => (
                        <th key={e} className="px-4 py-2 text-right text-white/70">{e}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {history.slice(-14).reverse().map((h, i) => (
                      <tr key={h.date} className={i % 2 === 0 ? "bg-white/2" : ""}>
                        <td className="px-4 py-2 text-white/80">{h.date}</td>
                        <td className="px-4 py-2 text-right text-white font-medium">{h.aiv}</td>
                        {engines.map(e => (
                          <td key={e} className="px-4 py-2 text-right text-white/60">
                            {h.engines[e] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

