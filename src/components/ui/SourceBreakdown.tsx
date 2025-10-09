/**
 * SourceBreakdown Component - Profound-inspired
 * Displays source distribution with visual bars
 */

import React from 'react';

interface Source {
  name: string;
  share: number;
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'yellow' | 'gray';
}

interface SourceBreakdownProps {
  sources: Source[];
  title?: string;
  className?: string;
}

export function SourceBreakdown({
  sources,
  title = 'Sources Driving AI Mentions',
  className = ''
}: SourceBreakdownProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const totalShare = sources.reduce((sum, source) => sum + source.share, 0);

  return (
    <div className={`bg-white/5 p-6 rounded-lg border border-white/10 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-400 truncate">
              {source.name}
            </div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColorClasses(source.color)}`}
                  style={{ width: `${(source.share / totalShare) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-sm text-white text-right">
              {source.share}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        Total: {totalShare}% of AI mentions
      </div>
    </div>
  );
}
