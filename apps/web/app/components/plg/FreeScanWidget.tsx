"use client";

/**
 * PLG Free-Scan Widget
 * Landing page component for instant Trust OS lite scans
 * Based on MASTER EXECUTION JSON - PLG Module
 */

import React, { useState } from 'react';
import { Loader2, Search, TrendingUp, Shield, Star, Brain, Zap } from 'lucide-react';

interface ScanResult {
  freshness_score: number;
  business_identity_match_score: number;
  review_trust_score: number;
  ai_mention_rate: number;
  trust_score: number;
  report_id: string;
}

export default function FreeScanWidget() {
  const [step, setStep] = useState<'input' | 'scanning' | 'results'>('input');
  const [dealerUrl, setDealerUrl] = useState('');
  const [results, setResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('scanning');

    try {
      const response = await fetch('/api/trust/scan/lite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_url: dealerUrl }),
      });

      if (!response.ok) {
        throw new Error('Scan failed. Please try again.');
      }

      const data = await response.json();
      setResults(data);
      setStep('results');

      // Track telemetry
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'scan_completed', {
          event_category: 'plg',
          event_label: 'free_scan_widget',
          value: data.trust_score,
        });
      }
    } catch (err: any) {
      setError(err.message);
      setStep('input');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Critical';
  };

  if (step === 'scanning') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
          <h3 className="text-2xl font-bold text-white">Scanning Your Trust Signals...</h3>
          <div className="space-y-2 text-slate-400 text-sm">
            <p className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Analyzing content freshness...
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Verifying business identity...
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-4 h-4" /> Checking review trust...
            </p>
            <p className="flex items-center gap-2">
              <Brain className="w-4 h-4" /> Measuring AI visibility...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl">
        {/* Trust Score Header */}
        <div className="text-center mb-8">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Your Trust Score</h3>
          <div className={`text-7xl font-black ${getScoreColor(results.trust_score)}`}>
            {results.trust_score}
          </div>
          <p className="text-slate-300 text-lg mt-2">{getScoreGrade(results.trust_score)}</p>
        </div>

        {/* Teaser Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Zap className="w-5 h-5" />}
            label="Freshness"
            score={results.freshness_score}
            color={getScoreColor(results.freshness_score)}
          />
          <MetricCard
            icon={<Shield className="w-5 h-5" />}
            label="Identity Match"
            score={results.business_identity_match_score}
            color={getScoreColor(results.business_identity_match_score)}
          />
          <MetricCard
            icon={<Star className="w-5 h-5" />}
            label="Review Trust"
            score={results.review_trust_score}
            color={getScoreColor(results.review_trust_score)}
          />
          <MetricCard
            icon={<Brain className="w-5 h-5" />}
            label="AI Mention"
            score={results.ai_mention_rate}
            color={getScoreColor(results.ai_mention_rate)}
          />
        </div>

        {/* CTA for Full Report */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 text-center">
          <h4 className="text-white text-xl font-bold mb-2">Want the Full Picture?</h4>
          <p className="text-slate-400 mb-4">
            See schema coverage, zero-click visibility, E-E-A-T score, competitor analysis, and actionable fixes.
          </p>
          <a
            href="/sign-in?redirect_url=/dash/onboarding"
            className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
          >
            See Full Report
            <TrendingUp className="w-5 h-5" />
          </a>
        </div>

        {/* Share/Referral Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/share/${results.report_id}`;
              navigator.clipboard.writeText(shareUrl);
              alert('Share link copied! Earn +14 days when someone signs up.');
            }}
            className="text-slate-400 hover:text-cyan-400 text-sm underline transition-colors"
          >
            Copy Share Link (Earn +14 Days Trial)
          </button>
        </div>
      </div>
    );
  }

  // Input Step
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Free Trust Scan
        </h2>
        <p className="text-slate-400">
          See how your dealership ranks on AI search platforms in 10 seconds
        </p>
      </div>

      <form onSubmit={handleScan} className="space-y-4">
        <div>
          <input
            type="url"
            value={dealerUrl}
            onChange={(e) => setDealerUrl(e.target.value)}
            placeholder="Enter your dealership website (e.g., https://example.com)"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
          Start Free Scan
        </button>
      </form>

      <div className="mt-6 grid grid-cols-4 gap-4 text-center text-xs text-slate-500">
        <div>
          <div className="text-cyan-400 font-bold text-lg">5</div>
          <div>Metrics</div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold text-lg">&lt;10s</div>
          <div>Speed</div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold text-lg">Free</div>
          <div>Always</div>
        </div>
        <div>
          <div className="text-cyan-400 font-bold text-lg">No</div>
          <div>Credit Card</div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  color: string;
}

function MetricCard({ icon, label, score, color }: MetricCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2 text-slate-400">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
      <div className="text-slate-400 text-xs mt-1">{label}</div>
    </div>
  );
}
