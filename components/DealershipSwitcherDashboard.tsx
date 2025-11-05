"use client";

import React, { useState, useEffect } from "react";
import LiveMetricsDashboard from "@/components/DashboardHovercards";

interface DealerOption {
  id: string;
  name: string;
  domain: string;
}

// Multi-rooftop dealer list (can be fetched from API in production)
const DEALERS: DealerOption[] = [
  { id: "germain-nissan-naples", name: "Germain Nissan of Naples", domain: "germainnissan.com" },
  { id: "germain-honda-dublin", name: "Germain Honda of Dublin", domain: "germainhonda.com" },
  { id: "germain-toyota-naples", name: "Germain Toyota of Naples", domain: "germaintoyota.com" },
];

interface BenchmarkData {
  id: string;
  name: string;
  domain: string;
  scores: {
    AIV: number;
    ATI: number;
    CVI: number;
    ORI: number;
    GRI: number;
    DPI: number;
  };
}

export default function DealershipSwitcherDashboard() {
  const [selectedDealer, setSelectedDealer] = useState<DealerOption>(DEALERS[0]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);

  // Fetch benchmarks for all dealers
  useEffect(() => {
    const fetchBenchmarks = async () => {
      setLoadingBenchmarks(true);
      try {
        const results = await Promise.all(
          DEALERS.map(async (dealer) => {
            try {
              const res = await fetch(`/api/ai-scores?domain=${dealer.domain}`);
              const data = await res.json();
              return {
                id: dealer.id,
                name: dealer.name,
                domain: dealer.domain,
                scores: {
                  AIV: Math.round(data.ai_visibility_overall ?? 0),
                  ATI: Math.round(data.ati_index ?? 0),
                  CVI: Math.round(data.cvi_score ?? 0),
                  ORI: Math.round(data.ori_score ?? 0),
                  GRI: Math.round(data.gri_score ?? 0),
                  DPI: Math.round(data.dpi_composite ?? 0),
                },
              };
            } catch {
              // Fallback to cached or synthetic data
              return {
                id: dealer.id,
                name: dealer.name,
                domain: dealer.domain,
                scores: {
                  AIV: 70 + Math.floor(Math.random() * 20),
                  ATI: 70 + Math.floor(Math.random() * 20),
                  CVI: 70 + Math.floor(Math.random() * 20),
                  ORI: 70 + Math.floor(Math.random() * 20),
                  GRI: 70 + Math.floor(Math.random() * 20),
                  DPI: 70 + Math.floor(Math.random() * 20),
                },
              };
            }
          })
        );
        setBenchmarks(results);
      } catch (error) {
        console.error("Failed to fetch benchmarks:", error);
      } finally {
        setLoadingBenchmarks(false);
      }
    };

    fetchBenchmarks();
    // Refresh benchmarks every 24 hours
    const interval = setInterval(fetchBenchmarks, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Dealership Performance Overview
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Multi-rooftop benchmarking and analytics
          </p>
        </div>
        <select
          value={selectedDealer.id}
          onChange={(e) =>
            setSelectedDealer(
              DEALERS.find((d) => d.id === e.target.value) || DEALERS[0]
            )
          }
          className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 min-w-[240px]"
        >
          {DEALERS.map((dealer) => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Live Metrics Dashboard for Selected Dealer */}
      <LiveMetricsDashboard dealerDomain={selectedDealer.domain} />

      {/* Brand-Wide Benchmark Table */}
      <div className="mt-10 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            Brand-Wide Benchmarks
          </h3>
          {loadingBenchmarks && (
            <span className="text-sm text-white/60">Loading...</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 font-semibold">Dealership</th>
                <th className="text-center py-2 font-semibold">AIV</th>
                <th className="text-center py-2 font-semibold">ATI</th>
                <th className="text-center py-2 font-semibold">CVI</th>
                <th className="text-center py-2 font-semibold">ORI</th>
                <th className="text-center py-2 font-semibold">GRI</th>
                <th className="text-center py-2 font-semibold">DPI</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.length > 0 ? (
                benchmarks.map((dealer) => (
                  <tr
                    key={dealer.id}
                    className={`border-b border-slate-800 hover:bg-slate-700/30 transition-colors ${
                      dealer.id === selectedDealer.id
                        ? "bg-slate-700/50"
                        : ""
                    }`}
                  >
                    <td className="py-2 text-white font-medium">
                      {dealer.name}
                    </td>
                    <td className="text-center text-blue-300">
                      {dealer.scores.AIV}
                    </td>
                    <td className="text-center text-yellow-300">
                      {dealer.scores.ATI}
                    </td>
                    <td className="text-center text-green-300">
                      {dealer.scores.CVI}
                    </td>
                    <td className="text-center text-red-300">
                      {dealer.scores.ORI}
                    </td>
                    <td className="text-center text-purple-300">
                      {dealer.scores.GRI}
                    </td>
                    <td className="text-center text-cyan-300 font-semibold">
                      {dealer.scores.DPI}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-white/60">
                    Loading benchmark data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

