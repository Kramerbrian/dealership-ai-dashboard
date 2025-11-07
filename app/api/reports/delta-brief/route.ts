/**
 * Delta Brief API Route
 * 
 * Nightly report showing daily changes: scores, pulses closed, integrations
 * Used for GPT Actions and learning loop
 */

import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";
import { sendMilestone } from "@/lib/slack/milestones";

interface DeltaBrief {
  date: string;
  dealership?: string;
  scores: {
    AIV?: number;
    ATI?: number;
    CVI?: number;
  };
  pulses_closed: Array<{
    id: string;
    deltaUSD: number;
    timeToResolveMin: number;
  }>;
  integrations: string[];
  metadata?: {
    totalRevenueRecovered?: number;
    totalPulsesResolved?: number;
    averageResolutionTime?: number;
  };
}

export const GET = withAuth(async ({ req, tenantId }) => {
  const url = new URL(req.url);
  const sinceISO = url.searchParams.get("since") || new Date(Date.now() - 24*3600*1000).toISOString();

  const key = `delta-brief:${tenantId}:${sinceISO}`;
  const brief = await cacheJSON(key, 3600, async () => {
    // TODO: replace with real data sources
    const scores = await loadScoreDeltas(tenantId, sinceISO);    // { AIV:+6, ATI:+3, CVI:+2 }
    const fixes = await loadFixReceipts(tenantId, sinceISO);     // [{id, deltaUSD, timeToResolveMin}, ...]
    const integrations = await loadIntegrations(tenantId);       // ['ga4','reviews_api', ...]

    const weeklyRecovered = fixes.reduce((s,f)=> s + (f.deltaUSD || 0), 0);
    const payload = {
      date: new Date().toISOString().slice(0,10),
      tenantId,
      scores,
      pulses_closed: fixes,
      integrations,
      weeklyRecovered
    };

    // Optional Slack post on large gains
    try {
      const big = fixes.filter(f => f.deltaUSD >= 5000);
      if (scores?.AIV && scores.AIV >= 10) {
        await sendMilestone({
          type: "aiv_spike",
          tenantId,
          value: scores.AIV,
          metadata: { weeklyRecovered }
        });
      }
      if (big.length > 0) {
        await sendMilestone({
          type: "revenue_recovered",
          tenantId,
          value: weeklyRecovered,
          metadata: { fixes: big.length }
        });
      }
    } catch { /* no-op */ }

    return payload;
  });

  return NextResponse.json(brief, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" }
  });
});

// ---- mock loaders (replace with your DB/analytics) ----
async function loadScoreDeltas(tenantId: string, sinceISO: string) {
  return { AIV: 6, ATI: 3, CVI: 2 };
}
async function loadFixReceipts(tenantId: string, sinceISO: string) {
  return [
    { id: "schema_missing_vdp", deltaUSD: 8200, timeToResolveMin: 17 },
    { id: "reviews_latency_high", deltaUSD: 3100, timeToResolveMin: 9 }
  ];
}
async function loadIntegrations(tenantId: string) {
  return ["ga4", "reviews_api"];
}
