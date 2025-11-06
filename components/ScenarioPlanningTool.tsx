"use client";

import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, Target, Zap, AlertTriangle } from "lucide-react";

interface ScenarioResult {
  scenario: string;
  forecasted: Record<string, number>;
  changes: Record<string, { absolute: number; percent: number }>;
  leadsForecast: number;
  revenueForecast: number;
  revenueImpact: number;
  multipliers: Record<string, number>;
  timestamp: string;
}

const METRICS = ["AIV", "ATI", "CVI", "ORI", "GRI", "DPI"];

export default function ScenarioPlanningTool() {
  const [currentKPIs, setCurrentKPIs] = useState<Record<string, number>>({
    AIV: 80,
    ATI: 75,
    CVI: 85,
    ORI: 70,
    GRI: 78,
  });
  const [scenario, setScenario] = useState<"best" | "worst" | "base" | "custom">("base");
  const [customMultipliers, setCustomMultipliers] = useState<Record<string, number>>({
    AIV: 1.05,
    ATI: 1.03,
    CVI: 1.05,
    ORI: 1.02,
    GRI: 1.04,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  // Calculate current DPI
  const currentDPI = 
    0.25 * currentKPIs.AIV +
    0.20 * currentKPIs.ATI +
    0.25 * currentKPIs.CVI +
    0.20 * currentKPIs.ORI +
    0.10 * currentKPIs.GRI;

  useEffect(() => {
    if (scenario !== "custom") {
      generateScenario();
    }
  }, [scenario, currentKPIs]);

  async function generateScenario() {
    setLoading(true);
    try {
      const res = await fetch("/api/forecast-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentKPIs: { ...currentKPIs, DPI: currentDPI },
          scenario,
          customMultipliers: scenario === "custom" ? customMultipliers : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate scenario");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Scenario generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  const scenarioLabels = {
    best: { label: "Best Case", icon: TrendingUp, color: "text-green-400" },
    worst: { label: "Worst Case", icon: TrendingDown, color: "text-red-400" },
    base: { label: "Base Case", icon: Target, color: "text-blue-400" },
    custom: { label: "Custom Scenario", icon: Zap, color: "text-purple-400" },
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Scenario Planning Tool</h2>
        <p className="text-sm text-slate-400">What-if analysis for strategic planning</p>
      </div>

      {/* Current KPIs Input */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Current KPI Baseline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {METRICS.filter((m) => m !== "DPI").map((metric) => (
            <div key={metric}>
              <label className="text-xs text-slate-400 mb-1 block">{metric}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentKPIs[metric] || 0}
                onChange={(e) =>
                  setCurrentKPIs({ ...currentKPIs, [metric]: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Current DPI</span>
            <span className="text-xl font-bold text-white">{currentDPI.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Select Scenario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["best", "worst", "base", "custom"] as const).map((scenarioType) => {
            const config = scenarioLabels[scenarioType];
            const Icon = config.icon;
            return (
              <button
                key={scenarioType}
                onClick={() => setScenario(scenarioType)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  scenario === scenarioType
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <Icon className={`w-6 h-6 ${config.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-white">{config.label}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Multipliers */}
        {scenario === "custom" && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Custom Growth Multipliers</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {METRICS.filter((m) => m !== "DPI").map((metric) => (
                <div key={metric}>
                  <label className="text-xs text-slate-400 mb-1 block">{metric}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.8"
                    max="1.2"
                    value={customMultipliers[metric] || 1.0}
                    onChange={(e) =>
                      setCustomMultipliers({
                        ...customMultipliers,
                        [metric]: parseFloat(e.target.value) || 1.0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={generateScenario}
                    className="mt-2 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition"
                  >
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Projected DPI</p>
              <p className="text-2xl font-bold text-white">
                {result.forecasted.DPI.toFixed(1)}
              </p>
              <p className="text-xs mt-1">
                <span
                  className={
                    result.changes.DPI.absolute >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {result.changes.DPI.absolute >= 0 ? "+" : ""}
                  {result.changes.DPI.absolute.toFixed(1)} (
                  {result.changes.DPI.percent >= 0 ? "+" : ""}
                  {result.changes.DPI.percent.toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Lead Volume</p>
              <p className="text-2xl font-bold text-white">{result.leadsForecast}</p>
              <p className="text-xs mt-1 text-slate-400">
                {result.leadsForecast - 450 >= 0 ? "+" : ""}
                {result.leadsForecast - 450} vs. baseline
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Revenue Forecast</p>
              <p className="text-2xl font-bold text-white">
                ${(result.revenueForecast / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Revenue Impact</p>
              <p
                className={`text-2xl font-bold ${
                  result.revenueImpact >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.revenueImpact >= 0 ? "+" : ""}
                ${(result.revenueImpact / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          {/* KPI Changes Table */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">KPI Projections</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">KPI</th>
                    <th className="text-right py-2 text-slate-400">Current</th>
                    <th className="text-right py-2 text-slate-400">Projected</th>
                    <th className="text-right py-2 text-slate-400">Change</th>
                    <th className="text-right py-2 text-slate-400">Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {METRICS.filter((m) => m !== "DPI").map((metric) => {
                    const change = result.changes[metric];
                    return (
                      <tr key={metric} className="border-b border-slate-800">
                        <td className="py-2 text-slate-300 font-medium">{metric}</td>
                        <td className="py-2 text-right text-slate-300">
                          {currentKPIs[metric]?.toFixed(1)}
                        </td>
                        <td className="py-2 text-right text-white font-semibold">
                          {result.forecasted[metric].toFixed(1)}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={
                              change.absolute >= 0 ? "text-green-400" : "text-red-400"
                            }
                          >
                            {change.absolute >= 0 ? "+" : ""}
                            {change.absolute.toFixed(1)} (
                            {change.percent >= 0 ? "+" : ""}
                            {change.percent.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {result.multipliers[metric]?.toFixed(3)}x
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-700">
                    <td className="py-2 text-slate-300 font-semibold">DPI</td>
                    <td className="py-2 text-right text-slate-300">{currentDPI.toFixed(1)}</td>
                    <td className="py-2 text-right text-white font-bold text-lg">
                      {result.forecasted.DPI.toFixed(1)}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={
                          result.changes.DPI.absolute >= 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {result.changes.DPI.absolute >= 0 ? "+" : ""}
                        {result.changes.DPI.absolute.toFixed(1)} (
                        {result.changes.DPI.percent >= 0 ? "+" : ""}
                        {result.changes.DPI.percent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a scenario to generate forecast projections</p>
        </div>
      )}
    </div>
  );
}

