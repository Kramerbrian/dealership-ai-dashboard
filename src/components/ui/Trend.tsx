/**
 * Trend Component - Profound-inspired
 * Displays trend indicators with direction and value
 */

import React from 'react';

interface TrendProps {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  timeframe?: string;
  color?: 'green' | 'red' | 'gray' | 'blue';
  className?: string;
}

export function Trend({
  value,
  direction,
  timeframe = 'vs last week',
  color,
  className = ''
}: TrendProps) {
  const getColor = () => {
    if (color) {
      switch (color) {
        case 'green': return 'text-green-400';
        case 'red': return 'text-red-400';
        case 'blue': return 'text-blue-400';
        case 'gray': return 'text-gray-400';
        default: return 'text-gray-400';
      }
    }
    
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getIcon = () => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
      default: return '→';
    }
  };

  const getBackgroundColor = () => {
    if (color) {
      switch (color) {
        case 'green': return 'bg-green-500/20';
        case 'red': return 'bg-red-500/20';
        case 'blue': return 'bg-blue-500/20';
        case 'gray': return 'bg-gray-500/20';
        default: return 'bg-gray-500/20';
      }
    }
    
    switch (direction) {
      case 'up': return 'bg-green-500/20';
      case 'down': return 'bg-red-500/20';
      case 'neutral': return 'bg-gray-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded ${getBackgroundColor()} ${className}`}>
      <span className={`text-sm font-medium ${getColor()}`}>
        {getIcon()} {value}%
      </span>
      {timeframe && (
        <span className="ml-1 text-xs opacity-70">
          {timeframe}
        </span>
      )}
    </div>
  );
}
