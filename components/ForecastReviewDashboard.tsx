"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

interface ForecastEntry {
  timestamp: string;
  forecast: Record<string, number>;
  ci: string;
  leadsForecast: number;
  revenueForecast: number;
}

interface ChartData {
  date: string;
  AIV: number;
  CVI: number;
  DPI: number;
  lowerCI: number;
  upperCI: number;
}

export default function ForecastReviewDashboard() {
  const [history, setHistory] = useState<ForecastEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecastHistory() {
      try {
        const res = await fetch("/api/forecast-history", { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error("No forecast history found");
        }
        
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Error loading forecast history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    loadForecastHistory();
  }, []);

  const data: ChartData[] = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    AIV: h.forecast.AIV,
    CVI: h.forecast.CVI,
    DPI: h.forecast.DPI,
    lowerCI: h.forecast.DPI - parseFloat(h.ci),
    upperCI: h.forecast.DPI + parseFloat(h.ci),
  }));

  const accuracy = (() => {
    if (data.length < 2) return 100;
    let driftSum = 0;
    for (let i = 1; i < data.length; i++) {
      driftSum += Math.abs(data[i].DPI - data[i - 1].DPI);
    }
    const avgDrift = driftSum / (data.length - 1);
    return Math.max(0, 100 - avgDrift);
  })();

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <h2 className="text-2xl font-bold text-white">Forecast Review Dashboard</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading historical data...
        </div>
      ) : history.length === 0 ? (
        <p className="text-slate-400 text-sm">No logged forecasts yet. Generate forecasts to see historical trends.</p>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400">Logged Forecasts</p>
              <p className="text-xl font-bold text-white">{history.length}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400">Last Forecast</p>
              <p className="text-xl font-bold text-cyan-400">
                {data[data.length - 1].date}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400">Avg Confidence Interval</p>
              <p className="text-xl font-bold text-purple-400">
                ±
                {(
                  history.reduce((s, h) => s + parseFloat(h.ci), 0) /
                  history.length
                ).toFixed(1)}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400">Model Reliability Score</p>
              <p
                className={`text-xl font-bold ${
                  accuracy > 85
                    ? "text-green-400"
                    : accuracy > 70
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Forecast vs Confidence Chart */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              DPI Forecast vs. Confidence Range
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="ciFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upperCI"
                  stroke="none"
                  fill="url(#ciFill)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerCI"
                  stroke="none"
                  fill="#0f172a"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="DPI"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#38bdf8" }}
                  name="Forecasted DPI"
                />
                <Line
                  type="monotone"
                  dataKey="upperCI"
                  stroke="#60a5fa"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Upper CI"
                />
                <Line
                  type="monotone"
                  dataKey="lowerCI"
                  stroke="#60a5fa"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Lower CI"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* KPI Comparison Chart */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              KPI Forecast Trends (AIV vs CVI)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="AIV"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="AIV"
                />
                <Line
                  type="monotone"
                  dataKey="CVI"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="CVI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

