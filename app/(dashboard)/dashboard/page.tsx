"use client";
import { TrustScoreHero } from "@/components/dashboard/TrustScoreHero";
import { PillarCard } from "@/components/dashboard/PillarCard";
import { SignalTicker } from "@/components/dashboard/SignalTicker";
import { OCIFinancialPanel } from "@/components/dashboard/OCIFinancialPanel";
import { PulseCardsPanel } from "@/components/dashboard/PulseCardsPanel";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">AI Visibility Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Real-time insights into your dealership's AI presence
          </p>
        </div>

        {/* Signal Ticker */}
        <SignalTicker />

        {/* Trust Score Hero */}
        <TrustScoreHero score={87} delta={5.2} trustLabel="Excellent" />

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <PillarCard title="SEO Score" score={89} status="Strong" />
          <PillarCard title="AEO Score" score={72} status="Good" />
          <PillarCard title="GEO Score" score={65} status="Fair" />
          <PillarCard title="QAI Score" score={91} status="Excellent" />
        </div>

        {/* OCI + Pulse Signals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <OCIFinancialPanel
              monthlyRisk={43000}
              topIssues={[
                "Missing AutoDealer Schema (-$12K/mo)",
                "Low review response rate (-$8K/mo)",
                "Incomplete FAQ schema (-$5K/mo)"
              ]}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="mb-4 text-lg font-semibold text-white">Pulse Signals</h2>
              <PulseCardsPanel variant="timeline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
