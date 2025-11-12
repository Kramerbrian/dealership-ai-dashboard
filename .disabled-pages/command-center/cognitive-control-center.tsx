"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import RaRModal from "@/app/(dashboard)/components/metrics/RaRModal";
import QaiModal from "@/app/(dashboard)/components/metrics/QaiModal";
import EEATDrawer from "@/app/(dashboard)/components/metrics/EEATDrawer";
import AIVATIPulseCard from "@/app/(dashboard)/components/metrics/AIVATIPulseCard";
import PlatformBreakdownCard from "@/app/(dashboard)/components/metrics/PlatformBreakdownCard";
import OrbitalView from "@/app/(dashboard)/components/core/OrbitalView";
import { getApiBase } from "@/lib/apiConfig";
import { useRar } from "@/app/(dashboard)/hooks/useRar";
import { createVoiceCommandRouter } from "@/app/(dashboard)/lib/voice/commandRouter";
import { Mic } from "lucide-react";

export default function CognitiveControlCenter() {
  const { user } = useUser();
  const [domain, setDomain] = useState("exampledealer.com");
  const [view, setView] = useState<"cards" | "orbital">("cards");
  const [showRar, setShowRar] = useState(false);
  const [showQai, setShowQai] = useState(false);
  const [showEEAT, setShowEEAT] = useState(false);

  const { rar } = useRar(domain);

  const orbitalNodes = useMemo(() => {
    return [
      { id: "avi", label: "AI Visibility", value: 78, urgency: 0.7, color: "#0ea5e9" },
      { id: "zero", label: "Zero-Click", value: 65, urgency: 0.8, color: "#f59e0b" },
      { id: "ugc", label: "UGC", value: 72, urgency: 0.4, color: "#10b981" },
      { id: "schema", label: "Schema", value: 83, urgency: 0.3, color: "#22c55e" },
      { id: "geo", label: "GEO", value: 70, urgency: 0.5, color: "#6366f1" },
      { id: "cwv", label: "CWV", value: 61, urgency: 0.6, color: "#ef4444" }
    ];
  }, []);

  // Voice command router
  const handleVoiceIntent = createVoiceCommandRouter({
    open_rar: () => setShowRar(true),
    open_qai: () => setShowQai(true),
    open_eeat: () => setShowEEAT(true),
    scan_full: () => {
      // Trigger full scan
      fetch(`${getApiBase()}/scan/full`, { method: "POST", body: JSON.stringify({ domain }) });
    },
    fix_schema: async () => {
      await fetch(`${getApiBase()}/fix/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "schema", domain })
      });
    }
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-white/80">
            dAI — <span className="font-semibold">Chief Clarity Officer</span> (pronounced "dye")
          </div>
          <div className="text-xs text-white/60">Budget: $12,300 • Live ●</div>
        </div>
      </header>

      {/* Command bar */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <input
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-0 text-white"
            placeholder="Ask dAI: 'Why did Zero-Click drop?'  •  'Open E-E-A-T'  •  'Show Revenue at Risk'  •  'Run full scan'"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleVoiceIntent(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              // Voice input handler - integrate with ElevenLabs or Web Speech API
              const spoken = prompt("Voice command (demo):");
              if (spoken) handleVoiceIntent(spoken);
            }}
            className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm flex items-center gap-2"
            aria-label="Voice Command"
          >
            <Mic className="w-4 h-4" /> Speak
          </button>
          <button
            onClick={() => setView(v => v === "cards" ? "orbital" : "cards")}
            className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm"
          >
            {view === "cards" ? "Orbit" : "Cards"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Agent rail */}
        <aside className="col-span-2">
          <div className="sticky top-20 space-y-3">
            {["AEO", "Schema", "GEO", "UGC", "CWV", "NAP", "PIQR", "QAI"].map((k) => (
              <button
                key={k}
                className="w-full text-left px-3 py-2 bg-white/6 hover:bg-white/12 rounded-lg flex items-center justify-between"
                onClick={() => {
                  if (k === "QAI") setShowQai(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm">{k}</span>
                </div>
                <span className="text-xs text-white/50">→</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <section className="col-span-7">
          {view === "cards" ? (
            <div className="space-y-4">
              {/* Live AI Scores - Doctrine-Compliant PulseCard */}
              <AIVATIPulseCard 
                domain={domain}
                dealerId="toyota-naples"
                onDrillDown={() => {
                  // Open detailed view or modal
                  setShowQai(true);
                }}
              />
              
              {/* Platform Breakdown */}
              <PlatformBreakdownCard 
                domain={domain}
                dealerId="toyota-naples"
              />
              
              {/* Legacy Metric Cards - Keep for now, can be removed */}
              <div className="grid grid-cols-3 gap-4">
                <MetricCard title="Zero-Click Coverage" value="65%" tone="amber" />
                <MetricCard title="Review Trust" value="72" tone="green" />
                <button
                  onClick={() => setShowRar(true)}
                  className="p-5 rounded-xl bg-red-900/30 border border-red-500/40 text-left hover:bg-red-900/40 transition-colors"
                >
                  <div className="text-sm text-white/60">Revenue at Risk</div>
                  <div className="text-3xl font-light text-red-300">
                    ${((rar?.monthly ?? 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-white/50 mt-1">Monthly</div>
                </button>
              </div>
            </div>
          ) : (
            <OrbitalView
              nodes={orbitalNodes}
              onSelect={(id) => {
                if (id === "schema") {
                  // open schema modal
                } else if (id === "qai") {
                  setShowQai(true);
                } else if (id === "ugc") {
                  // open UGC drawer
                }
              }}
            />
          )}
        </section>

        {/* Decision feed */}
        <aside className="col-span-3">
          <div className="sticky top-20">
            <div className="text-sm font-semibold mb-3">Decision Feed</div>
            <div className="space-y-3">
              <FeedItem title="Schema Fix Deployed" meta="Proof ready • 2m ago" tone="green" />
              <FeedItem title="Zero-Click -6% WoW" meta="Analyze now" tone="amber" />
              <FeedItem title="Competitor cut CR-V price" meta="Suggest counter-flight" tone="blue" />
            </div>
          </div>
        </aside>
      </main>

      {/* Modals & Drawers */}
      {showQai && (
        <QaiModal domain={domain} open={showQai} onClose={() => setShowQai(false)} />
      )}
      {showRar && (
        <RaRModal domain={domain} open={showRar} onClose={() => setShowRar(false)} />
      )}
      {showEEAT && (
        <EEATDrawer domain={domain} open={showEEAT} onClose={() => setShowEEAT(false)} />
      )}
    </div>
  );
}

/* Minimal metric card for quick parity */
function MetricCard({ title, value, tone }: { title: string; value: string; tone: "red" | "green" | "blue" | "amber" }) {
  const toneClass = {
    red: "text-red-400 border-red-500/40 bg-red-900/20",
    green: "text-emerald-400 border-emerald-500/40 bg-emerald-900/20",
    blue: "text-sky-400 border-sky-500/40 bg-sky-900/20",
    amber: "text-amber-400 border-amber-500/40 bg-amber-900/20"
  }[tone];

  return (
    <div className={`p-5 rounded-xl border ${toneClass} hover:opacity-90 transition-all`}>
      <div className="text-sm text-white/60">{title}</div>
      <div className="text-3xl font-light">{value}</div>
    </div>
  );
}

function FeedItem({ title, meta, tone }: { title: string; meta: string; tone: "green" | "amber" | "blue" }) {
  const toneBg = {
    green: "bg-emerald-500/10 text-emerald-300",
    amber: "bg-amber-500/10 text-amber-300",
    blue: "bg-sky-500/10 text-sky-300"
  }[tone];
  return (
    <div className="p-4 rounded-lg bg-white/8">
      <div className="text-sm font-medium">{title}</div>
      <div className={`text-xs mt-1 ${toneBg} inline-block px-2 py-0.5 rounded`}>{meta}</div>
    </div>
  );
}

