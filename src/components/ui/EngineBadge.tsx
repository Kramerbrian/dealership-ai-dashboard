/**
 * EngineBadge Component - Profound-inspired
 * Displays AI engine performance with rank and mentions
 */

import React from 'react';

interface EngineBadgeProps {
  engine: string;
  rank?: number;
  mentions: number;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  className?: string;
}

export function EngineBadge({
  engine,
  rank,
  mentions,
  color = 'blue',
  className = ''
}: EngineBadgeProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'gray': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getEngineIcon = () => {
    switch (engine.toLowerCase()) {
      case 'chatgpt': return '🤖';
      case 'claude': return '🧠';
      case 'perplexity': return '🔍';
      case 'copilot': return '✈️';
      case 'gemini': return '💎';
      case 'grok': return '🚀';
      default: return '🤖';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getColorClasses()} ${className}`}>
      <span className="mr-2 text-lg">{getEngineIcon()}</span>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-semibold text-sm">{engine}</span>
          {rank && (
            <span className="ml-2 text-xs bg-white/10 px-2 py-1 rounded">
              #{rank}
            </span>
          )}
        </div>
        <div className="text-xs opacity-80">
          {mentions.toLocaleString()} mentions
        </div>
      </div>
    </div>
  );
}
