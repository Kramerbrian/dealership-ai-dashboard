'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Activity, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';

import { useCognitiveStore } from '@/lib/store/cognitive';
import type { ActionItem, Urgency } from '@/lib/types/cognitive';

const URGENCY_STYLES: Record<Exclude<Urgency, 'low'>, { gradient: string; glow: string; Icon: typeof AlertCircle }> = {
  critical: { gradient: 'from-alert-critical to-orange-500', glow: 'from-alert-critical/40 to-orange-400/40', Icon: AlertCircle },
  high: { gradient: 'from-amber-400 to-clarity-blue', glow: 'from-amber-400/30 to-clarity-blue/30', Icon: TrendingUp },
  medium: { gradient: 'from-clarity-blue to-clarity-cyan', glow: 'from-clarity-blue/25 to-clarity-cyan/25', Icon: Zap },
};

const ACTION_DETAILS: Record<string, { description: string; metrics: Array<{ label: string; value: string; highlight?: boolean }> }> = {
  'schema-gap': {
    description: 'Fix missing schema entities to unlock zero-click citations and voice compatibility.',
    metrics: [
      { label: 'Target pillars', value: 'Schema · Zero-Click' },
      { label: 'Projected lift', value: '+23% voice impressions', highlight: true },
      { label: 'Time to deploy', value: '5 minutes' },
    ],
  },
  'ugc-velocity': {
    description: 'Accelerate review response velocity to protect trust signals across Gemini and ChatGPT.',
    metrics: [
      { label: 'Current SLA', value: '18h average response' },
      { label: 'Target SLA', value: '< 3h (AI recommendation threshold)', highlight: true },
      { label: 'Impact', value: '+6 Trust score' },
    ],
  },
  'freshness-drop': {
    description: 'Content freshness is sliding—auto-generate new AI-friendly inventory spotlights.',
    metrics: [
      { label: 'Affected queries', value: '19 high-intent terms' },
      { label: 'AIV delta', value: '+12 when resolved', highlight: true },
      { label: 'Automation ready', value: 'Yes · Autopilot compatible' },
    ],
  },
};

export function DriveMode() {
  const { actions, clarity, openDrawer } = useCognitiveStore();

  const prioritized = useMemo(() => {
    const urgencyRank: Record<Urgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...actions].sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]).slice(0, 3);
  }, [actions]);

  const handlePreview = (action: ActionItem) => {
    const details = ACTION_DETAILS[action.id] ?? {
      description: 'Action details coming soon.',
      metrics: [],
    };

    openDrawer({
      title: action.title,
      description: details.description,
      items: details.metrics,
      ctaLabel: action.autoFixAvailable ? 'Deploy Auto-Fix' : undefined,
      ctaActionId: action.id,
    });
  };

  const handleDeploy = async (action: ActionItem) => {
    if (action.handler) {
      await action.handler();
    }
    handlePreview(action);
  };

  return (
    <div className="h-full overflow-y-auto px-6 pb-28 pt-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-neural-500">Drive Mode</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-[2.5rem]">
            Focus the team on the next best move
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neural-400">
            Ranked by impact × urgency × effort. Autopilot-ready actions display a Tesla-grade one-click auto-fix.
          </p>
        </div>

        <div className="grid gap-4">
          {prioritized.map((action, index) => {
            const style = URGENCY_STYLES[(action.urgency === 'low' ? 'medium' : action.urgency) as Exclude<Urgency, 'low'>];
            const InsightsIcon = style.Icon;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group relative"
              >
                <div className={`absolute inset-0 -z-10 rounded-[1.6rem] bg-gradient-to-r ${style.glow} opacity-0 blur-3xl transition-opacity group-hover:opacity-100`} />

                <div className="relative overflow-hidden rounded-[1.6rem] border border-neural-800 bg-neural-900/70 p-6 backdrop-blur">
                  <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-lg shadow-black/20`}
                      >
                        <InsightsIcon size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-neural-400">
                          <span className="font-semibold text-clarity-emerald">{action.impact}</span>
                          <span className="text-neural-600">•</span>
                          <span>{action.effort}</span>
                        </div>
                      </div>
                    </div>

                    {action.autoFixAvailable && (
                      <span className="inline-flex h-8 items-center rounded-full border border-clarity-blue/40 bg-clarity-blue/20 px-3 text-xs font-medium uppercase tracking-[0.2em] text-clarity-blue">
                        Auto-Fix Ready
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {action.autoFixAvailable ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDeploy(action)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-clarity-blue to-clarity-cyan px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-clarity-blue/30 transition-transform hover:-translate-y-0.5"
                        >
                          Deploy Auto-Fix
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePreview(action)}
                          className="rounded-xl border border-neural-700 px-5 py-3 text-sm font-semibold text-neural-200 transition-colors hover:bg-neural-800"
                        >
                          View Playbook
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePreview(action)}
                        className="flex-1 rounded-xl border border-neural-700 px-5 py-3 text-sm font-semibold text-neural-200 transition-colors hover:bg-neural-800"
                      >
                        Review Action
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-neural-800 bg-neural-900/60 p-6 text-sm text-neural-400 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-neural-300">
              <Activity size={16} className="text-clarity-cyan" />
              Stabilized clarity trend
            </div>
            <div className="flex items-center gap-2 text-neural-300">
              <TrendingUp size={16} className="text-clarity-emerald" />
              +{clarity.delta}% week-over-week
            </div>
            <div className="flex items-center gap-2 text-neural-300">
              <Zap size={16} className="text-clarity-blue" />
              Autopilot ready: 2 of 3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
