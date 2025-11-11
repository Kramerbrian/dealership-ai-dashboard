'use client';

import React from 'react';
import { Check, Lock, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { InstantScore } from './page';

export function InstantResults({ score, onUnlock }: { score: InstantScore; onUnlock: (feature: string) => void }) {
  // Track pricing view
  const handlePricingClick = () => {
    trackEvent('pricing_viewed', {
      score: score.overall,
      revenue_at_risk: score.revenueAtRisk
    });
  };
  return (
    <div className="max-w-6xl mx-auto">
      {/* Score Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 rounded-full px-4 py-2 mb-6">
          <Check className="w-4 h-4" /> Audit Complete
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold mb-4">
          Your AI Visibility Score: {score.overall}/100
        </h2>
        <p className="text-xl text-gray-400">
          {score.overall >= 80 ? 'Excellent! You&apos;re highly visible in AI search.' : 
           score.overall >= 60 ? 'Good start. Small improvements can boost your visibility.' :
           'Needs attention. Critical gaps are affecting your AI visibility.'}
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <MetricCard
          label="AI Visibility"
          value={score.aiVisibility}
          max={100}
          description="How often you appear in AI responses"
          locked={false}
        />
        <MetricCard
          label="Zero-Click Shield"
          value={score.zeroClick}
          max={100}
          description="Protection against zero-click results"
          locked={true}
          onUnlock={() => onUnlock('zeroClick')}
        />
        <MetricCard
          label="UGC Health"
          value={score.ugcHealth}
          max={100}
          description="User-generated content quality"
          locked={false}
        />
        <MetricCard
          label="Geo Trust"
          value={score.geoTrust}
          max={100}
          description="Local search authority"
          locked={true}
          onUnlock={() => onUnlock('geoTrust')}
        />
        <MetricCard
          label="SGP Integrity"
          value={score.sgpIntegrity}
          max={100}
          description="Structured data & knowledge graph"
          locked={true}
          onUnlock={() => onUnlock('sgpIntegrity')}
        />
        <MetricCard
          label="Revenue at Risk"
          value={score.revenueAtRisk}
          displayFormat="currency"
          description="Estimated monthly loss from gaps"
          locked={false}
        />
      </div>

      {/* Competitor Ranking */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Competitive Position</h3>
          <span className="text-sm text-gray-400">#{score.competitorRank} of {score.totalCompetitors} dealers</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-900 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${(score.competitorRank / score.totalCompetitors) * 100}%` }}
            />
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to dominate AI search?</h3>
        <p className="text-gray-400 mb-8">Upgrade to Pro for unlimited audits, competitor tracking, and one-click fixes.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a 
            href="/pricing" 
            onClick={handlePricingClick}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            View Pricing Plans
            <ArrowRight className="w-5 h-5" />
          </a>
          <button
            onClick={() => onUnlock('fullReport')}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Share to unlock full report
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, max, displayFormat, description, locked, onUnlock }: { 
  label: string; 
  value: number; 
  max?: number; 
  displayFormat?: 'currency' | 'number' | 'percentage';
  description: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  const formatValue = (val: number) => {
    if (displayFormat === 'currency') {
      return `$${(val / 1000).toFixed(0)}K`;
    }
    if (displayFormat === 'percentage') {
      return `${val}%`;
    }
    return val.toString();
  };

  const percentage = max ? (value / max) * 100 : 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-400">{label}</div>
        {locked && onUnlock && (
          <button
            onClick={onUnlock}
            className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 text-sm"
          >
            <Lock className="w-4 h-4" />
            Unlock
          </button>
        )}
      </div>
      <div className="text-3xl font-bold mb-2">{formatValue(value)}</div>
      {max && (
        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
