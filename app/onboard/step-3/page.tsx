'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, AlertTriangle, Trophy, Zap, Clock, Lock } from 'lucide-react';

/**
 * Onboarding Step 3: Results Reveal
 * Shows Trust Score and conversion hooks
 */
export default function OnboardingStep3Page() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  useEffect(() => {
    const stored = sessionStorage.getItem('onboarding_results');
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      // Fallback to mock data
      const url = sessionStorage.getItem('onboarding_url') || 'example.com';
      setResults({
        trustScore: { score: 72, delta: 0 },
        competitors: [
          { name: 'Naples Honda', trustScore: 89, delta: 1.2 },
          { name: 'Naples Mazda', trustScore: 84, delta: -0.5 },
        ],
        topIssues: [
          { title: 'Missing schema markup', impact: 12500 },
          { title: 'Poor review response rate', impact: 8500 },
        ],
        url,
      });
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  const { trustScore, competitors, topIssues, url } = results;
  const marketAvg = competitors.length > 0
    ? competitors.reduce((sum: number, c: any) => sum + c.trustScore, 0) / competitors.length
    : 72;
  const deltaVsAverage = trustScore.score - marketAvg;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= 3 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step === 3 ? '3' : step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-0.5 ${
                  step < 3 ? 'bg-purple-600' : 'bg-zinc-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Expiry Timer */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">
              This analysis expires in {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Trust Score
          </h1>
          <p className="text-zinc-400 text-lg">
            {deltaVsAverage >= 0 ? (
              <>You're {deltaVsAverage.toFixed(1)} points above the {url.split('.')[1] || 'market'} average</>
            ) : (
              <>You're {Math.abs(deltaVsAverage).toFixed(1)} points below the {url.split('.')[1] || 'market'} average</>
            )}
          </p>
        </div>

        {/* Trust Score Hero */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 mb-6 text-center">
          <div className={`text-7xl font-bold ${getScoreColor(trustScore.score)} tabular-nums mb-2`}>
            {trustScore.score}
          </div>
          <div className="text-zinc-400 text-sm mb-6">
            Trust Score (0-100)
          </div>
          
          {/* Competitive Position */}
          <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-zinc-300">Your Competitive Position</span>
            </div>
            <div className="text-lg font-semibold text-white">
              #{competitors.length + 1} out of {competitors.length + 2} {url.split('.')[1] || 'dealers'}
            </div>
            {competitors.length > 0 && (
              <div className="text-sm text-zinc-400 mt-2">
                {competitors[0].name} is #1 (Trust Score: {competitors[0].trustScore})
              </div>
            )}
          </div>
        </div>

        {/* Key Sections */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Top Issue */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-white">🚨 Your #1 Issue</h3>
            </div>
            {topIssues.length > 0 ? (
              <>
                <p className="text-white mb-2">{topIssues[0].title}</p>
                <p className="text-red-400 font-semibold">
                  ${(topIssues[0].impact / 1000).toFixed(0)}k/month loss
                </p>
              </>
            ) : (
              <p className="text-white">Poor schema markup is costing you $12,500/month in missed leads</p>
            )}
            <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              See How to Fix →
            </button>
          </div>

          {/* Competitive Position */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-white">🏆 Competitive Position</h3>
            </div>
            <p className="text-white mb-2">
              You're #{competitors.length + 1} out of {competitors.length + 2} {url.split('.')[1] || 'dealers'}
            </p>
            {competitors.length > 0 && (
              <p className="text-zinc-400 text-sm">
                {competitors[0].name} is #1 (Trust Score: {competitors[0].trustScore})
              </p>
            )}
          </div>

          {/* Quick Wins */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">⚡ Quick Wins Available</h3>
            </div>
            <p className="text-white mb-2">
              3 fixes under 1 hour could boost your score to {trustScore.score + 6}
            </p>
            <button className="mt-4 text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
              Show Me →
            </button>
          </div>
        </div>

        {/* Conversion Hooks */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Save Your Analysis</h3>
              <p className="text-zinc-300 text-sm mb-4">
                Results will be lost unless you create an account. Track your Trust Score over time and get alerts when competitors pass you.
              </p>
              <div className="text-xs text-zinc-400">
                <span className="font-semibold text-amber-400">2,847 dealers</span> use DealershipAI to track their AI visibility
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/onboard/step-4')}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Save My Analysis (Free) →
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-4 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-all"
          >
            Explore Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
