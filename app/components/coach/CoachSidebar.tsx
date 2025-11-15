'use client';

import React from 'react';
import type { CoachSuggestion } from '@/packages/core-models/src/coach';
import { X, Clock, DollarSign } from 'lucide-react';

interface CoachSidebarProps {
  suggestion: CoachSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  isOpen: boolean;
}

/**
 * CoachSidebar - Side drawer for longer coaching flows
 * 
 * Used when Coach needs to show a multi-step guide
 */
export function CoachSidebar({
  suggestion,
  onAccept,
  onDismiss,
  isOpen,
}: CoachSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-medium text-white">
            ?
          </div>
          <div className="text-sm font-semibold text-white">Coach</div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {suggestion.title}
          </h2>
          <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {suggestion.body}
          </div>
        </div>

        {/* Money anchor */}
        {suggestion.moneyAnchor && (
          <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-950/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <div className="text-xs font-semibold text-yellow-300">
                Estimated Impact
              </div>
            </div>
            <div className="text-lg font-bold text-white">
              ${suggestion.moneyAnchor.estLossLow?.toLocaleString()}
              {suggestion.moneyAnchor.estLossHigh &&
                `–$${suggestion.moneyAnchor.estLossHigh.toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Revenue at risk if this step is skipped
            </div>
          </div>
        )}

        {/* Time estimate */}
        {suggestion.estTimeSeconds && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>≈ {suggestion.estTimeSeconds} seconds</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={onAccept}
          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-colors"
        >
          {suggestion.ctaLabel ?? 'Show me'}
        </button>
        <button
          onClick={onDismiss}
          className="w-full px-4 py-2 rounded-lg border border-white/20 text-slate-300 hover:bg-white/5 transition-colors text-sm"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

