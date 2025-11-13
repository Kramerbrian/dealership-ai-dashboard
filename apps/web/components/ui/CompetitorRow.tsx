'use client';

import { TrendingUp, TrendingDown, Eye, Star } from 'lucide-react';

interface CompetitorRowProps {
  rank: number;
  name: string;
  score: number;
  trend: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  gap: number;
  weaknesses: string[];
  onView?: (name: string) => void;
}

export function CompetitorRow({
  rank,
  name,
  score,
  trend,
  gap,
  weaknesses,
  onView
}: CompetitorRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTrendIcon = () => {
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left side - Rank and Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
          {getRankIcon(rank)}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Weak:</span>
            <div className="flex flex-wrap gap-1">
              {weaknesses.slice(0, 2).map((weakness, index) => (
                <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  {weakness}
                </span>
              ))}
              {weaknesses.length > 2 && (
                <span className="text-xs text-gray-500">+{weaknesses.length - 2} more</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Score and Trend */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}
          </span>
        </div>
      </div>

      {/* Right side - Gap and Actions */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className={`text-lg font-semibold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`}
          </div>
          <div className="text-xs text-gray-500">Gap</div>
        </div>
        
        {onView && (
          <button
            onClick={() => onView(name)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
        )}
      </div>
    </div>
  );
}
