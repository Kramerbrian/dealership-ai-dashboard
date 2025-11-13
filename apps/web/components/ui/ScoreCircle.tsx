'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface ScoreCircleProps {
  score: number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreCircle({ 
  score, 
  label, 
  trend, 
  size = 'md',
  className = '' 
}: ScoreCircleProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl'
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-2 flex flex-col items-center justify-center ${getScoreBgColor(score)}`}>
        <div className={`font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {label}
        </div>
      </div>
      
      {trend && (
        <div className={`flex items-center space-x-1 mt-2 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>+{trend.value}</span>
        </div>
      )}
    </div>
  );
}
