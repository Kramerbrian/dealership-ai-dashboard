"use client";

import React, { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ForecastAccuracy {
  id: string;
  timestamp: string;
  accuracy: number;
  forecast: Record<string, number>;
  actualScores: Record<string, number>;
}

interface AccuracyStats {
  averageAccuracy: number;
  minAccuracy: number;
  maxAccuracy: number;
  totalForecasts: number;
}

export default function ForecastAccuracyTracker() {
  const [accuracyData, setAccuracyData] = useState<ForecastAccuracy[]>([]);
  const [stats, setStats] = useState<AccuracyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccuracyData() {
      try {
        const res = await fetch("/api/forecast-actual?limit=20");
        if (!res.ok) throw new Error("Failed to load accuracy data");
        
        const data = await res.json();
        setAccuracyData(data.accuracy || []);
        setStats(data.stats);
      } catch (err) {
        console.error("Error loading accuracy data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAccuracyData();
  }, []);

  // Prepare chart data
  const chartData = accuracyData.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    accuracy: item.accuracy,
    forecastDPI: item.forecast.DPI,
    actualDPI: item.actualScores.DPI,
  }));

  // Calculate KPI-level accuracy
  const kpiAccuracy = (() => {
    const kpis = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI'];
    const accuracies: Record<string, { total: number; count: number }> = {};

    kpis.forEach((kpi) => {
      accuracies[kpi] = { total: 0, count: 0 };
    });

    accuracyData.forEach((item) => {
      kpis.forEach((kpi) => {
        const forecast = item.forecast[kpi];
        const actual = item.actualScores[kpi];
        if (forecast !== undefined && actual !== undefined && actual > 0) {
          const error = Math.abs((actual - forecast) / actual) * 100;
          accuracies[kpi].total += 100 - error;
          accuracies[kpi].count++;
        }
      });
    });

    const result: Record<string, number> = {};
    kpis.forEach((kpi) => {
      result[kpi] = accuracies[kpi].count > 0
        ? accuracies[kpi].total / accuracies[kpi].count
        : 0;
    });

    return result;
  })();

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Forecast Accuracy Tracker</h2>
        <div className="text-sm text-slate-400">
          {stats && `${stats.totalForecasts} forecasts tracked`}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading accuracy data...
        </div>
      ) : !stats ? (
        <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-sm">
            No accuracy data yet. Submit actual scores to track forecast accuracy.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Average Accuracy</p>
              <p
                className={`text-2xl font-bold ${
                  stats.averageAccuracy > 85
                    ? "text-green-400"
                    : stats.averageAccuracy > 70
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {stats.averageAccuracy.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Best Forecast</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.maxAccuracy.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Worst Forecast</p>
              <p className="text-2xl font-bold text-red-400">
                {stats.minAccuracy.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Total Tracked</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalForecasts}
              </p>
            </div>
          </div>

          {/* Accuracy Trend Chart */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Forecast Accuracy Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#38bdf8" }}
                  name="Accuracy %"
                />
                <Line
                  type="monotone"
                  dataKey="forecastDPI"
                  stroke="#60a5fa"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Forecasted DPI"
                />
                <Line
                  type="monotone"
                  dataKey="actualDPI"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#34d399" }}
                  name="Actual DPI"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* KPI-Level Accuracy */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Accuracy by KPI
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(kpiAccuracy).map(([kpi, acc]) => ({ kpi, accuracy: acc }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="kpi" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar
                  dataKey="accuracy"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Forecasts Table */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Recent Forecast Accuracy
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">Date</th>
                    <th className="text-right py-2 text-slate-400">Accuracy</th>
                    <th className="text-right py-2 text-slate-400">Forecast DPI</th>
                    <th className="text-right py-2 text-slate-400">Actual DPI</th>
                    <th className="text-center py-2 text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accuracyData.slice(0, 10).map((item) => {
                    const error = Math.abs(item.forecast.DPI - item.actualScores.DPI);
                    return (
                      <tr key={item.id} className="border-b border-slate-800">
                        <td className="py-2 text-slate-300">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={
                              item.accuracy > 85
                                ? "text-green-400"
                                : item.accuracy > 70
                                ? "text-yellow-400"
                                : "text-red-400"
                            }
                          >
                            {item.accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 text-right text-slate-300">
                          {item.forecast.DPI.toFixed(1)}
                        </td>
                        <td className="py-2 text-right text-slate-300">
                          {item.actualScores.DPI.toFixed(1)}
                        </td>
                        <td className="py-2 text-center">
                          {error < 2 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

