'use client';

import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  location: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  isUser?: boolean;
}

interface ScoreLeaderboardProps {
  entries?: LeaderboardEntry[];
  timeframe?: 'week' | 'month' | 'all-time';
  showUserRank?: boolean;
}

export function ScoreLeaderboard({
  entries,
  timeframe = 'week',
  showUserRank = true
}: ScoreLeaderboardProps) {
  // Default demo data
  const defaultEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Premium Auto Dealership",
      location: "Dallas, TX",
      score: 94.2,
      trend: 'up',
      trendValue: 2.3
    },
    {
      rank: 2,
      name: "Elite Motors",
      location: "Phoenix, AZ",
      score: 91.8,
      trend: 'up',
      trendValue: 1.5
    },
    {
      rank: 3,
      name: "Metro Honda",
      location: "Seattle, WA",
      score: 87.3,
      trend: 'stable',
      isUser: showUserRank
    },
    {
      rank: 4,
      name: "Riverside Chevrolet",
      location: "Riverside, CA",
      score: 82.1,
      trend: 'down',
      trendValue: 0.8
    },
    {
      rank: 5,
      name: "Coastal BMW",
      location: "San Diego, CA",
      score: 78.9,
      trend: 'up',
      trendValue: 3.2
    },
    {
      rank: 6,
      name: "Summit Ford",
      location: "Denver, CO",
      score: 75.4,
      trend: 'stable'
    },
    {
      rank: 7,
      name: "Capital Toyota",
      location: "Austin, TX",
      score: 72.8,
      trend: 'up',
      trendValue: 1.1
    },
    {
      rank: 8,
      name: "Mountain View Auto",
      location: "Salt Lake City, UT",
      score: 70.3,
      trend: 'down',
      trendValue: 0.5
    },
    {
      rank: 9,
      name: "Desert Valley Motors",
      location: "Las Vegas, NV",
      score: 68.7,
      trend: 'up',
      trendValue: 2.1
    },
    {
      rank: 10,
      name: "Pacific Auto Group",
      location: "Portland, OR",
      score: 65.9,
      trend: 'stable'
    }
  ];

  const displayEntries = entries || defaultEntries;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Award className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return null;
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Top 10 Dealerships</h3>
            <p className="text-sm text-gray-600">
              Ranked by AI Visibility Score • {timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'All Time'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Your Rank</div>
            <div className="text-2xl font-bold text-blue-600">
              #{displayEntries.find(e => e.isUser)?.rank || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-gray-200">
        {displayEntries.map((entry) => (
          <div
            key={entry.rank}
            className={`p-4 transition-colors ${
              entry.isUser
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex items-center gap-2 w-12">
                {getRankIcon(entry.rank) || (
                  <span className={`font-bold ${entry.isUser ? 'text-blue-600' : 'text-gray-400'}`}>
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Dealership Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold truncate ${entry.isUser ? 'text-blue-900' : 'text-gray-900'}`}>
                    {entry.name}
                  </h4>
                  {entry.isUser && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{entry.location}</p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>

                {/* Trend */}
                {entry.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(entry.trend)}
                    {entry.trendValue !== undefined && (
                      <span
                        className={`text-sm font-medium ${
                          entry.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {entry.trend === 'up' ? '+' : ''}{entry.trendValue.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Rankings update hourly • {displayEntries.length} dealerships analyzed
        </p>
      </div>
    </div>
  );
}

