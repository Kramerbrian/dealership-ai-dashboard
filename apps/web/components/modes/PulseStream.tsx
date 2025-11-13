'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { useCognitiveStore } from '@/lib/store/cognitive';
import type { Urgency } from '@/lib/types/cognitive';

const UrgencyIcon = ({ level }: { level: Urgency }) => {
  const iconProps = { size: 16, className: 'flex-shrink-0' };

  switch (level) {
    case 'critical':
      return <AlertCircle {...iconProps} className="text-red-400" />;
    case 'high':
      return <TrendingUp {...iconProps} className="text-amber-400" />;
    case 'medium':
      return <Info {...iconProps} className="text-cyan-400" />;
    case 'low':
      return <CheckCircle {...iconProps} className="text-neutral-500" />;
    default:
      return <Activity {...iconProps} className="text-neutral-400" />;
  }
};

const UrgencyBadge = ({ level }: { level: Urgency }) => {
  const styles = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    low: 'bg-neutral-600/30 text-neutral-300 border-neutral-500/40',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level}
    </span>
  );
};

export function PulseStream() {
  const { pulse } = useCognitiveStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to top on new events
  useEffect(() => {
    if (containerRef.current && pulse.length > 0) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pulse.length]);

  if (pulse.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-clarity-blue to-clarity-cyan flex items-center justify-center">
            <Activity size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pulse Stream</h3>
          <p className="text-neural-400">
            Real-time system events and KPI changes will appear here. No activity yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full p-6 overflow-y-auto space-y-3"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-light">Pulse</h1>
        <p className="text-neural-400">
          Real-time stream of system events and KPI changes
        </p>
      </div>

      {pulse.map((ev, idx) => (
        <motion.div
          key={ev.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.02 }}
          className="rounded-2xl border border-neural-800 bg-neural-900/50 backdrop-blur-sm p-4 hover:border-neural-700 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UrgencyIcon level={ev.level} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold">{ev.title}</h3>
                <UrgencyBadge level={ev.level} />
              </div>

              <p className="text-sm text-neural-300 mb-2">{ev.detail}</p>

              <div className="flex items-center gap-4 text-xs text-neural-500">
                <span>{new Date(ev.ts).toLocaleString()}</span>
                {ev.kpi && (
                  <span className="font-mono text-clarity-blue">{ev.kpi}</span>
                )}
                {typeof ev.delta !== 'undefined' && (
                  <span className="text-emerald-400 font-semibold">
                    Δ {String(ev.delta)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
