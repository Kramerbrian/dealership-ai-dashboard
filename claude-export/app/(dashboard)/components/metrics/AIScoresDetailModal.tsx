"use client";

import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, XCircle, DollarSign, Zap, ExternalLink } from "lucide-react";
import { useAIScores } from "@/app/(dashboard)/hooks/useAIScores";

interface AIScoresDetailModalProps {
  domain?: string;
  dealerId?: string;
  open: boolean;
  onClose: () => void;
}

export default function AIScoresDetailModal({
  domain,
  dealerId,
  open,
  onClose
}: AIScoresDetailModalProps) {
  const { scores, loading, error } = useAIScores(domain, dealerId);

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-48" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !scores) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 max-w-md"
        >
          <div className="flex items-center gap-2 text-red-300 mb-4">
            <AlertCircle size={20} />
            <h2 className="text-lg font-semibold">Failed to Load</h2>
          </div>
          <p className="text-white/70 text-sm mb-4">
            {error?.message || "Unable to fetch AI scores. Please try again."}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // Normalize scores for display
  const normalizeScore = (score: number) => {
    return score > 1 ? score : Math.round(score * 100);
  };

  const normalizeForHealth = (score: number) => {
    return score > 1 ? score / 100 : score;
  };

  const getHealthStatus = (score: number) => {
    const normalized = normalizeForHealth(score);
    if (normalized >= 0.9) return { label: "Excellent", color: "emerald", icon: CheckCircle2 };
    if (normalized >= 0.75) return { label: "Good", color: "sky", icon: TrendingUp };
    if (normalized >= 0.6) return { label: "Fair", color: "amber", icon: AlertCircle };
    return { label: "Needs Attention", color: "red", icon: AlertCircle };
  };

  const aivPercent = normalizeScore(scores.aiv_score);
  const atiPercent = normalizeScore(scores.ati_score);
  const crsPercent = normalizeScore(scores.crs);

  const aivHealth = getHealthStatus(scores.aiv_score);
  const atiHealth = getHealthStatus(scores.ati_score);
  const crsHealth = getHealthStatus(scores.crs);

  return (
    <div className="fixed inset-0 z-[100]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-neutral-900 text-white border-l border-neutral-800 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-1">AI Performance Details</h2>
              <p className="text-sm text-white/60">
                {scores.dealerId} • {new Date(scores.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Primary Metrics */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Core Scores</h3>
            <div className="grid grid-cols-3 gap-4">
              <ScoreCard
                label="AIV"
                value={aivPercent}
                health={aivHealth}
                description="Algorithmic Visibility Index"
              />
              <ScoreCard
                label="ATI"
                value={atiPercent}
                health={atiHealth}
                description="Algorithmic Trust Index"
              />
              <ScoreCard
                label="CRS"
                value={crsPercent}
                health={crsHealth}
                description="Citation Relevance Score"
              />
            </div>
          </section>

          {/* KPI Scoreboard */}
          <section>
            <h3 className="text-lg font-semibold mb-4">KPI Scoreboard</h3>
            <div className="grid grid-cols-2 gap-4">
              <KPICard label="QAI Star" value={scores.kpi_scoreboard.QAI_star} max={5} />
              <KPICard label="VAI Penalized" value={Math.round(scores.kpi_scoreboard.VAI_Penalized * 100)} suffix="%" />
              <KPICard label="PIQR" value={Math.round(scores.kpi_scoreboard.PIQR * 100)} suffix="%" />
              <KPICard label="HRP" value={Math.round(scores.kpi_scoreboard.HRP * 100)} suffix="%" />
              <KPICard label="OCI" value={Math.round(scores.kpi_scoreboard.OCI * 100)} suffix="%" />
            </div>
          </section>

          {/* Platform Breakdown */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
            <div className="space-y-3">
              {scores.platform_breakdown
                .sort((a, b) => b.score - a.score)
                .map((platform) => (
                  <PlatformRow key={platform.platform} platform={platform} />
                ))}
            </div>
          </section>

          {/* Additional Metrics */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Zero-Click Inclusion"
                value={`${scores.zero_click_inclusion_rate.toFixed(1)}%`}
                icon={Zap}
              />
              <MetricCard
                label="UGC Health"
                value={`${scores.ugc_health_score}%`}
                icon={CheckCircle2}
              />
              <MetricCard
                label="Revenue at Risk"
                value={`$${Math.round(scores.revenue_at_risk_monthly_usd / 1000)}K/mo`}
                icon={DollarSign}
                variant="warning"
              />
            </div>
          </section>

          {/* Actions */}
          <section className="pt-4 border-t border-neutral-800">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Trigger auto-fix workflow
                  window.dispatchEvent(new CustomEvent("open-fix-pack"));
                  onClose();
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Auto-Fix Issues
              </button>
              <button
                onClick={() => {
                  // Export or share
                  const data = JSON.stringify(scores, null, 2);
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ai-scores-${scores.dealerId}-${Date.now()}.json`;
                  a.click();
                }}
                className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Export
              </button>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  health,
  description
}: {
  label: string;
  value: number;
  health: { label: string; color: string; icon: any };
  description: string;
}) {
  const Icon = health.icon;
  const colorClasses = {
    emerald: "border-emerald-500/40 bg-emerald-900/20 text-emerald-300",
    sky: "border-sky-500/40 bg-sky-900/20 text-sky-300",
    amber: "border-amber-500/40 bg-amber-900/20 text-amber-300",
    red: "border-red-500/40 bg-red-900/20 text-red-300"
  }[health.color];

  return (
    <div className={`p-4 rounded-xl border ${colorClasses}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{label}</div>
        <Icon size={18} />
      </div>
      <div className="text-3xl font-light mb-1">{value}%</div>
      <div className="text-xs text-white/60">{description}</div>
      <div className="text-xs text-white/50 mt-2">{health.label}</div>
    </div>
  );
}

function KPICard({
  label,
  value,
  max,
  suffix = ""
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
}) {
  const percentage = max ? (value / max) * 100 : value;
  const color = percentage >= 80 ? "emerald" : percentage >= 60 ? "sky" : "amber";

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-sm text-white/60 mb-2">{label}</div>
      <div className="text-2xl font-semibold text-white mb-2">
        {value.toFixed(max ? 1 : 0)}{suffix}
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            color === "emerald" ? "bg-emerald-500" :
            color === "sky" ? "bg-sky-500" :
            "bg-amber-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PlatformRow({ platform }: { platform: { platform: string; score: number; confidence: "HIGH" | "MEDIUM" | "LOW" } }) {
  const confidenceIcon = {
    HIGH: CheckCircle2,
    MEDIUM: AlertCircle,
    LOW: XCircle
  }[platform.confidence];

  const confidenceColor = {
    HIGH: "text-emerald-400",
    MEDIUM: "text-amber-400",
    LOW: "text-red-400"
  }[platform.confidence];

  const Icon = confidenceIcon;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-white capitalize">
          {platform.platform}
        </div>
        <Icon size={16} className={confidenceColor} />
        <div className="text-xs text-white/50">{platform.confidence}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              platform.score >= 85 ? "bg-emerald-500" :
              platform.score >= 70 ? "bg-amber-500" :
              "bg-red-500"
            }`}
            style={{ width: `${platform.score}%` }}
          />
        </div>
        <div className="text-sm text-white/70 w-12 text-right">
          {platform.score}%
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  variant = "default"
}: {
  label: string;
  value: string;
  icon: any;
  variant?: "default" | "warning";
}) {
  const variantClasses = variant === "warning"
    ? "border-amber-500/40 bg-amber-900/20 text-amber-300"
    : "border-white/10 bg-white/5 text-white";

  return (
    <div className={`p-4 rounded-xl border ${variantClasses}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} />
        <div className="text-sm font-medium">{label}</div>
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

