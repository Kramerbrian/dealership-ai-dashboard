"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { useAIScores } from "@/app/(dashboard)/hooks/useAIScores";

interface AIVATIPulseCardProps {
  domain?: string;
  dealerId?: string;
  onDrillDown?: () => void;
}

export default function AIVATIPulseCard({ 
  domain, 
  dealerId, 
  onDrillDown 
}: AIVATIPulseCardProps) {
  const { scores, loading, error } = useAIScores(domain, dealerId);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-8 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !scores) {
    return (
      <div className="p-6 rounded-2xl bg-red-900/20 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-300">
          <AlertCircle size={18} />
          <span className="text-sm">Failed to load AI scores</span>
        </div>
      </div>
    );
  }

  // Handle both formats: 0-1 scale or 0-100 percentage
  const normalizeScore = (score: number) => {
    return score > 1 ? score : Math.round(score * 100);
  };
  
  const aivPercent = normalizeScore(scores.aiv_score);
  const atiPercent = normalizeScore(scores.ati_score);
  const crsPercent = normalizeScore(scores.crs);
  
  // For health calculation, normalize to 0-1
  const normalizeForHealth = (score: number) => {
    return score > 1 ? score / 100 : score;
  };
  
  // Determine health status
  const getHealthStatus = (score: number) => {
    const normalized = normalizeForHealth(score);
    if (normalized >= 0.9) return { label: "Excellent", color: "emerald", icon: CheckCircle2 };
    if (normalized >= 0.75) return { label: "Good", color: "sky", icon: TrendingUp };
    if (normalized >= 0.6) return { label: "Fair", color: "amber", icon: AlertCircle };
    return { label: "Needs Attention", color: "red", icon: AlertCircle };
  };

  const aivHealth = getHealthStatus(scores.aiv_score);
  const atiHealth = getHealthStatus(scores.ati_score);
  const crsHealth = getHealthStatus(scores.crs);

  // Calculate primary insight (normalize all to 0-1 for comparison)
  const aivNorm = normalizeForHealth(scores.aiv_score);
  const atiNorm = normalizeForHealth(scores.ati_score);
  const crsNorm = normalizeForHealth(scores.crs);
  const lowestScore = Math.min(aivNorm, atiNorm, crsNorm);
  const lowestMetric = 
    lowestScore === aivNorm ? "AI Visibility" :
    lowestScore === atiNorm ? "Algorithmic Trust" :
    "Cognitive Readiness";

  // Generate prescription based on data
  const prescription = scores.revenue_at_risk_monthly_usd > 30000
    ? `Address ${lowestMetric.toLowerCase()} gaps to recover $${Math.round(scores.revenue_at_risk_monthly_usd / 1000)}K/mo`
    : `Optimize ${lowestMetric.toLowerCase()} for +${Math.round((1 - lowestScore) * 15)}% improvement`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
      onClick={onDrillDown}
    >
      {/* Headline - Plain English Outcome */}
      <div className="mb-4">
        <div className="text-sm text-white/60 mb-1">Live AI Performance</div>
        <div className="text-lg font-semibold text-white">
          {aivHealth.label} visibility across {scores.platform_breakdown.length} AI platforms
        </div>
      </div>

      {/* Primary Metrics - Visual Hierarchy */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <MetricPulse
          label="AIV"
          value={aivPercent}
          health={aivHealth}
          trend={scores.aiv_score >= 0.85 ? "up" : "neutral"}
        />
        <MetricPulse
          label="ATI"
          value={atiPercent}
          health={atiHealth}
          trend={scores.ati_score >= 0.85 ? "up" : "neutral"}
        />
        <MetricPulse
          label="CRS"
          value={crsPercent}
          health={crsHealth}
          trend={scores.crs >= 0.85 ? "up" : "neutral"}
        />
      </div>

      {/* Diagnosis - Cause Explanation */}
      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="text-xs text-white/70 mb-1">Diagnosis</div>
        <div className="text-sm text-white/90">
          {lowestMetric} is limiting your AI presence. {scores.platform_breakdown.filter(p => p.confidence === "LOW").length} platforms have low confidence.
        </div>
      </div>

      {/* Prescription - Next Action */}
      <div className="mb-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
        <div className="text-xs text-emerald-300/80 mb-1">Prescription</div>
        <div className="text-sm text-emerald-200 font-medium">
          {prescription}
        </div>
      </div>

      {/* Impact & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-xs text-white/60">
          Risk: ${Math.round(scores.revenue_at_risk_monthly_usd / 1000)}K/mo
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Trigger auto-fix workflow
              if (onDrillDown) onDrillDown();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Zap size={14} />
            Auto-Fix
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDrillDown) onDrillDown();
            }}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MetricPulse({ 
  label, 
  value, 
  health, 
  trend 
}: { 
  label: string; 
  value: number; 
  health: { label: string; color: string; icon: any };
  trend: "up" | "down" | "neutral";
}) {
  const Icon = health.icon;
  const colorClasses = {
    emerald: "text-emerald-400 border-emerald-500/40",
    sky: "text-sky-400 border-sky-500/40",
    amber: "text-amber-400 border-amber-500/40",
    red: "text-red-400 border-red-500/40"
  }[health.color];

  return (
    <div className={`p-3 rounded-lg border ${colorClasses || ""} bg-white/5`}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-white/60">{label}</div>
        <Icon size={14} className={colorClasses?.split(' ')[0] || ""} />
      </div>
      <div className={`text-2xl font-light ${colorClasses?.split(' ')[0] || ""}`}>
        {value}%
      </div>
      {trend !== "neutral" && (
        <div className="mt-1 flex items-center gap-1">
          {trend === "up" ? (
            <TrendingUp size={12} className="text-emerald-400" />
          ) : (
            <TrendingDown size={12} className="text-red-400" />
          )}
          <span className="text-xs text-white/50">{health.label}</span>
        </div>
      )}
    </div>
  );
}

