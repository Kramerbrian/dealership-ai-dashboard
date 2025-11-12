/**
 * Pulse Digest Mode
 * AM summary of last 24 hours bundled into summary cards
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import type { PulseCard } from '@/lib/types/pulse';

interface PulseDigestProps {
  cards: PulseCard[];
}

export default function PulseDigest({ cards }: PulseDigestProps) {
  const now = Date.now();
  const last24h = cards.filter((c) => now - Date.parse(c.ts) < 24 * 60 * 60 * 1000);

  // Group by kind
  const byKind = last24h.reduce((acc, card) => {
    if (!acc[card.kind]) acc[card.kind] = [];
    acc[card.kind].push(card);
    return acc;
  }, {} as Record<string, PulseCard[]>);

  // Calculate top KPI deltas
  const kpiDeltas = last24h
    .filter((c) => c.kind === 'kpi_delta' && c.delta)
    .map((c) => ({
      ...c,
      deltaNum: typeof c.delta === 'number' ? c.delta : parseFloat(String(c.delta || 0)),
    }))
    .sort((a, b) => Math.abs(b.deltaNum) - Math.abs(a.deltaNum))
    .slice(0, 5);

  // Open SLAs
  const openSLAs = last24h.filter((c) => c.kind === 'sla_breach');

  // Auto-fixes
  const autoFixes = last24h.filter((c) => c.kind === 'auto_fix');

  // Unresolved incidents
  const unresolvedIncidents = last24h.filter(
    (c) => c.kind === 'incident_opened' && !last24h.some((r) => r.thread?.id === c.thread?.id && r.kind === 'incident_resolved')
  );

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">24-Hour Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Events</div>
            <div className="text-2xl font-bold">{last24h.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Unresolved</div>
            <div className="text-2xl font-bold text-red-400">{unresolvedIncidents.length}</div>
          </div>
        </div>
      </div>

      {/* Top KPI Deltas */}
      {kpiDeltas.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top KPI Changes
          </h3>
          <div className="space-y-2">
            {kpiDeltas.map((card) => (
              <div key={card.id} className="flex items-center justify-between">
                <span className="text-sm">{card.title}</span>
                <span
                  className={`font-mono ${
                    card.deltaNum >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {card.deltaNum >= 0 ? '+' : ''}
                  {card.deltaNum}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open SLAs */}
      {openSLAs.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            SLA Breaches ({openSLAs.length})
          </h3>
          <div className="space-y-2">
            {openSLAs.slice(0, 5).map((card) => (
              <div key={card.id} className="text-sm">
                {card.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Fixes */}
      {autoFixes.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Auto-Fixes Applied ({autoFixes.length})
          </h3>
          <div className="space-y-2">
            {autoFixes.slice(0, 5).map((card) => (
              <div key={card.id} className="text-sm">
                {card.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start with Fix Next */}
      {unresolvedIncidents.length > 0 && (
        <button className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
          Start with Fix Next ({unresolvedIncidents.length} items)
        </button>
      )}
    </div>
  );
}

