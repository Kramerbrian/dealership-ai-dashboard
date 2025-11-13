"use client";

import { useEffect, useState } from "react";
import { dai } from "@/lib/dai/client";
import PillarCard from "./PillarCard";

interface PillarsLiveProps {
  domain: string;
  tier: "free" | "pro" | "enterprise";
}

export default function PillarsLive({ domain, tier }: PillarsLiveProps) {
  const [pillars, setPillars] = useState<{
    SEO: number;
    AEO: number;
    GEO: number;
    QAI: number;
  }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dai
      .getAIScores(domain)
      .then((r: any) => {
        const diag = r as any; // if you also return diagnostics in future release
        const SEO = Math.round(
          ((diag?.diagnostics?.schema_coverage_ratio ?? 0.84) * 0.4 +
            (diag?.diagnostics?.silo_integrity_score ?? 0.71) * 0.3 +
            (diag?.diagnostics?.semantic_clarity_score ?? 0.76) * 0.3) *
            100
        );
        const AEO = Math.round(
          (r.zero_click_inclusion_rate * 0.7 +
            (diag?.authority_depth_index ?? 0.69) * 0.3) *
            100
        );
        const GEO = Math.round(
          ((r.platform_breakdown?.find((p: any) => p.platform === "chatgpt")
            ?.score ?? 0.7) +
            (r.platform_breakdown?.find((p: any) => p.platform === "perplexity")
              ?.score ?? 0.7)) *
            50
        );
        const QAI = Math.round(
          (r.kpi_scoreboard.QAI_star / 5) * r.kpi_scoreboard.PIQR * 100
        );
        setPillars({ SEO, AEO, GEO, QAI });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [domain]);

  if (loading || !pillars) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <PillarCard
        pillar="SEO"
        score={pillars.SEO}
        delta={0}
        trendData={[pillars.SEO]}
        components={[]}
        userTier={tier}
      />
      <PillarCard
        pillar="AEO"
        score={pillars.AEO}
        delta={0}
        trendData={[pillars.AEO]}
        components={[]}
        userTier={tier}
      />
      <PillarCard
        pillar="GEO"
        score={pillars.GEO}
        delta={0}
        trendData={[pillars.GEO]}
        components={[]}
        userTier={tier}
      />
      <PillarCard
        pillar="QAI"
        score={pillars.QAI}
        delta={0}
        trendData={[pillars.QAI]}
        components={[]}
        userTier={tier}
      />
    </div>
  );
}

