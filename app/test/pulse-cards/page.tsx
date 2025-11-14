"use client";

/**
 * Test Page for Pulse Cards API
 * 
 * Visit /test/pulse-cards to test:
 * - /api/analyzePulseTelemetry
 * - /api/getPulseMetrics
 * - Card rendering
 * - Metrics display
 */

import { useState, useEffect } from "react";
import type { PulseCard } from "@/types/pulse";

export default function PulseCardsTestPage() {
  const [domain, setDomain] = useState("exampledealer.com");
  const [cards, setCards] = useState<PulseCard[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPulseCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyzePulseTelemetry?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCards(data.cards || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Pulse cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/getPulseMetrics?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMetrics(data.metrics || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchPulseCards(), fetchMetrics()]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const severityColors = {
    critical: "bg-red-600/20 border-red-600/50 text-red-400",
    high: "bg-orange-600/20 border-orange-600/50 text-orange-400",
    medium: "bg-yellow-600/20 border-yellow-600/50 text-yellow-400",
    low: "bg-green-600/20 border-green-600/50 text-green-400",
  };

  const categoryColors = {
    Visibility: "bg-blue-600/20 border-blue-600/50",
    Schema: "bg-purple-600/20 border-purple-600/50",
    GBP: "bg-cyan-600/20 border-cyan-600/50",
    UGC: "bg-pink-600/20 border-pink-600/50",
    Competitive: "bg-amber-600/20 border-amber-600/50",
    Narrative: "bg-indigo-600/20 border-indigo-600/50",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pulse Cards API Test</h1>
          <p className="text-slate-400">Test the Pulse Cards endpoints and card generation</p>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                placeholder="exampledealer.com"
              />
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium"
            >
              {loading ? "Loading..." : "Fetch All"}
            </button>
            <button
              onClick={fetchPulseCards}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium"
            >
              Cards Only
            </button>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium"
            >
              Metrics Only
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-600/50 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-sm text-slate-400">Total Cards</div>
              <div className="text-2xl font-bold">{summary.totalCards}</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-sm text-slate-400">Revenue at Risk</div>
              <div className="text-2xl font-bold">${summary.revenueAtRisk.toLocaleString()}/mo</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-sm text-slate-400">Overall AVI</div>
              <div className="text-2xl font-bold">{summary.overallAVI}/100</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-sm text-slate-400">Critical Issues</div>
              <div className="text-2xl font-bold text-red-400">{summary.bySeverity.critical}</div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Aggregated Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Scores</h3>
                <div className="space-y-1 text-sm">
                  <div>AVI: {metrics.scores.avi}/100</div>
                  <div>SEO: {metrics.scores.seo}/100</div>
                  <div>AEO: {metrics.scores.aeo}/100</div>
                  <div>GEO: {metrics.scores.geo}/100</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Health</h3>
                <div className="space-y-1 text-sm">
                  <div>Overall: <span className="capitalize">{metrics.health.overall}</span></div>
                  <div>Needs Attention: {metrics.health.needsAttention}</div>
                  <div>Top Priorities: {metrics.health.topPriority.length}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Competitive</h3>
                <div className="space-y-1 text-sm">
                  <div>Rank: #{metrics.competitive.rank} of {metrics.competitive.total}</div>
                  <div>Gap to Leader: {metrics.competitive.gapToLeader} points</div>
                  <div>Leader: {metrics.competitive.leaderName}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pulse Cards */}
        {cards.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pulse Cards ({cards.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.key}
                  className={`p-6 rounded-2xl border ${categoryColors[card.category]} ${severityColors[card.severity]}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-800/50">
                          {card.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${severityColors[card.severity]}`}>
                          {card.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-3">{card.summary}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Why it matters: </span>
                      <span className="text-slate-300">{card.whyItMatters}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Action: </span>
                      <span className="text-slate-300">{card.recommendedAction}</span>
                    </div>
                    {card.estimatedImpact && (
                      <div>
                        <span className="text-slate-400">Impact: </span>
                        <span className="text-slate-300 font-medium">{card.estimatedImpact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Example */}
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
          <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto">
{`// Get Pulse cards
const res = await fetch('/api/analyzePulseTelemetry?domain=exampledealer.com');
const { cards, summary } = await res.json();

// Get aggregated metrics
const metricsRes = await fetch('/api/getPulseMetrics?domain=exampledealer.com');
const { metrics } = await metricsRes.json();`}
          </pre>
        </div>
      </div>
    </div>
  );
}

