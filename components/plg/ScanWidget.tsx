/**
 * PLG Scan Widget
 * Landing page widget for product-led growth
 */

'use client';

import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface ScanResult {
  dealer: {
    name: string;
    url: string;
  };
  scores: {
    freshness_score: number;
    info_match_score: number;
    review_trust_score: number;
    ai_mention_rate: number;
    trust_score: number;
  };
  hints: string[];
  report_id: string;
}

export function ScanWidget() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, signIn } = useAuth();
  const router = useRouter();

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a dealership URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scan/lite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_url: url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Scan failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run scan');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeFullReport = () => {
    if (isSignedIn) {
      router.push(`/dashboard/scan-report?report_id=${result?.report_id}`);
    } else {
      signIn();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Headline */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          See how trusted your dealership looks to AI.
        </h2>
        <p className="text-white/60 text-lg">
          Run a free scan, view your Trust Score, and get instant insights into your content freshness, NAP accuracy, and schema health.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter your dealership website URL"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                Run Free Scan
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Quick Pulse Check</h3>
              <p className="text-white/60">Here are the top signals that matter.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Freshness Score', key: 'freshness_score' },
                { label: 'Info Match Score', key: 'info_match_score' },
                { label: 'Review Trust Score', key: 'review_trust_score' },
                { label: 'AI Mention Rate', key: 'ai_mention_rate' },
                { label: 'Trust Score', key: 'trust_score' },
              ].map(({ label, key }) => {
                const score = result.scores[key as keyof typeof result.scores] as number;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border ${getScoreBg(score)}`}
                  >
                    <p className="text-xs text-white/60 mb-2">{label}</p>
                    <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Hints */}
            {result.hints.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-2">Key Insights</h4>
                <ul className="space-y-2">
                  {result.hints.map((hint, index) => (
                    <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleSeeFullReport}
                className="flex-1 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                See Full Report
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/r/${result.report_id}`
                  );
                  // Show toast notification
                }}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
              >
                Copy Share Link
              </button>
            </div>

            {/* Conversion Hook */}
            {result.scores.trust_score < 70 && (
              <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  You're missing visibility opportunities worth up to $45,000/mo. Unlock your full report.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

