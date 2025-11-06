"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp, AlertCircle, DollarSign, Loader2 } from "lucide-react";
import { DLOCInputs } from "@/lib/analytics/d-loc-calculator";

interface DLOCResults {
  pillar1: {
    adSpendWasted: number;
    lostLeads: number;
    lostSales: number;
    unrealizedProfit: number;
  };
  pillar2: {
    lostLeads: number;
    totalLostSales: number;
    unrealizedProfit: number;
    ltvLoss: number;
  };
  pillar3: {
    totalLostIS: number;
    missedLeads: number;
    lostSales: number;
    unrealizedProfit: number;
  };
  pillar4: {
    totalLTVLoss: number;
  };
  summary: {
    totalDLOC: number;
    byCategory: Array<{ category: string; amount: number; percentage: number }>;
    recommendations: Array<{ priority: string; action: string; investment: number; roi: number }>;
  };
}

export default function DLOCCalculator() {
  const [inputs, setInputs] = useState<Partial<DLOCInputs>>({
    avgGrossProfitNew: 3284,
    avgGrossProfitUsed: 2337,
    avgFIPVR: 2000,
    newUsedRatio: 0.4,
    totalMonthlyAdSpend: 25000,
    totalLeadsGenerated: 1000,
    highIntentLeadRate: 0.35,
    highIntentConversionRate: 0.025,
    lowIntentConversionRate: 0.01,
    searchLostISBudget: 0.20,
    searchLostISRank: 0.10,
    websiteLoadSpeedLossRate: 0.30,
    avgLeadResponseTimeMinutes: 20,
    serviceRetentionRate: 0.65,
    avgServiceProfitPerCustomer3Years: 1350,
    timeDecayAttributionFactor: 0.9,
    geoInfluenceRadiusMiles: 10,
  });

  const [results, setResults] = useState<DLOCResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [gptRecommendations, setGptRecommendations] = useState<any[]>([]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/d-loc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("D-LOC calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!results) return;

    setLoading(true);
    try {
      const res = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          dealerName: "Your Dealership",
          context: "Focus on quick wins with highest ROI",
        }),
      });

      const data = await res.json();
      if (data.success && data.recommendations.gpt) {
        setGptRecommendations(data.recommendations.gpt);
      }
    } catch (error) {
      console.error("Recommendation generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Lost Opportunity Cost Calculator (D-LOC)</h2>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total Monthly Ad Spend</label>
          <input
            type="number"
            value={inputs.totalMonthlyAdSpend || ""}
            onChange={(e) => setInputs({ ...inputs, totalMonthlyAdSpend: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Leads Generated</label>
          <input
            type="number"
            value={inputs.totalLeadsGenerated || ""}
            onChange={(e) => setInputs({ ...inputs, totalLeadsGenerated: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Avg Response Time (minutes)</label>
          <input
            type="number"
            value={inputs.avgLeadResponseTimeMinutes || ""}
            onChange={(e) => setInputs({ ...inputs, avgLeadResponseTimeMinutes: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
          <p className="text-xs text-slate-400 mt-1">Industry standard: 5 minutes</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website Load Speed Loss Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={((inputs.websiteLoadSpeedLossRate || 0) * 100).toFixed(0)}
            onChange={(e) => setInputs({ ...inputs, websiteLoadSpeedLossRate: parseFloat(e.target.value) / 100 })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
          <p className="text-xs text-slate-400 mt-1">Typical: 30% for poor Core Web Vitals</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Search Lost IS - Budget (%)</label>
          <input
            type="number"
            step="0.01"
            value={((inputs.searchLostISBudget || 0) * 100).toFixed(0)}
            onChange={(e) => setInputs({ ...inputs, searchLostISBudget: parseFloat(e.target.value) / 100 })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Search Lost IS - Rank (%)</label>
          <input
            type="number"
            step="0.01"
            value={((inputs.searchLostISRank || 0) * 100).toFixed(0)}
            onChange={(e) => setInputs({ ...inputs, searchLostISRank: parseFloat(e.target.value) / 100 })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Calculator className="w-5 h-5" />
            Calculate Lost Opportunity Cost
          </>
        )}
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Total Lost Opportunity Cost</h3>
              <DollarSign className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-4xl font-bold text-red-400">
              ${results.summary.totalDLOC.toLocaleString()}
              <span className="text-lg text-slate-400 ml-2">/month</span>
            </div>
          </div>

          {/* Breakdown by Pillar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Pillar 1: Ad Spillage</h4>
              <p className="text-2xl font-bold text-white">${results.pillar1.unrealizedProfit.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Website failure waste</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
              <h4 className="font-semibold text-orange-400 mb-2">Pillar 2: Process Failure</h4>
              <p className="text-2xl font-bold text-white">${results.pillar2.unrealizedProfit.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Lead handling loss</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Pillar 3: Market Failure</h4>
              <p className="text-2xl font-bold text-white">${results.pillar3.unrealizedProfit.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Budget/rank constraints</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              ROI-Based Recommendations
            </h3>
            <div className="space-y-3">
              {results.summary.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-slate-900 rounded border border-slate-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.priority === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                        rec.priority === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-green-400 font-semibold">{rec.roi.toFixed(0)}% ROI</span>
                    </div>
                    <p className="font-medium text-white">{rec.action}</p>
                    <p className="text-sm text-slate-400 mt-1">Investment: ${rec.investment.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerateRecommendations}
              disabled={loading}
              className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
            >
              Generate GPT-Powered Detailed Recommendations
            </button>

            {gptRecommendations.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-white">AI-Generated Recommendations</h4>
                {gptRecommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-900 rounded border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{rec.title || `Recommendation ${i + 1}`}</span>
                      {rec.priority && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                          {rec.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{rec.description}</p>
                    {rec.steps && (
                      <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                        {rec.steps.map((step: string, j: number) => (
                          <li key={j}>{step}</li>
                        ))}
                      </ul>
                    )}
                    {rec.estimatedRecovery && (
                      <p className="text-xs text-green-400 mt-2">
                        Estimated Recovery: {rec.estimatedRecovery}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

