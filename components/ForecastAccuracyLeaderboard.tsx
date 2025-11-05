"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Trophy, TrendingUp, TrendingDown, Award, Sparkles } from "lucide-react";

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

interface LeaderboardEntry {
  name: string;
  accuracy: number;
  drift: React.ReactNode;
  avgError: number;
  badges?: string[]; // Array of badge months (e.g., ["2025-01", "2025-02"])
}

export default function ForecastAccuracyLeaderboard() {
  const [history, setHistory] = useState<ForecastEntry[]>([]);
  const [liveScores, setLiveScores] = useState<Record<string, ActualScores>>({});
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Record<string, string[]>>({}); // dealership -> [month badges]

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
        // Try to load from localStorage first (client-side storage)
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("forecastHistory");
          if (stored) {
            const parsed = JSON.parse(stored);
            setHistory(parsed);
          }

          // Load badges
          const badgeData = localStorage.getItem("forecastBadges");
          if (badgeData) {
            setBadges(JSON.parse(badgeData));
          }
        }

        // Also try API endpoint (for future database integration)
        const res = await fetch("/api/forecast/history", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.forecasts && data.forecasts.length > 0) {
            setHistory(data.forecasts);
          }
        }
      } catch (err) {
        console.error("No forecast history available:", err);
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
        } catch (err) {
          console.error("Score fetch failed for", d.domain, err);
        }
      }

      setLiveScores(live);
      setLoading(false);
    }

    loadForecasts();
    fetchLiveScores();
  }, []);

  // Compute accuracy = 100 - average absolute error between forecasted and actual KPIs
  const leaderboard: LeaderboardEntry[] = Object.entries(liveScores).map(([name, actual]) => {
    // Find the most recent forecast for this dealer (within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentForecast = history
      .slice()
      .reverse()
      .find((f) => {
        const forecastDate = new Date(f.timestamp);
        return f.dealers.includes(name) && forecastDate >= thirtyDaysAgo;
      });

    if (!recentForecast) {
      return { name, accuracy: 0, drift: <span className="text-slate-400">N/A</span>, avgError: 0 };
    }

    const f = recentForecast.forecast;
    const errors = [
      Math.abs(actual.AIV - (f.AIV || 0)),
      Math.abs(actual.CVI - (f.CVI || 0)),
      Math.abs(actual.DPI - (f.DPI || 0)),
    ];
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const accuracy = Math.max(0, 100 - avgError);

    const drift =
      actual.DPI > (f.DPI || 0) ? (
        <div className="flex items-center justify-center gap-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">Outperformed</span>
        </div>
      ) : actual.DPI < (f.DPI || 0) ? (
        <div className="flex items-center justify-center gap-1 text-red-400">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs">Underperformed</span>
        </div>
      ) : (
        <span className="text-slate-400">—</span>
      );

    return { name, accuracy, drift, avgError };
  });

  const ranked = leaderboard
    .filter((r) => r.accuracy > 0)
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" /> Forecast Accuracy Leaderboard
      </h2>

      <p className="text-sm text-slate-400">
        Ranks dealerships by how closely their actual KPIs match forecasted projections. 
        Accuracy = 100% minus average absolute error across AIV, CVI, and DPI.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating leaderboard…
        </div>
      ) : ranked.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="mb-2">No forecast accuracy data available.</p>
          <p className="text-xs">Generate forecasts using the "Show Forecast" button above.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2">Rank</th>
                  <th className="text-left px-2">Dealership</th>
                  <th className="text-center px-2">Accuracy</th>
                  <th className="text-center px-2">Avg Error</th>
                  <th className="text-center px-2">Drift</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, i) => (
                  <tr
                    key={r.name}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3 px-2 text-slate-400 w-16">
                      {i === 0 ? (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="font-semibold">{i + 1}</span>
                        </span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </td>
                    <td className="px-2 font-semibold text-white">{r.name}</td>
                    <td
                      className={`text-center px-2 font-medium ${
                        r.accuracy > 85
                          ? "text-green-400"
                          : r.accuracy > 70
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {r.accuracy.toFixed(1)}%
                    </td>
                    <td className="text-center px-2 text-slate-400 text-xs">
                      ±{r.avgError.toFixed(1)} pts
                    </td>
                    <td className="text-center px-2">{r.drift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 mb-2">Accuracy Scale:</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-400"></span>
                <span>&gt;85% — Excellent forecast discipline</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-yellow-400"></span>
                <span>70–85% — Moderate reliability</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-400"></span>
                <span>&lt;70% — Volatile performance</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

