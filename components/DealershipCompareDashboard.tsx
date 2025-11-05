"use client";

import React, { useState, useEffect } from "react";
import LiveMetricsDashboard from "@/components/DashboardHovercards";

interface DealerOption {
  id: string;
  name: string;
  domain: string;
}

const DEALERS: DealerOption[] = [
  { id: "germain-nissan-naples", name: "Germain Nissan of Naples", domain: "germainnissan.com" },
  { id: "germain-honda-dublin", name: "Germain Honda of Dublin", domain: "germainhonda.com" },
  { id: "germain-toyota-naples", name: "Germain Toyota of Naples", domain: "germaintoyota.com" },
  { id: "germain-ford-beavercreek", name: "Germain Ford of Beavercreek", domain: "germainford.com" },
];

interface ScoreData {
  AIV: number;
  ATI: number;
  CVI: number;
  ORI: number;
  GRI: number;
  DPI: number;
}

// Simple KPI order
const METRICS = ["AIV", "ATI", "CVI", "ORI", "GRI", "DPI"];

export default function DealershipCompareDashboard() {
  const [dealerA, setDealerA] = useState<DealerOption>(DEALERS[0]);
  const [dealerB, setDealerB] = useState<DealerOption>(DEALERS[1]);
  const [scoresA, setScoresA] = useState<ScoreData | null>(null);
  const [scoresB, setScoresB] = useState<ScoreData | null>(null);

  useEffect(() => {
    const fetchScores = async (domain: string, setter: (scores: ScoreData) => void) => {
      try {
        const res = await fetch(`/api/ai-scores?domain=${domain}`);
        const data = await res.json();
        setter({
          AIV: Math.round(data.ai_visibility_overall ?? 0),
          ATI: Math.round(data.ati_index ?? 0),
          CVI: Math.round(data.cvi_score ?? 0),
          ORI: Math.round(data.ori_score ?? 0),
          GRI: Math.round(data.gri_score ?? 0),
          DPI: Math.round(data.dpi_composite ?? 0),
        });
      } catch (err) {
        console.error("Score fetch failed for:", domain, err);
      }
    };

    if (dealerA) fetchScores(dealerA.domain, setScoresA);
    if (dealerB) fetchScores(dealerB.domain, setScoresB);
  }, [dealerA, dealerB]);

  const calcDelta = (a?: number, b?: number) => {
    if (a == null || b == null) return "—";
    const delta = a - b;
    if (Math.abs(delta) < 1) return "±0";
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta}`;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dealership Compare Mode</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1">Dealership A</label>
            <select
              value={dealerA.id}
              onChange={(e) =>
                setDealerA(DEALERS.find((d) => d.id === e.target.value) || DEALERS[0])
              }
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
            >
              {DEALERS.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Dealership B</label>
            <select
              value={dealerB.id}
              onChange={(e) =>
                setDealerB(DEALERS.find((d) => d.id === e.target.value) || DEALERS[1])
              }
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2"
            >
              {DEALERS.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <table className="min-w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 text-white">Metric</th>
              <th className="text-center">{dealerA.name}</th>
              <th className="text-center">{dealerB.name}</th>
              <th className="text-center">Δ Difference</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                <td className="py-2 text-white font-semibold">{m}</td>
                <td className="text-center text-blue-300">{(scoresA as any)?.[m] ?? "—"}</td>
                <td className="text-center text-purple-300">{(scoresB as any)?.[m] ?? "—"}</td>
                <td
                  className={`text-center font-semibold ${
                    (scoresA as any)?.[m] > (scoresB as any)?.[m]
                      ? "text-green-400"
                      : (scoresA as any)?.[m] < (scoresB as any)?.[m]
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  {calcDelta((scoresA as any)?.[m], (scoresB as any)?.[m])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline Summary */}
      <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
        {scoresA && scoresB ? (
          <>
            <p>
              <span className="font-semibold text-white">{dealerA.name}</span> currently leads{" "}
              <span className="text-cyan-400">
                {[
                  "AIV",
                  "ATI",
                  "CVI",
                  "ORI",
                  "GRI",
                  "DPI",
                ].filter((k) => (scoresA as any)?.[k] > (scoresB as any)?.[k]).length}
              </span>{" "}
              of 6 KPIs over <span className="font-semibold text-white">{dealerB.name}</span>.
            </p>
            <p className="mt-1 text-slate-400">
              Use drill-down modals on either side for deep dives (trend, region, focus).
            </p>
          </>
        ) : (
          <p>Loading comparative data...</p>
        )}
      </div>

      {/* Render A + B Dashboards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">{dealerA.name}</h3>
          <LiveMetricsDashboard dealerDomain={dealerA.domain} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">{dealerB.name}</h3>
          <LiveMetricsDashboard dealerDomain={dealerB.domain} />
        </div>
      </div>
    </div>
  );
}

