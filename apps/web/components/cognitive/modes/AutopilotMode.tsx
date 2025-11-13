'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Cpu, Sparkles, Workflow } from 'lucide-react';

import { useCognitiveStore } from '@/lib/store/cognitive';

const AUTOPILOT_PROGRAMS = [
  {
    id: 'schema-autofix',
    title: 'Schema Auto-Fix Engine',
    status: 'Deploying',
    eta: '3m 12s',
    progress: 68,
    description: 'Rolling out AI-generated schema updates across inventory, specials, and EV landing pages.',
    metrics: [
      { label: 'Reclaimed citations', value: '+18% last 24h' },
      { label: 'Voice unlocks', value: '3 assistants' },
    ],
  },
  {
    id: 'ugc-auto-responder',
    title: 'UGC Auto-Responder',
    status: 'Active',
    eta: 'Live',
    progress: 100,
    description: 'Autonomous response agent covering Google, Facebook, and DealerRater reviews in < 4 minutes.',
    metrics: [
      { label: 'Response SLA', value: '2m 45s median' },
      { label: 'Trust delta', value: '+9.2' },
    ],
  },
];

const AUTOPILOT_SWITCHES = [
  {
    id: 'perplexity-guardian',
    label: 'Perplexity Guardian',
    description: 'Monitors Perplexity citations and deploys countermeasures if your competitor outranks you.',
    active: true,
  },
  {
    id: 'inventory-orchestrator',
    label: 'Inventory Orchestrator',
    description: 'Publishes AI-ready inventory spotlights for models falling below 10% share of voice.',
    active: false,
  },
  {
    id: 'review-surge',
    label: 'Review Surge Planner',
    description: 'Predictive prompts for customers when trust metrics dip below the Tesla-grade threshold.',
    active: true,
  },
];

export function AutopilotMode() {
  const { actions } = useCognitiveStore();
  const autopilotReady = actions.filter((action) => action.autoFixAvailable).length;

  return (
    <div className="h-full overflow-y-auto px-6 pb-28 pt-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-neural-500">Autopilot Mode</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-[2.5rem]">
            Automate the fixes so the team can sell cars
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neural-400">
            Tesla-grade automation with human safeguards. Toggle programs on or off; every action is logged and reversible.
          </p>
        </div>

        <div className="grid gap-6">
          {AUTOPILOT_PROGRAMS.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="overflow-hidden rounded-[1.6rem] border border-neural-800 bg-neural-900/70 p-6 backdrop-blur"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-clarity-blue to-clarity-cyan text-white shadow-lg shadow-clarity-blue/40">
                    <Workflow size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                    <p className="text-sm text-neural-400">{program.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-neural-300">
                  <span className="inline-flex items-center gap-1 rounded-full border border-clarity-blue/30 bg-clarity-blue/10 px-3 py-1 font-medium text-clarity-blue">
                    <Sparkles size={14} /> {program.status}
                  </span>
                  <span className="flex items-center gap-1 text-neural-500">
                    <Clock size={14} /> {program.eta}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-neural-500">Execution</span>
                  <div className="h-2 rounded-full bg-neural-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-clarity-blue to-clarity-cyan"
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-neural-400">{program.progress}% complete</span>
                </div>

                <div className="grid gap-3 rounded-xl border border-neural-800 bg-neural-950/60 p-4 text-sm text-neural-300">
                  {program.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <span>{metric.label}</span>
                      <span className="font-semibold text-clarity-cyan">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-neural-800 bg-neural-900/60 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Autopilot Safeguards</h2>
              <p className="mt-1 text-sm text-neural-400">
                {autopilotReady} Drive actions can auto-deploy. Human override always available.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-clarity-blue/30 bg-clarity-blue/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-clarity-blue">
              <Cpu size={14} /> Live telemetry
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {AUTOPILOT_SWITCHES.map((toggle) => (
              <div key={toggle.id} className="rounded-2xl border border-neural-800 bg-neural-950/50 p-4 text-sm text-neural-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{toggle.label}</h3>
                  {toggle.active ? (
                    <span className="inline-flex items-center gap-1 text-clarity-emerald">
                      <CheckCircle2 size={14} /> On
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-neural-500">
                      <CheckCircle2 size={14} /> Off
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-5 text-neural-500">{toggle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
