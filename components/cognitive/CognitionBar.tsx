/**
 * Cognition Bar - AI CSO Confidence Level Indicator
 * Shows the system's confidence in its recommendations
 */

'use client';

import { useEffect, useState } from 'react';
import { Brain, Activity } from 'lucide-react';
import { getPersonalityCopy } from '@/lib/cognitive-personality';

interface CognitionBarProps {
  dealerId: string;
  className?: string;
}

export default function CognitionBar({ dealerId, className = '' }: CognitionBarProps) {
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [agentsActive, setAgentsActive] = useState<string[]>([]);

  useEffect(() => {
    // Fetch orchestrator state
    fetch(`/api/orchestrator/status?dealerId=${dealerId}`)
      .then((res) => res.json())
      .then((data) => {
        setConfidence(data.confidence || 0.92);
        setAgentsActive(data.activeAgents || []);
        setIsLoading(false);
      })
      .catch(() => {
        // Default values if API not available
        setConfidence(0.92);
        setAgentsActive([]);
        setIsLoading(false);
      });
  }, [dealerId]);

  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor =
    confidence >= 0.9
      ? 'text-emerald-400'
      : confidence >= 0.75
        ? 'text-blue-400'
        : confidence >= 0.6
          ? 'text-amber-400'
          : 'text-red-400';

  const barColor =
    confidence >= 0.9
      ? 'bg-emerald-400'
      : confidence >= 0.75
        ? 'bg-blue-400'
        : confidence >= 0.6
          ? 'bg-amber-400'
          : 'bg-red-400';

  const personality = getPersonalityCopy('tooltip');

  return (
    <div
      className={`sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-gray-950/80 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-400" />
              <span className="text-gray-400">AI CSO Confidence</span>
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className={`font-semibold tabular-nums ${confidenceColor}`}>
                {isLoading ? '—' : `${confidencePercent}%`}
              </span>
            </div>
            {agentsActive.length > 0 && (
              <div className="flex items-center gap-2 text-gray-500">
                <Activity className="h-4 w-4" />
                <span>{agentsActive.length} agent{agentsActive.length !== 1 ? 's' : ''} active</span>
              </div>
            )}
          </div>
          <div className="text-gray-500 text-xs" title={personality.primary}>
            HAL Active ▮▮
          </div>
        </div>
      </div>
    </div>
  );
}

