"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface ForecastEntry {
  timestamp: string;
  dealers: string[];
  forecast: Record<string, number>;
  ci: string;
  leadsForecast: number;
  revenueForecast: number;
}

interface ActualScores {
  domain: string;
  AIV: number;
  CVI: number;
  DPI: number;
}

export default function ForecastAccuracyLeaderboard() {
  const [history, setHistory] = useState<ForecastEntry[]>([]);
  const [liveScores, setLiveScores] = useState<Record<string, ActualScores>>({});
  const [loading, setLoading] = useState(true);

  // Your dealership domains
  const DEALERS = [
    { name: "Germain Nissan of Naples", domain: "germainnissan.com" },
    { name: "Germain Honda of Dublin", domain: "germainhonda.com" },
    { name: "Germain Toyota of Naples", domain: "germaintoyota.com" },
    { name: "Germain Ford of Beavercreek", domain: "germainford.com" },
  ];

  useEffect(() => {
    async function loadForecasts() {
      try {
        const res = await fetch("/data/forecast-history.json", { cache: "no-store" });
        const data = await res.json();
        setHistory(data);
      } catch {
        console.error("No forecast history available.");
      }
    }

    async function fetchLiveScores() {
      const live: Record<string, ActualScores> = {};
      for (const d of DEALERS) {
        try {
          const res = await fetch(`/api/ai-scores?domain=${d.domain}`);
          const data = await res.json();
          live[d.name] = {
            domain: d.domain,
            AIV: Math.round(data.ai_visibility_overall ?? 0),
            CVI: Math.round(data.cvi_score ?? 0),
            DPI: Math.round(data.dpi_composite ?? 0),
          };
        } catch {
          console.error("Score fetch failed for", d.domain);
        }
      }
      setLiveScores(live);
      setLoading(false);
    }

    loadForecasts();
    fetchLiveScores();
  }, []);

  // Compute accuracy = 100 - average absolute error between forecasted and actual KPIs
  const leaderboard = Object.entries(liveScores).map(([name, actual]) => {
    const recentForecast = history
      .slice()
      .reverse()
      .find((f) => f.dealers.includes(name));

    if (!recentForecast) return { name, accuracy: 0, drift: "N/A" };

    const f = recentForecast.forecast;
    const errors = [
      Math.abs(actual.AIV - f.AIV),
      Math.abs(actual.CVI - f.CVI),
      Math.abs(actual.DPI - f.DPI),
    ];
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const accuracy = Math.max(0, 100 - avgError);
    const drift =
      actual.DPI > f.DPI ? (
        <TrendingUp className="inline w-4 h-4 text-green-400" />
      ) : actual.DPI < f.DPI ? (
        <TrendingDown className="inline w-4 h-4 text-red-400" />
      ) : (
        <span className="text-slate-400">—</span>
      );

    return { name, accuracy, drift };
  });

  const ranked = leaderboard
    .filter((r) => r.accuracy > 0)
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" /> Forecast Accuracy Leaderboard
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating leaderboard…
        </div>
      ) : ranked.length === 0 ? (
        <p className="text-slate-400 text-sm">No forecast accuracy data available.</p>
      ) : (
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2">Rank</th>
              <th className="text-left">Dealership</th>
              <th className="text-center">Accuracy</th>
              <th className="text-center">Drift</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr
                key={r.name}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition"
              >
                <td className="py-2 text-slate-400 w-16">{i + 1}</td>
                <td className="font-semibold text-white">{r.name}</td>
                <td
                  className={`text-center font-medium ${
                    r.accuracy > 85
                      ? "text-green-400"
                      : r.accuracy > 70
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {r.accuracy.toFixed(1)}%
                </td>
                <td className="text-center">{r.drift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
