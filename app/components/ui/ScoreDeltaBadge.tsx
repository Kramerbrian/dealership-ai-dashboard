'use client';

import React from 'react';

interface ScoreDeltaBadgeProps {
  label: string; // e.g., "AIV", "ATI", "QAI"
  delta: number; // Negative for decrease, positive for increase
  reason?: string; // e.g., "RaR pressure"
  className?: string;
}

/**
 * Badge component showing score deltas with RaR pressure attribution
 */
export function ScoreDeltaBadge({ label, delta, reason, className = '' }: ScoreDeltaBadgeProps) {
  const isNegative = delta < 0;
  const isPositive = delta > 0;
  const absDelta = Math.abs(delta);

  if (Math.abs(delta) < 0.1) {
    // Don't show badge if delta is negligible
    return null;
  }

  const sign = isNegative ? '−' : '+';
  const colorClass = isNegative
    ? 'bg-red-50 text-red-700 border-red-200'
    : isPositive
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${colorClass} ${className}`}
      title={`${label} ${isNegative ? 'decreased' : 'increased'} by ${absDelta.toFixed(1)}%${reason ? ` due to ${reason}` : ''}`}
    >
      <span className="font-semibold">{label}</span>
      <span className="tabular-nums">
        {sign}
        {absDelta.toFixed(1)}%
      </span>
      {reason && (
        <span className="opacity-70 text-[10px] ml-1">
          ({reason})
        </span>
      )}
    </div>
  );
}

interface ScoreDeltasDisplayProps {
  aivDelta?: number;
  atiDelta?: number;
  qaiDelta?: number;
  reason?: string;
}

/**
 * Container component for displaying multiple score deltas
 */
export function ScoreDeltasDisplay({ aivDelta, atiDelta, qaiDelta, reason }: ScoreDeltasDisplayProps) {
  const hasDeltas = aivDelta !== undefined || atiDelta !== undefined || qaiDelta !== undefined;

  if (!hasDeltas) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {aivDelta !== undefined && (
        <ScoreDeltaBadge label="AIV" delta={aivDelta} reason={reason} />
      )}
      {atiDelta !== undefined && (
        <ScoreDeltaBadge label="ATI" delta={atiDelta} reason={reason} />
      )}
      {qaiDelta !== undefined && (
        <ScoreDeltaBadge label="QAI" delta={qaiDelta} reason={reason} />
      )}
    </div>
  );
}

