'use client';

import React from 'react';
import type { CoachSuggestion } from '@/packages/core-models/src/coach';
import { X } from 'lucide-react';

interface CoachPopoverProps {
  suggestion: CoachSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  anchorElement?: HTMLElement | null;
}

/**
 * CoachPopover - Minimal, glassy popover for micro-coaching
 * 
 * Must feel: small, friendly, fast, helpful, never needy
 */
export function CoachPopover({
  suggestion,
  onAccept,
  onDismiss,
  anchorElement,
}: CoachPopoverProps) {
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [anchorElement]);

  const severityColors = {
    info: 'border-blue-500/30 bg-blue-950/90',
    nudge: 'border-purple-500/30 bg-purple-950/90',
    warning: 'border-yellow-500/30 bg-yellow-950/90',
    critical: 'border-red-500/30 bg-red-950/90',
  };

  const style = position
    ? {
        position: 'fixed' as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }
    : {};

  return (
    <div
      className={`rounded-2xl border ${severityColors[suggestion.severity]} backdrop-blur-xl px-4 py-3 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200`}
      style={style}
    >
      <div className="flex items-start gap-3">
        {/* Coach icon */}
        <div className="mt-0.5 h-7 w-7 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-medium text-white/90 flex-shrink-0">
          ?
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {/* Title */}
          <div className="text-sm font-semibold text-white leading-tight">
            {suggestion.title}
          </div>

          {/* Body */}
          <div className="text-xs text-slate-200/90 whitespace-pre-line leading-relaxed">
            {suggestion.body}
          </div>

          {/* Money anchor (if present) */}
          {suggestion.moneyAnchor && (
            <div className="text-[11px] text-slate-300/80 font-medium">
              Est. impact: ${suggestion.moneyAnchor.estLossLow?.toLocaleString()}
              {suggestion.moneyAnchor.estLossHigh &&
                `–$${suggestion.moneyAnchor.estLossHigh.toLocaleString()}`}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={onAccept}
              className="text-xs px-3 py-1.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              {suggestion.ctaLabel ?? 'Show me'}
            </button>

            <div className="flex items-center gap-2">
              {suggestion.estTimeSeconds && (
                <div className="text-[10px] text-slate-400">
                  ≈{suggestion.estTimeSeconds} sec
                </div>
              )}
              <button
                onClick={onDismiss}
                className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

