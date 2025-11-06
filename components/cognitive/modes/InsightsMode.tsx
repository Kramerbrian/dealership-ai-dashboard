'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, Globe2, Radar, Sparkle } from 'lucide-react';

import { KPI_LABELS } from '@/lib/constants/kpi';
import { useCognitiveStore } from '@/lib/store/cognitive';

const INSIGHT_BADGES: Record<string, { label: string; icon: typeof Activity }> = {
  citation_velocity: { label: 'Citation Velocity', icon: Radar },
  geo_integrity: { label: 'Geo Integrity', icon: Globe2 },
};

export function InsightsMode() {
  const { insights } = useCognitiveStore();

  return (
    <div className="h-full overflow-y-auto px-6 pb-28 pt-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-neural-500">Insights Mode</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-[2.5rem]">
            Evidence before action
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neural-400">
            Every insight pairs an AI detection with proof and projected impact so operators can move with conviction.
          </p>
        </div>

        <div className="grid gap-6">
          {insights.map((insight, index) => {
            const badge = INSIGHT_BADGES[insight.metric] ?? { label: insight.metric, icon: Sparkle };
            const BadgeIcon = badge.icon;
            const isPositive = insight.delta >= 0;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[1.6rem] border border-neural-800 bg-neural-900/70 p-6 backdrop-blur"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-clarity-blue to-clarity-cyan text-white shadow-lg shadow-clarity-blue/30">
                      <BadgeIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-clarity-emerald' : 'text-alert-critical'}`}>
                          <ArrowUpRight size={14} />
                          {isPositive ? '+' : '−'}
                          {Math.abs(insight.delta)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-neural-400">{insight.description}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neural-500">
                        {KPI_LABELS[insight.metric] ?? insight.metric} • {insight.timeframe}
                      </p>
                    </div>
                  </div>

                  {insight.proof && (
                    <div className="rounded-xl border border-neural-800 bg-neural-950/60 px-4 py-3 text-xs text-neural-400">
                      <p className="font-semibold text-neural-200">Proof attached</p>
                      <p className="mt-1">
                        {insight.proof.type === 'chart'
                          ? 'Trend chart ready. Overlay competitor performance to validate before deploying automation.'
                          : 'Screenshot collected. Validate citation snippet inside the Competitive War Room before pushing live.'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-[1.6rem] border border-neural-800 bg-neural-900/60 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Competitive Telematics</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-clarity-blue/30 bg-clarity-blue/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-clarity-blue">
              <Radar size={14} /> Streaming live
            </span>
          </div>
          <p className="mt-2 text-sm text-neural-400">
            Autopilot scans 212 high-intent prompts hourly across ChatGPT, Gemini, Perplexity and Bard to detect citation drift.
          </p>
        </div>
      </div>
    </div>
  );
}
