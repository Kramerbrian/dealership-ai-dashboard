/**
 * Consensus Badge Component
 * Displays consensus status (unanimous/majority/weak) for issues
 */

'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, Users } from 'lucide-react';

export type ConsensusStatus = 'unanimous' | 'majority' | 'weak';

interface ConsensusBadgeProps {
  status: ConsensusStatus;
  engines?: string[]; // e.g., ['perplexity', 'chatgpt', 'gemini']
  engineCount?: number; // Number of engines that detected the issue (1-3)
  className?: string;
}

const STATUS_CONFIG = {
  unanimous: {
    label: 'Unanimous',
    icon: CheckCircle2,
    colors: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    iconColor: 'text-emerald-400',
    description: 'All 3 engines agree - safe to auto-fix',
  },
  majority: {
    label: 'Majority',
    icon: AlertTriangle,
    colors: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
    iconColor: 'text-amber-400',
    description: '2 of 3 engines agree - review recommended',
  },
  weak: {
    label: 'Weak',
    icon: Info,
    colors: 'bg-gray-500/15 border-gray-500/40 text-gray-400',
    iconColor: 'text-gray-400',
    description: '1 of 3 engines detected - log only',
  },
};

/**
 * Format engine names for display
 */
function formatEngines(engines?: string[]): string {
  if (!engines || engines.length === 0) return '';
  
  const formatted = engines.map(engine => {
    switch (engine.toLowerCase()) {
      case 'perplexity': return 'Perplexity';
      case 'chatgpt': return 'ChatGPT';
      case 'gemini': return 'Gemini';
      default: return engine;
    }
  });
  
  return formatted.join(', ');
}

export function ConsensusBadge({ 
  status, 
  engines, 
  engineCount,
  className = '' 
}: ConsensusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  // Determine engine count from engines array if not provided
  const count = engineCount ?? engines?.length ?? 0;
  const engineText = engines ? formatEngines(engines) : `${count}/3 engines`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${config.colors} ${className}`}
      title={config.description}
      aria-label={`Consensus: ${config.label} (${engineText})`}
    >
      <Icon className={`w-3 h-3 ${config.iconColor}`} aria-hidden="true" />
      <span className="font-semibold">{config.label}</span>
      {engines && engines.length > 0 && (
        <span className="text-[10px] opacity-75 ml-0.5">
          ({engineText})
        </span>
      )}
      {!engines && count > 0 && (
        <span className="text-[10px] opacity-75 ml-0.5">
          ({count}/3)
        </span>
      )}
    </div>
  );
}

/**
 * Helper function to determine consensus status from issue hits
 */
export function getConsensusStatusFromHits(
  issueHits?: Array<{ id: string; engine: string }>,
  issueId?: string
): ConsensusStatus | null {
  if (!issueHits || issueHits.length === 0) return null;
  
  // Filter hits for this specific issue
  const relevantHits = issueId 
    ? issueHits.filter(hit => hit.id === issueId)
    : issueHits;
  
  if (relevantHits.length === 0) return null;
  
  // Count unique engines
  const uniqueEngines = new Set(relevantHits.map(hit => hit.engine));
  const engineCount = uniqueEngines.size;
  
  if (engineCount === 3) return 'unanimous';
  if (engineCount === 2) return 'majority';
  if (engineCount === 1) return 'weak';
  
  return null;
}

