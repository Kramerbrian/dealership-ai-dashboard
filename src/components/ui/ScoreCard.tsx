/**
 * ScoreCard Component - Profound-inspired
 * Displays AI visibility scores with trend indicators and benchmarks
 */

import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  outOf?: number;
  status?: 'critical' | 'warning' | 'good' | 'excellent';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  benchmark?: {
    label: string;
    value: number;
  };
  className?: string;
}

export function ScoreCard({
  title,
  score,
  outOf = 100,
  status = 'good',
  trend,
  benchmark,
  className = ''
}: ScoreCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-orange-400';
      case 'good': return 'text-green-400';
      case 'excellent': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    switch (trend.direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
      default: return null;
    }
  };

  const percentage = (score / outOf) * 100;

  return (
    <div className={`bg-white/5 p-6 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {trend && (
          <div className={`flex items-center text-sm ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline mb-2">
          <span className={`text-3xl font-bold ${getStatusColor()}`}>
            {score}
          </span>
          <span className="text-gray-400 ml-2">/ {outOf}</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              status === 'critical' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              status === 'warning' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
              status === 'good' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
              'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {benchmark && (
        <div className="text-sm text-gray-400">
          {benchmark.label}: {benchmark.value}
        </div>
      )}
    </div>
  );
}
