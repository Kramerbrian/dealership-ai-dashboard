/**
 * Pulse Card Component v2
 * Actionable card with context chips, receipts, and thread badges
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  Wrench,
  UserPlus,
  VolumeX,
  History,
  ArrowRight,
  Bell,
} from 'lucide-react';
import type { PulseCard } from '@/lib/types/pulse';
import { usePulseStore } from '@/lib/store/pulse-store';
import { ConsensusBadge, getConsensusStatusFromHits } from './ConsensusBadge';

interface PulseCardProps {
  card: PulseCard;
  isSelected?: boolean;
  onAction?: (card: PulseCard) => void;
}

const LEVEL_COLORS = {
  critical: 'border-red-500 bg-red-500/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-yellow-500 bg-yellow-500/10',
  low: 'border-blue-500 bg-blue-500/10',
  info: 'border-gray-500 bg-gray-500/10',
};

const KIND_ICONS = {
  kpi_delta: TrendingUp,
  incident_opened: AlertTriangle,
  incident_resolved: CheckCircle,
  market_signal: TrendingDown,
  auto_fix: Zap,
  sla_breach: XCircle,
  system_health: CheckCircle,
};

export default function PulseCardComponent({ card, isSelected, onAction }: PulseCardProps) {
  const { threadFor, mute, snooze } = usePulseStore();
  const Icon = KIND_ICONS[card.kind] || Bell;
  const thread = card.thread ? threadFor(card.thread) : null;
  const threadCount = thread?.events.length || 0;

  const handleAction = (action: string) => {
    switch (action) {
      case 'open':
        if (card.thread) {
          // Open thread drawer
          console.log('Opening thread:', card.thread.id);
        }
        onAction?.(card);
        break;
      case 'fix':
        // Trigger auto-fix
        console.log('Triggering fix for:', card.id);
        break;
      case 'assign':
        // Assign to team
        console.log('Assigning:', card.id);
        break;
      case 'snooze':
        if (card.dedupe_key) {
          snooze(card.id, '1h');
        }
        break;
      case 'mute':
        if (card.dedupe_key) {
          mute(card.dedupe_key, 24 * 60);
        }
        break;
    }
  };

  const formatDelta = (delta: number | string | undefined) => {
    if (delta === undefined) return null;
    const num = typeof delta === 'number' ? delta : parseFloat(String(delta));
    if (isNaN(num)) return String(delta);
    return num >= 0 ? `+${num}` : `${num}`;
  };

  return (
    <motion.div
      className={`border-l-4 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm transition-all ${
        LEVEL_COLORS[card.level]
      } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
      whileHover={{ scale: 1.01 }}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${LEVEL_COLORS[card.level].includes('red') ? 'text-red-400' : ''}`} />
            <h3 className="font-semibold text-white">{card.title}</h3>
            {card.delta !== undefined && (
              <span
                className={`text-sm font-mono ${
                  typeof card.delta === 'number' && card.delta >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {formatDelta(card.delta)}
              </span>
            )}
          </div>

          {/* Context chips */}
          {card.context && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Consensus badge - show if consensus data is available */}
              {(() => {
                // Try to get consensus from explicit status first
                if (card.context.consensus) {
                  const engines = card.context.issueHits?.map(hit => hit.engine) || [];
                  return (
                    <ConsensusBadge
                      status={card.context.consensus}
                      engines={engines}
                    />
                  );
                }
                // Otherwise, try to derive from issueHits
                if (card.context.issueHits && card.context.issueHits.length > 0) {
                  const status = getConsensusStatusFromHits(
                    card.context.issueHits,
                    card.context.issueId || card.id
                  );
                  if (status) {
                    const engines = card.context.issueHits.map(hit => hit.engine);
                    return (
                      <ConsensusBadge
                        status={status}
                        engines={engines}
                      />
                    );
                  }
                }
                return null;
              })()}
              
              {card.context.kpi && (
                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                  KPI: {card.context.kpi}
                </span>
              )}
              {card.context.segment && (
                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                  Segment: {card.context.segment}
                </span>
              )}
              {card.context.source && (
                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                  Source: {card.context.source}
                </span>
              )}
            </div>
          )}

          {/* Detail */}
          {card.detail && (
            <p className="text-sm text-gray-400 mb-2">{card.detail}</p>
          )}

          {/* Receipts */}
          {card.receipts && card.receipts.length > 0 && (
            <div className="mt-2 space-y-1">
              {card.receipts.map((receipt, idx) => (
                <div key={idx} className="text-xs text-gray-500">
                  {receipt.label}
                  {receipt.before !== undefined && receipt.after !== undefined && (
                    <span className="ml-2">
                      {receipt.before} → {receipt.after}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Thread badge */}
          {thread && threadCount > 1 && (
            <button
              onClick={() => handleAction('open')}
              className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              <History className="w-3 h-3" />
              {threadCount} in thread
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {card.actions?.includes('open') && (
            <button
              onClick={() => handleAction('open')}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              aria-label="Open"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {card.actions?.includes('fix') && (
            <button
              onClick={() => handleAction('fix')}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label="Fix"
            >
              <Wrench className="w-4 h-4" />
            </button>
          )}
          {card.actions?.includes('snooze') && (
            <button
              onClick={() => handleAction('snooze')}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Snooze"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
          {card.actions?.includes('mute') && (
            <button
              onClick={() => handleAction('mute')}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Mute"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

