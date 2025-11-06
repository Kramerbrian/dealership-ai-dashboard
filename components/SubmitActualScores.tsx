"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";

interface ForecastOption {
  id: string;
  timestamp: string;
  dealers: string[];
  forecast: Record<string, number>;
  daysSince: number;
}

export default function SubmitActualScores() {
  const [forecasts, setForecasts] = useState<ForecastOption[]>([]);
  const [selectedForecastId, setSelectedForecastId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actualScores, setActualScores] = useState<Record<string, number>>({
    AIV: 0,
    ATI: 0,
    CVI: 0,
    ORI: 0,
    GRI: 0,
    DPI: 0,
  });
  const [actualLeads, setActualLeads] = useState<number>(0);
  const [actualRevenue, setActualRevenue] = useState<number>(0);

  const METRICS = ["AIV", "ATI", "CVI", "ORI", "GRI", "DPI"];

  useEffect(() => {
    async function loadForecasts() {
      try {
        const res = await fetch("/api/forecast-actual/list");
        if (!res.ok) throw new Error("Failed to load forecasts");
        const data = await res.json();
        setForecasts(data.forecasts || []);
      } catch (err) {
        console.error("Error loading forecasts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadForecasts();
  }, []);

  // Auto-fill DPI when other KPIs are entered
  useEffect(() => {
    const dpi =
      0.25 * actualScores.AIV +
      0.20 * actualScores.ATI +
      0.25 * actualScores.CVI +
      0.20 * actualScores.ORI +
      0.10 * actualScores.GRI;
    setActualScores((prev) => ({ ...prev, DPI: Math.round(dpi * 10) / 10 }));
  }, [actualScores.AIV, actualScores.ATI, actualScores.CVI, actualScores.ORI, actualScores.GRI]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedForecastId) {
      setError("Please select a forecast");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/forecast-actual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forecastId: selectedForecastId,
          actualScores,
          actualLeads: actualLeads || undefined,
          actualRevenue: actualRevenue || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit actual scores");
      }

      const data = await res.json();
      setSuccess(true);
      setError(null);
      
      // Reset form
      setActualScores({
        AIV: 0,
        ATI: 0,
        CVI: 0,
        ORI: 0,
        GRI: 0,
        DPI: 0,
      });
      setActualLeads(0);
      setActualRevenue(0);
      setSelectedForecastId("");

      // Reload forecasts
      const listRes = await fetch("/api/forecast-actual/list");
      if (listRes.ok) {
        const listData = await listRes.json();
        setForecasts(listData.forecasts || []);
      }

      // Show success message
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit actual scores");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedForecast = forecasts.find((f) => f.id === selectedForecastId);

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Submit Actual Scores</h2>
        <p className="text-sm text-slate-400">
          Track forecast accuracy by submitting actual KPI results
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading forecasts...
        </div>
      ) : forecasts.length === 0 ? (
        <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-sm">
            No forecasts found. Generate forecasts first to track accuracy.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Forecast Selection */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <label className="text-sm font-semibold text-white mb-2 block">
              Select Forecast
            </label>
            <select
              value={selectedForecastId}
              onChange={(e) => setSelectedForecastId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a forecast --</option>
              {forecasts.map((forecast) => (
                <option key={forecast.id} value={forecast.id}>
                  {new Date(forecast.timestamp).toLocaleDateString()} -{" "}
                  {forecast.dealers?.join(", ") || "Group Forecast"} (
                  {forecast.daysSince} days ago)
                </option>
              ))}
            </select>
            {selectedForecast && (
              <div className="mt-3 p-3 bg-slate-950 rounded-lg text-xs">
                <p className="text-slate-400 mb-2">Forecasted Values:</p>
                <div className="grid grid-cols-3 gap-2">
                  {METRICS.map((metric) => (
                    <div key={metric}>
                      <span className="text-slate-500">{metric}:</span>{" "}
                      <span className="text-white font-mono">
                        {selectedForecast.forecast[metric]?.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actual Scores Input */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Actual KPI Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {METRICS.map((metric) => (
                <div key={metric}>
                  <label className="text-xs text-slate-400 mb-1 block">{metric}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={actualScores[metric] || 0}
                    onChange={(e) =>
                      setActualScores({
                        ...actualScores,
                        [metric]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optional: Leads and Revenue */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Actual Results (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Lead Volume</label>
                <input
                  type="number"
                  min="0"
                  value={actualLeads || ""}
                  onChange={(e) => setActualLeads(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 485"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  value={actualRevenue || ""}
                  onChange={(e) => setActualRevenue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 582000"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Actual scores submitted successfully! Accuracy calculated.
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !selectedForecastId}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Actual Scores
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

