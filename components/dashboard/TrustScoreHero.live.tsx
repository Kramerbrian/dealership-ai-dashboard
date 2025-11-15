// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { dai } from "@/lib/dai/client";
import TrustScoreHero from "./TrustScoreHero";

interface TrustScoreHeroLiveProps {
  domain: string;
  tier: "free" | "pro" | "enterprise";
}

export default function TrustScoreHeroLive({
  domain,
  tier,
}: TrustScoreHeroLiveProps) {
  const [score, setScore] = useState<number | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    dai
      .getAIScores(domain)
      .then((res) => {
        if (!mounted) return;

        // map KPI → Trust Score: (QAI*0.6 + E-E-A-T*0.4). Use PIQR as E-E-A-T proxy here.
        const trust = Math.round(
          ((res.kpi_scoreboard.QAI_star / 5) * 0.6 +
            res.kpi_scoreboard.PIQR * 0.4) *
            100
        );
        setDelta(+(Math.random() * 2 - 1).toFixed(1)); // placeholder until trend API added
        setScore(trust);
      })
      .catch((err) => {
        console.error("Failed to fetch AI scores:", err);
        if (mounted) {
          setScore(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [domain]);

  if (loading || score === null) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <TrustScoreHero
      score={score}
      delta={delta}
      lastRefreshed={new Date()}
      userTier={tier}
    />
  );
}

