"use client";

/**
 * PulseCardGrid Component
 * 
 * Displays Pulse cards in a responsive grid layout.
 * Fetches cards from /api/analyzePulseTelemetry and renders them
 * with severity-based styling and category grouping.
 */

import { useEffect, useState } from "react";
import type { PulseCard } from "@/types/pulse";

interface PulseCardGridProps {
  domain: string;
  tenant?: string;
  role?: string;
  onCardClick?: (card: PulseCard) => void;
}

export function PulseCardGrid({ domain, tenant, role, onCardClick }: PulseCardGridProps) {
  const [cards, setCards] = useState<PulseCard[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ domain });
        if (tenant) params.set('tenant', tenant);
        if (role) params.set('role', role);
        
        const res = await fetch(`/api/analyzePulseTelemetry?${params.toString()}`);
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

    if (domain) {
      fetchCards();
    }
  }, [domain, tenant, role]);

  const severityColors = {
    critical: "border-red-600/50 bg-red-600/10 text-red-400",
    high: "border-orange-600/50 bg-orange-600/10 text-orange-400",
    medium: "border-yellow-600/50 bg-yellow-600/10 text-yellow-400",
    low: "border-green-600/50 bg-green-600/10 text-green-400",
  };

  const categoryIcons = {
    Visibility: "👁️",
    Schema: "📋",
    GBP: "📍",
    UGC: "💬",
    Competitive: "🏆",
    Narrative: "📖",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400">Loading Pulse cards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-600/50 rounded-xl">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
        <p className="text-slate-400">No Pulse cards available</p>
      </div>
    );
  }

  // Group cards by severity for priority display
  const criticalCards = cards.filter(c => c.severity === 'critical');
  const highCards = cards.filter(c => c.severity === 'high');
  const mediumCards = cards.filter(c => c.severity === 'medium');
  const lowCards = cards.filter(c => c.severity === 'low');

  const sortedCards = [...criticalCards, ...highCards, ...mediumCards, ...lowCards];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Total Cards</div>
            <div className="text-2xl font-bold">{summary.totalCards}</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Revenue at Risk</div>
            <div className="text-2xl font-bold text-orange-400">
              ${(summary.revenueAtRisk / 1000).toFixed(0)}K/mo
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Overall AVI</div>
            <div className="text-2xl font-bold">{summary.overallAVI}/100</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Critical Issues</div>
            <div className="text-2xl font-bold text-red-400">
              {summary.bySeverity.critical}
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCards.map((card) => (
          <div
            key={card.key}
            onClick={() => onCardClick?.(card)}
            className={`p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${severityColors[card.severity]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[card.category] || "📊"}</span>
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                      {card.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize border ${severityColors[card.severity]}`}>
                      {card.severity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">{card.summary}</p>
            
            <div className="space-y-2 text-sm border-t border-slate-700/50 pt-4">
              <div>
                <span className="text-slate-400 font-medium">Why it matters:</span>
                <p className="text-slate-300 mt-1">{card.whyItMatters}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Action:</span>
                <p className="text-slate-300 mt-1">{card.recommendedAction}</p>
              </div>
              {card.estimatedImpact && (
                <div className="pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400 font-medium">Impact:</span>
                  <p className="text-slate-200 font-semibold mt-1">{card.estimatedImpact}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

