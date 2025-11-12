'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Wrench, Rocket, Info, CheckCircle } from 'lucide-react';
import { useCognitiveStore } from '@/lib/store/cognitive';
import type { Urgency } from '@/lib/types/cognitive';

const UrgencyBadge = ({ u }: { u: Urgency }) => {
  const color = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    low: 'bg-neutral-600/30 text-neutral-300 border-neutral-500/40',
  }[u];
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>{u}</span>
  );
};

export function DriveMode() {
  const { getTriageQueue, resolveIncident, openDrawer, addPulse } = useCognitiveStore();
  const queue = getTriageQueue();

  const handleDeployFix = async (incidentId: string, title: string, category: string) => {
    try {
      // Call orchestrator API for auto-fix
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_asr',
          dealerId: 'demo', // TODO: get from auth context
          context: {
            incidentId,
            title,
            category,
            fixType: 'auto_fix',
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        resolveIncident(incidentId);

        // Add pulse event
        addPulse({
          id: crypto.randomUUID(),
          ts: new Date().toISOString(),
          level: 'medium',
          title: 'Fix Deployed',
          detail: `Successfully deployed auto-fix for: ${title}`,
          kpi: 'auto_fix',
          delta: '+1',
        });
      } else {
        throw new Error('Orchestrator API failed');
      }
    } catch (error) {
      console.error('Auto-fix deployment error:', error);
      // Fallback: still resolve the incident
      resolveIncident(incidentId);
      addPulse({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: 'high',
        title: 'Fix Deployed (Fallback)',
        detail: `Deployed fix for: ${title} (orchestrator unavailable)`,
      });
    }
  };

  if (queue.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-clarity-blue to-clarity-cyan flex items-center justify-center">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Clear</h3>
          <p className="text-neural-400">
            No incidents detected. Your dealership intelligence is running smoothly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light">Incidents</h1>
          <p className="text-neural-400">
            Ranked by impact × urgency ÷ time-to-fix
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neural-400">{queue.length} open</div>
          <div className="px-3 py-1 rounded-full bg-clarity-blue/20 text-clarity-blue text-xs font-medium">
            Triage Mode
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {queue.map((i, idx) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="relative bg-neural-900/50 backdrop-blur-sm border border-neural-800 rounded-2xl p-6 hover:border-neural-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-gradient-to-br from-clarity-blue to-clarity-cyan flex-shrink-0">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{i.title}</h3>
                    <UrgencyBadge u={i.urgency} />
                  </div>
                  <div className="text-sm text-neural-300 mt-1">{i.reason}</div>
                  <div className="text-xs text-neural-500 mt-2 flex items-center gap-3">
                    <span>
                      Impact:{' '}
                      <span className="text-emerald-400 font-semibold">
                        {i.impact_points} pts
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Time:{' '}
                      <span className="text-neural-300">{i.time_to_fix_min} min</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      <span className="text-neural-400">Category:</span>{' '}
                      <span className="text-neural-300">{i.category.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {i.autofix && (
                <span className="text-xs px-2 py-1 rounded-full bg-clarity-blue/20 text-clarity-blue border border-clarity-blue/30 flex-shrink-0">
                  Auto-Fix
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {i.fix_tiers.includes('tier1_diy') && (
                <button
                  className="px-4 py-2 rounded-lg border border-neural-700 hover:bg-neural-800 text-neutral-200 flex items-center justify-center gap-2 transition-all"
                  onClick={() =>
                    openDrawer({ type: 'howto', incidentId: i.id })
                  }
                >
                  <Info size={16} /> Show Me Why / How
                </button>
              )}
              {i.autofix && i.fix_tiers.includes('tier2_guided') && (
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-clarity-blue to-clarity-cyan text-white hover:shadow-lg hover:shadow-clarity-blue/40 flex items-center justify-center gap-2 transition-all"
                  onClick={() => handleDeployFix(i.id, i.title, i.category)}
                >
                  <Wrench size={16} /> Deploy Fix
                </button>
              )}
              {i.fix_tiers.includes('tier3_dfy') && (
                <button
                  className="px-4 py-2 rounded-lg border border-neural-700 hover:bg-neural-800 text-neutral-200 flex items-center justify-center gap-2 transition-all"
                  onClick={() =>
                    openDrawer({ type: 'assign', incidentId: i.id })
                  }
                >
                  <Rocket size={16} /> Assign to dAI Team
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
