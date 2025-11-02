'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, TrendingDown, Zap, MapPin, 
  Eye, AlertTriangle, Trophy, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Competitor {
  id: string;
  name: string;
  trustScore: number;
  scoreDelta: number; // Weekly change
  distance: number; // miles away
  city: string;
  recentActivity?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface CompetitorRadarProps {
  competitors: Competitor[];
  yourScore: number;
  yourCity: string;
  onCompetitorClick?: (competitor: Competitor) => void;
}

export const CompetitorRadar: React.FC<CompetitorRadarProps> = ({
  competitors,
  yourScore,
  yourCity,
  onCompetitorClick
}) => {
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'closest' | 'strongest' | 'trending'>('closest');
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Detect big movers
  useEffect(() => {
    const bigMover = competitors.find(c => Math.abs(c.scoreDelta) > 5);
    if (bigMover) {
      setPulsingId(bigMover.id);
      setTimeout(() => setPulsingId(null), 5000);
    }
  }, [competitors]);

  // Sort competitors based on selected method
  const sortedCompetitors = [...competitors].sort((a, b) => {
    switch (sortBy) {
      case 'closest':
        return Math.abs(a.trustScore - yourScore) - Math.abs(b.trustScore - yourScore);
      case 'strongest':
        return b.trustScore - a.trustScore;
      case 'trending':
        return b.scoreDelta - a.scoreDelta;
      default:
        return 0;
    }
  });

  // Calculate statistics
  const avgCompetitorScore = competitors.length > 0 
    ? competitors.reduce((acc, c) => acc + c.trustScore, 0) / competitors.length 
    : 0;
  const beatingCount = competitors.filter(c => c.trustScore < yourScore).length;
  const losingToCount = competitors.length - beatingCount;

  if (competitors.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-gray-900 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Competitor Radar</h3>
            <p className="text-xs text-gray-400">{yourCity} market</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center py-8">
          No competitor data available. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Competitor Radar</h3>
            <p className="text-xs text-gray-400">{yourCity} market</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetailedView(!showDetailedView)}
          className="text-xs text-purple-500 hover:text-purple-400 font-medium flex items-center gap-1"
        >
          {showDetailedView ? 'Compact' : 'Detailed'}
          <Eye className="w-3 h-3" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400 mb-1">Your Rank</p>
          <p className="text-lg font-bold text-white">
            #{losingToCount + 1}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400 mb-1">Beating</p>
          <p className="text-lg font-bold text-green-500">
            {beatingCount}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400 mb-1">Avg Score</p>
          <p className="text-lg font-bold text-white">
            {avgCompetitorScore.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'closest', label: 'Closest' },
          { value: 'strongest', label: 'Strongest' },
          { value: 'trending', label: 'Trending' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSortBy(value as any)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${sortBy === value
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Competitor List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedCompetitors.map((competitor, index) => {
          const scoreDiff = competitor.trustScore - yourScore;
          const isAhead = scoreDiff > 0;
          const isPulsing = pulsingId === competitor.id;
          const isDangerous = Math.abs(scoreDiff) <= 3; // Close competitor

          return (
            <motion.button
              key={competitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCompetitorClick?.(competitor)}
              className={`w-full p-3 rounded-lg border transition-all text-left
                hover:border-purple-500/50 hover:bg-gray-800/50 relative
                ${isPulsing ? 'border-amber-500 animate-pulse' : 'border-gray-700'}
                ${isDangerous && isAhead ? 'ring-2 ring-red-500/20' : ''}
              `}
            >
              {/* Rank Badge */}
              {index < 3 && (
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full 
                  bg-gradient-to-br from-amber-500 to-orange-500 
                  flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {index + 1}
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {competitor.name}
                  </span>
                  {isDangerous && (
                    <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  )}
                  {isAhead && index === 0 && (
                    <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono font-bold ${
                    isAhead ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {isAhead ? '+' : ''}{scoreDiff.toFixed(0)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Details Row */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{competitor.distance} mi away</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  competitor.scoreDelta > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {competitor.scoreDelta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-medium">
                    {Math.abs(competitor.scoreDelta)}pt/wk
                  </span>
                </div>
              </div>

              {/* Recent Activity Alert */}
              {competitor.recentActivity && (
                <div className="flex items-start gap-2 p-2 rounded bg-purple-500/10 border border-purple-500/20 mt-2">
                  <AlertTriangle className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-400 leading-tight">
                    {competitor.recentActivity}
                  </p>
                </div>
              )}

              {/* Detailed View */}
              {showDetailedView && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  {competitor.strengths && competitor.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-500 mb-1">Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((strength, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full 
                            bg-green-500/10 text-green-400">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-500 mb-1">Weaknesses:</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full 
                            bg-yellow-500/10 text-yellow-400">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer Insights */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-start gap-2 text-xs">
          {losingToCount === 0 ? (
            <>
              <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-500">
                You're #1 in your market! Maintain your lead by staying proactive.
              </p>
            </>
          ) : losingToCount <= 2 ? (
            <>
              <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                You're in the top 3. Close the gap with {sortedCompetitors[0]?.name || 'the leader'} to claim #1.
              </p>
            </>
          ) : (
            <>
              <Target className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                Focus on beating {sortedCompetitors.find(c => c.trustScore > yourScore && 
                  Math.abs(c.trustScore - yourScore) <= 5)?.name || sortedCompetitors[0]?.name} next.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
