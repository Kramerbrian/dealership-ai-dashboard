'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, ArrowRight } from 'lucide-react';

interface CompetitorData {
  name: string;
  distance: string;
  aiVisibilityScore: number;
  monthlyAISearches: number;
  estimatedRevenue: number;
  trend: 'up' | 'down';
}

interface CompetitiveRageBaitProps {
  dealerName?: string;
  dealerScore: number;
  marketLeaderScore: number;
  onCtaClick?: () => void;
}

export default function CompetitiveRageBait({
  dealerName = 'Your Dealership',
  dealerScore,
  marketLeaderScore,
  onCtaClick,
}: CompetitiveRageBaitProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [marketStats, setMarketStats] = useState({
    avgScore: 0,
    yourRank: 0,
    totalDealers: 0,
  });
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Simulate fetching competitor data
    const mockCompetitors: CompetitorData[] = [
      {
        name: 'AutoNation Toyota',
        distance: '2.3 miles',
        aiVisibilityScore: 87,
        monthlyAISearches: 1240,
        estimatedRevenue: 52000,
        trend: 'up',
      },
      {
        name: 'Crown Honda',
        distance: '3.1 miles',
        aiVisibilityScore: 79,
        monthlyAISearches: 980,
        estimatedRevenue: 41000,
        trend: 'up',
      },
      {
        name: 'Sunset Chevrolet',
        distance: '4.7 miles',
        aiVisibilityScore: 72,
        monthlyAISearches: 820,
        estimatedRevenue: 34000,
        trend: 'up',
      },
    ];

    setCompetitors(mockCompetitors);

    // Calculate market stats
    const allScores = [...mockCompetitors.map(c => c.aiVisibilityScore), dealerScore];
    const avgScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
    const sortedScores = [...allScores].sort((a, b) => b - a);
    const yourRank = sortedScores.indexOf(dealerScore) + 1;

    setMarketStats({
      avgScore: Math.round(avgScore),
      yourRank,
      totalDealers: allScores.length,
    });
  }, [dealerScore]);

  useEffect(() => {
    // Timer showing opportunity cost accumulating
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const scoreDiff = marketLeaderScore - dealerScore;
  const lostSearchesPerMin = Math.round((scoreDiff / 100) * 3.2); // ~3.2 searches/min avg
  const estimatedLossPerMin = lostSearchesPerMin * 42; // ~$42 per search opportunity

  return (
    <div className="bg-gradient-to-br from-red-950/30 via-gray-900 to-orange-950/30 rounded-2xl border border-red-500/30 p-8">
      {/* Alarming Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <AlertTriangle className="w-10 h-10 text-red-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-2">
            You're Losing to Competitors Right Now
          </h2>
          <p className="text-red-300 text-lg">
            While you're reading this, nearby dealerships are capturing AI-driven searches you're missing
          </p>
        </div>
      </div>

      {/* Live Opportunity Cost Counter */}
      <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 rounded-xl border border-red-500/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            <h3 className="text-lg font-semibold text-white">
              Revenue Lost While You Wait
            </h3>
          </div>
          <div className="text-xs text-gray-400">
            Time on this page: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold text-red-400">
            ${(estimatedLossPerMin * (timeElapsed / 60)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-gray-400">
            <div className="text-sm">~${estimatedLossPerMin}/minute</div>
            <div className="text-xs">{lostSearchesPerMin} searches/min going to competitors</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
            style={{ width: `${Math.min((timeElapsed / 300) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Every 5 minutes you delay = ${(estimatedLossPerMin * 5).toLocaleString()} lost opportunity
        </p>
      </div>

      {/* Market Position */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Your Position */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">{dealerName}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-1">AI Visibility Score</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-red-400">{dealerScore}</div>
                <div className="text-sm text-gray-500">/100</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Market Rank</div>
              <div className="text-2xl font-bold text-orange-400">
                #{marketStats.yourRank} <span className="text-sm text-gray-500">of {marketStats.totalDealers}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Gap to Market Leader</div>
              <div className="text-2xl font-bold text-red-400">-{scoreDiff} points</div>
            </div>
          </div>
        </div>

        {/* Market Leader */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Market Leader</h3>
            <div className="ml-auto">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                #1
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-1">AI Visibility Score</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-green-400">{marketLeaderScore}</div>
                <div className="text-sm text-gray-500">/100</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Est. Monthly AI Revenue</div>
              <div className="text-2xl font-bold text-green-400">
                ${competitors[0]?.estimatedRevenue.toLocaleString() || '52,000'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Monthly AI Searches</div>
              <div className="text-2xl font-bold text-green-400">
                {competitors[0]?.monthlyAISearches.toLocaleString() || '1,240'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Nearby Competitors Dominating AI Search
        </h3>
        <div className="space-y-3">
          {competitors.map((competitor, idx) => (
            <div
              key={idx}
              className="bg-gray-800/30 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded-full font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{competitor.name}</div>
                    <div className="text-xs text-gray-500">{competitor.distance} away</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-semibold">
                    {competitor.trend === 'up' ? '+12%' : '-3%'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500">AI Score</div>
                  <div className="text-lg font-bold text-green-400">{competitor.aiVisibilityScore}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">AI Searches/mo</div>
                  <div className="text-lg font-bold text-white">{competitor.monthlyAISearches.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Est. Revenue</div>
                  <div className="text-lg font-bold text-green-400">
                    ${(competitor.estimatedRevenue / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency CTA */}
      <div className="bg-gradient-to-r from-purple-900/40 via-red-900/40 to-orange-900/40 rounded-xl border border-red-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">
          Don't Let Them Win Another Day
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          While your competitors are capturing <span className="text-red-400 font-bold">67% of AI-driven searches</span> in your market,
          you're leaving <span className="text-red-400 font-bold">${((marketLeaderScore - dealerScore) * 580).toLocaleString()}/month</span> on the table.
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{scoreDiff}</div>
            <div className="text-xs text-gray-500">point gap</div>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-600" />
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">$0</div>
            <div className="text-xs text-gray-500">with our DIY Guide</div>
          </div>
        </div>

        <button
          onClick={onCtaClick}
          className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold py-5 px-10 rounded-xl transition-all transform hover:scale-105 shadow-2xl text-lg"
        >
          Close the Gap Now - Start Free Trial →
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Join 2,847 dealerships who stopped losing to competitors
        </p>
      </div>

      {/* Bottom Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-400 mb-1">Avg. Market Score</div>
            <div className="text-2xl font-bold text-yellow-400">{marketStats.avgScore}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Your Gap to Avg</div>
            <div className={`text-2xl font-bold ${
              dealerScore < marketStats.avgScore ? 'text-red-400' : 'text-green-400'
            }`}>
              {dealerScore < marketStats.avgScore ? '-' : '+'}{Math.abs(dealerScore - marketStats.avgScore)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Time to Catch Up</div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.ceil(scoreDiff / 15)} weeks*
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          *With our Done-For-You service. DIY Guide: {Math.ceil(scoreDiff / 8)} weeks
        </p>
      </div>
    </div>
  );
}
