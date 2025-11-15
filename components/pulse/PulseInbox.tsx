// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useHudStore } from '@/lib/store/hud';

interface PulseInboxProps {
  dealerId?: string;
  autoRefresh?: boolean;
}

export default function PulseInbox({ dealerId, autoRefresh = false }: PulseInboxProps) {
  const { pulse } = useHudStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Auto-refresh pulse data if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, this would fetch from API
      // For now, we're using the store which is populated by VoiceOrb and other components
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredPulse = filter === 'all'
    ? pulse
    : pulse.filter(p => p.level === filter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertCircle size={16} />;
      case 'high': return <AlertCircle size={16} />;
      case 'medium': return <Info size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pulse Inbox</h2>
            <p className="text-sm text-neutral-400">
              {filteredPulse.length} event{filteredPulse.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredPulse.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-dashed border-neutral-700 bg-neutral-800/40 p-8 text-center"
            >
              <Activity size={32} className="mx-auto mb-3 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-500">No events yet</p>
              <p className="mt-1 text-xs text-neutral-600">
                Pulse events will appear here as they happen
              </p>
            </motion.div>
          ) : (
            filteredPulse.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-lg border p-4 ${getLevelColor(event.level)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getLevelIcon(event.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold">{event.title}</h3>
                      <span className="text-xs opacity-60">
                        {new Date(event.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm opacity-80">{event.detail}</p>
                    {event.kpi && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium opacity-60">KPI:</span>
                        <span className="text-xs font-mono">{event.kpi}</span>
                        {event.delta && (
                          <span className="text-xs font-mono opacity-80">
                            {typeof event.delta === 'number' && event.delta > 0 ? '+' : ''}
                            {event.delta}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {filteredPulse.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">
            Showing {filteredPulse.length} of {pulse.length} total events
          </p>
          {autoRefresh && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-neutral-500">Auto-refresh enabled</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
