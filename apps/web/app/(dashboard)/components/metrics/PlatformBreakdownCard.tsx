"use client";

import { motion } from "framer-motion";
import { useAIScores, type PlatformBreakdown } from "@/app/(dashboard)/hooks/useAIScores";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface PlatformBreakdownCardProps {
  domain?: string;
  dealerId?: string;
}

export default function PlatformBreakdownCard({ domain, dealerId }: PlatformBreakdownCardProps) {
  const { scores, loading } = useAIScores(domain, dealerId);

  if (loading || !scores) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="animate-pulse h-20" />
      </div>
    );
  }

  const platforms = scores.platform_breakdown || [];
  const sortedPlatforms = [...platforms].sort((a, b) => b.score - a.score);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="text-sm font-semibold text-white mb-3">Platform Performance</div>
      <div className="space-y-2">
        {sortedPlatforms.map((platform, idx) => (
          <PlatformRow key={platform.platform} platform={platform} index={idx} />
        ))}
      </div>
    </div>
  );
}

function PlatformRow({ platform, index }: { platform: PlatformBreakdown; index: number }) {
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
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-white capitalize">
          {platform.platform}
        </div>
        <Icon size={14} className={confidenceColor} />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${platform.score}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`h-full ${
              platform.score >= 85 ? "bg-emerald-500" :
              platform.score >= 70 ? "bg-amber-500" :
              "bg-red-500"
            }`}
          />
        </div>
        <div className="text-sm text-white/70 w-12 text-right">
          {platform.score}%
        </div>
      </div>
    </motion.div>
  );
}

