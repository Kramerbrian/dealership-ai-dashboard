// app/(dashboard)/preview/orchestrator/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motionBus } from '@/components/MotionOrchestrator';
import DealershipAIOrchestrator3 from '@/app/components/DealershipAIOrchestrator3';

export default function OrchestratorPreviewPage() {
  const [pulseData, setPulseData] = useState<any>(null);

  // Deep Integration: Unified Orchestrator + AI Assistant Agent
  // The AI Assistant Agent now listens to live pulseData and suggests corrective or optimization actions via GPT-driven insights.
  useEffect(() => {
    async function fetchPulseData() {
      try {
        const res = await fetch('/api/pulse/aggregate', { cache: 'no-store' });
        const data = await res.json();
        setPulseData(data);

        // Send data to AI Assistant Agent for real-time reasoning
        await fetch('/api/assistant/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'orchestrator', telemetry: data }),
        });
      } catch (e) {
        console.error('Error fetching or analyzing pulse data:', e);
      }
    }

    fetchPulseData();
    const interval = setInterval(fetchPulseData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pulseData) return;

    const { aiv, tas, ori } = pulseData;

    // Real-time motion events from pulse metrics
    if (aiv?.delta > 0) motionBus.emit({ type: 'METRICS_PULSE', polarity: 'positive' });
    if (tas?.delta < 0) motionBus.emit({ type: 'METRICS_PULSE', polarity: 'negative' });
    if (ori?.delta > 5) motionBus.emit({ type: 'NEXT_BEST_NUDGE' });

    // AI Assistant Agent feedback integration
    fetch('/api/assistant/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insights: pulseData, context: 'DealershipAI Orchestrator 3.0' }),
    }).then(res => res.json()).then(suggestions => {
      console.log('AI Assistant Recommendations:', suggestions);
    }).catch(err => console.error('Assistant suggestion error:', err));
  }, [pulseData]);

  useEffect(() => {
    if (pulseData) return;
    const positivePulse = setInterval(() => motionBus.emit({ type: 'METRICS_PULSE', polarity: 'positive' }), 4000);
    const negativePulse = setInterval(() => motionBus.emit({ type: 'METRICS_PULSE', polarity: 'negative' }), 9000);
    const anomalyTrigger = setInterval(() => motionBus.emit({ type: 'NEXT_BEST_NUDGE' }), 12000);
    return () => {
      clearInterval(positivePulse);
      clearInterval(negativePulse);
      clearInterval(anomalyTrigger);
    };
  }, [pulseData]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">DealershipAI Orchestrator 3.0 — Orchestrator + AI Agent Integration</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Predictive Fusion Layer · Schema King API · AI Assistant Feedback Loop (AEO · GEO · UGC · Competitive · Schema)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs"
              onClick={() => motionBus.emit({ type: 'METRICS_PULSE', polarity: 'positive' })}
            >
              Pulse +
            </button>
            <button
              className="rounded-md bg-red-600 hover:bg-red-500 px-3 py-1 text-xs"
              onClick={() => motionBus.emit({ type: 'METRICS_PULSE', polarity: 'negative' })}
            >
              Pulse −
            </button>
            <button
              className="rounded-md bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs"
              onClick={() => motionBus.emit({ type: 'NEXT_BEST_NUDGE' })}
            >
              Nudge
            </button>
          </div>
        </header>

        <section>
          <DealershipAIOrchestrator3 pulseData={pulseData} />
        </section>

        <footer className="border-t border-white/10 pt-4 text-center text-zinc-500 text-xs mt-10">
          <p>
            DealershipAI Orchestrator 3.0 + AI Assistant Agent — Fully unified telemetry and reasoning loop. Schema King GPT, Predictive Fusion, and GPT-based assistant work together to generate, score, and prioritize Pulse Cards in real-time.
          </p>
        </footer>
      </div>
    </div>
  );
}

// Integration notes:
// 1. /api/pulse/aggregate should merge AEO, GEO, UGC, Competitive, and Schema signals for pulseData.
// 2. /api/assistant/analyze uses GPT to interpret anomalies and forecast next opportunities.
// 3. /api/assistant/suggest generates role-specific action recommendations for GM, Marketing, or Service roles.
// 4. MotionBus ties telemetry changes to live Framer Motion feedback loops.
// 5. Deploy with Schema King GPT API enabled to auto-detect and fix markup issues from AI Assistant insights.
