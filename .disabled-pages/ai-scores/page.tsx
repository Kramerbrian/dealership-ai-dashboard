"use client";

import { useState } from "react";
import AIVATIPulseCard from "@/app/(dashboard)/components/metrics/AIVATIPulseCard";
import PlatformBreakdownCard from "@/app/(dashboard)/components/metrics/PlatformBreakdownCard";
import AIScoresDetailModal from "@/app/(dashboard)/components/metrics/AIScoresDetailModal";

export default function AIScoresPage() {
  const [showDetail, setShowDetail] = useState(false);
  
  // In production, get these from user context or URL params
  const domain = "https://naplesfordfl.com";
  const dealerId = "toyota-naples";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">AI Performance Metrics</h1>
          <p className="text-sm text-white/60 mt-1">
            Live AIV, ATI, and CRS scores from DealershipAI API
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Primary PulseCard - Doctrine-Compliant */}
        <AIVATIPulseCard
          domain={domain}
          dealerId={dealerId}
          onDrillDown={() => setShowDetail(true)}
        />

        {/* Platform Breakdown */}
        <PlatformBreakdownCard
          domain={domain}
          dealerId={dealerId}
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Model Version"
            value="AIVATI-RL-v1.3"
            description="Latest scoring engine"
          />
          <StatCard
            label="Last Updated"
            value="Just now"
            description="Auto-refreshes every 5 min"
          />
          <StatCard
            label="Status"
            value="Operational"
            description="All systems normal"
            variant="success"
          />
        </div>
      </main>

      {/* Detail Modal */}
      <AIScoresDetailModal
        domain={domain}
        dealerId={dealerId}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  variant = "default"
}: {
  label: string;
  value: string;
  description: string;
  variant?: "default" | "success" | "warning";
}) {
  const variantClasses = {
    default: "border-white/10 bg-white/5",
    success: "border-emerald-500/40 bg-emerald-900/20",
    warning: "border-amber-500/40 bg-amber-900/20"
  }[variant];

  return (
    <div className={`p-4 rounded-xl border ${variantClasses}`}>
      <div className="text-sm text-white/60 mb-1">{label}</div>
      <div className="text-lg font-semibold text-white mb-1">{value}</div>
      <div className="text-xs text-white/50">{description}</div>
    </div>
  );
}

