"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deriveCopilotMood } from "@/lib/copilot-context";
import { getEasterEggQuote, getNeutralCoachLine } from "@/lib/agent/quoteEngine";
import { useThemeSignal } from "@/hooks/useThemeSignal";
import pulseScripts from "@/data/pulse-scripts.json";

// Stub telemetry hook (create if needed)
function logCopilotEvent(data: any) {
  if (typeof window !== 'undefined') {
    try {
      const events = JSON.parse(localStorage.getItem('copilot_events') || '[]');
      events.push({ ...data, ts: Date.now() });
      localStorage.setItem('copilot_events', JSON.stringify(events.slice(-50)));
    } catch {}
  }
}

// Stub feedback component (create if needed)
function CopilotFeedback({ dealerId, context, quoteId }: any) {
  const [feedback, setFeedback] = useState<number | null>(null);
  
  if (feedback !== null) return null; // Hide after feedback
  
  return (
    <div className="mt-2 flex gap-2 text-xs">
      <button
        onClick={() => {
          setFeedback(1);
          logCopilotEvent({ type: 'feedback', dealerId, value: 1, quoteId });
        }}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Positive feedback"
      >
        👍
      </button>
      <button
        onClick={() => {
          setFeedback(0);
          logCopilotEvent({ type: 'feedback', dealerId, value: 0, quoteId });
        }}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Negative feedback"
      >
        👎
      </button>
    </div>
  );
}

interface Props {
  dealerId: string;
  region: string;
  brand: string;
}

export default function DAICopilot({ dealerId, region, brand }: Props) {
  const [line, setLine] = useState<string>("");
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(0.5);
  const [metrics, setMetrics] = useState<{ aiv?: number; forecastChange?: number }>({});
  const [stepIndex, setStepIndex] = useState(0);

  // --- Fetch live metrics from existing endpoints ---
  async function loadMetrics() {
    try {
      const aiRes = await fetch("/api/ai-scores").then((r) => r.json());
      const lh = await fetch("/data/lighthouse-history.json").then((r) => r.json()).catch(() => null);
      const latest = lh?.[lh.length - 1];
      setMetrics({
        aiv: aiRes?.ai_visibility_overall || 75,
        forecastChange: latest ? latest.avg - (lh?.[lh.length - 2]?.avg || 0) : 0
      });
    } catch {
      setMetrics({ aiv: 75, forecastChange: 0 });
    }
  }

  // --- Mood + tone selection ---
  useEffect(() => {
    loadMetrics();
  }, []);

  // Derive mood separately so we can use it in the hook
  const localTime = new Date();
  const moodInfo = deriveCopilotMood({ metrics, feedbackScore, localTime });
  
  // Apply theme signal
  useThemeSignal(moodInfo.mood, moodInfo.tone);

  useEffect(() => {
    if (!metrics) return;

    const script = pulseScripts[Math.floor(Math.random() * pulseScripts.length)] as any;
    const msgIndex = stepIndex % script.steps.length;
    const scriptLine = script.steps[msgIndex];

    async function composeLine() {
      const useQuote = Math.random() < 0.05; // 5%
      let msg: string;
      
      if (useQuote) {
        const quote = getEasterEggQuote();
        if (quote) {
          msg = quote.quote;
          setQuoteId(`${quote.source}::${quote.quote.slice(0, 32)}`);
        } else {
          msg = getNeutralCoachLine();
        }
      } else {
        msg = getNeutralCoachLine();
      }

      const final = `${msg} ${moodInfo.prediction || ""}`.trim();
      setLine(final || scriptLine);
      
      logCopilotEvent({
        dealerId,
        type: "copilot",
        tone: moodInfo.tone,
        context: { metrics, mood: moodInfo.mood, region, brand }
      });
    }

    composeLine();
  }, [metrics, feedbackScore, stepIndex, dealerId, region, brand]);

  // --- Memory buffer (local) ---
  useEffect(() => {
    if (line) {
      const key = "copilot_memory";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push({ line, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(prev.slice(-10)));
    }
  }, [line]);

  // --- Predictive coaching triggers every 90s ---
  useEffect(() => {
    const t = setInterval(() => setStepIndex((s) => s + 1), 90000);
    return () => clearInterval(t);
  }, []);

  if (!line) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={line}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl border border-white/10
                   bg-white/5 backdrop-blur-xl text-slate-200 text-sm leading-relaxed
                   shadow-[0_0_20px_rgba(59,130,246,0.1)] z-50"
      >
        {line}
        <CopilotFeedback
          dealerId={dealerId}
          context={{ region, brand }}
          quoteId={quoteId}
        />
      </motion.div>
    </AnimatePresence>
  );
}

