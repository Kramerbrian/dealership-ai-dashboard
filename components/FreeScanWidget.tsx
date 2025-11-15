'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface TrustScoreResult {
  trust_score: number;
  freshness_score: number;
  business_identity_match_score: number;
  review_trust_score: number;
  schema_coverage: number;
  ai_mention_rate: number;
  zero_click_coverage: number;
  recommendations: string[];
}

interface FreeScanWidgetProps {
  className?: string;
  onComplete?: (email: string, result: TrustScoreResult) => void;
}

export function FreeScanWidget({ className = '', onComplete }: FreeScanWidgetProps) {
  const [step, setStep] = useState<'input' | 'scanning' | 'results'>('input');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TrustScoreResult | null>(null);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim() || !location.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setStep('scanning');
    setScanProgress(0);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/trust/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, location, email }),
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan business');
      }

      const data = await response.json();
      setResult(data);
      setStep('results');

      if (onComplete) {
        onComplete(email, data);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Failed to scan business');
      setStep('input');
      setScanProgress(0);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-50 border-green-200';
    if (score >= 0.6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatScore = (score: number): string => {
    return Math.round(score * 100).toString();
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Free Trust Score Scan
              </h2>
              <p className="text-gray-600">
                See how your dealership appears in AI search results
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Dealership Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g., Smith Auto Group"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Austin, TX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Scan My Dealership
              </button>

              <p className="text-xs text-gray-500 text-center">
                No credit card required • Instant results
              </p>
            </form>
          </motion.div>
        )}

        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Scanning Your Trust Score
              </h3>

              <p className="text-gray-600 mb-8">
                Analyzing your presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot...
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-sm text-gray-500">
                {Math.round(scanProgress)}% complete
              </p>
            </div>
          </motion.div>
        )}

        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your Trust Score
              </h3>
              <p className="text-gray-600">
                Results sent to {email}
              </p>
            </div>

            {/* Overall Trust Score */}
            <div className={`text-center p-6 rounded-xl border-2 mb-6 ${getScoreBgColor((result as any).trust_score)}`}>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor((result as any).trust_score)}`}>
                {formatScore((result as any).trust_score)}
              </div>
              <div className="text-gray-600 font-medium">Overall Trust Score</div>
            </div>

            {/* Component Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ScoreCard
                label="Freshness"
                score={(result as any).freshness_score}
                icon={(result as any).freshness_score >= 0.7 ? TrendingUp : TrendingDown}
              />
              <ScoreCard
                label="Identity Match"
                score={(result as any).business_identity_match_score}
                icon={(result as any).business_identity_match_score >= 0.7 ? TrendingUp : TrendingDown}
              />
              <ScoreCard
                label="Review Trust"
                score={(result as any).review_trust_score}
                icon={(result as any).review_trust_score >= 0.7 ? TrendingUp : TrendingDown}
              />
              <ScoreCard
                label="Schema Coverage"
                score={(result as any).schema_coverage}
                icon={(result as any).schema_coverage >= 0.7 ? TrendingUp : TrendingDown}
              />
              <ScoreCard
                label="AI Mentions"
                score={(result as any).ai_mention_rate}
                icon={(result as any).ai_mention_rate >= 0.7 ? TrendingUp : TrendingDown}
              />
              <ScoreCard
                label="Zero-Click"
                score={(result as any).zero_click_coverage}
                icon={(result as any).zero_click_coverage >= 0.7 ? TrendingUp : TrendingDown}
              />
            </div>

            {/* Recommendations */}
            {(result as any).recommendations && (result as any).recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Top Recommendations
                </h4>
                <ul className="space-y-2">
                  {(result as any).recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => window.location.href = '/signup'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Improve Your Trust Score
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Start free trial • No credit card required
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ElementType;
}

function ScoreCard({ label, score, icon: Icon }: ScoreCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 font-medium">{label}</span>
        <Icon className={`w-4 h-4 ${getScoreColor(score)}`} />
      </div>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {Math.round(score * 100)}
      </div>
    </div>
  );
}
