'use client';

/**
 * Pulse Analytics Dashboard
 * Shows trends, action frequency, resolution time, and insights
 */

import React, { useMemo } from 'react';
import type { PulseCard } from '@/lib/types/pulse';

interface PulseAnalyticsProps {
  cards: PulseCard[];
}

export default function PulseAnalytics({ cards }: PulseAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = Date.now();
    const last24h = cards.filter(c => now - new Date(c.ts).getTime() < 24 * 60 * 60 * 1000);
    const last7d = cards.filter(c => now - new Date(c.ts).getTime() < 7 * 24 * 60 * 60 * 1000);

    // Trends by kind
    const trendsByKind = cards.reduce((acc, card) => {
      acc[card.kind] = (acc[card.kind] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trends by level
    const trendsByLevel = cards.reduce((acc, card) => {
      acc[card.level] = (acc[card.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Action frequency
    const actionFrequency = cards.reduce((acc, card) => {
      card.actions?.forEach(action => {
        acc[action] = (acc[action] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Resolution time (for resolved incidents)
    const resolvedIncidents = cards.filter(c => c.kind === 'incident_resolved');
    const avgResolutionTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((sum, card) => {
          // Estimate based on card age (simplified)
          return sum + (now - new Date(card.ts).getTime());
        }, 0) / resolvedIncidents.length / (1000 * 60) // Convert to minutes
      : 0;

    return {
      total: cards.length,
      last24h: last24h.length,
      last7d: last7d.length,
      trendsByKind,
      trendsByLevel,
      actionFrequency,
      avgResolutionTime,
      criticalCount: cards.filter(c => c.level === 'critical').length,
      resolvedCount: resolvedIncidents.length,
    };
  }, [cards]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pulse Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.total}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Critical</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.criticalCount}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.resolvedCount}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Last 24h</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.last24h}</div>
        </div>
      </div>

      {/* Trends by Kind */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Trends by Type</h3>
        <div className="space-y-2">
          {Object.entries(analytics.trendsByKind).map(([kind, count]) => (
            <div key={kind} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{kind.replace('_', ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / analytics.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Frequency */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Action Frequency</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(analytics.actionFrequency).map(([action, count]) => (
            <div key={action} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{action}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Average Resolution Time */}
      {analytics.avgResolutionTime > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Average Resolution Time</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(analytics.avgResolutionTime)} minutes
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Based on {analytics.resolvedCount} resolved incidents
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

