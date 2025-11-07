/**
 * Model Nutrition API Route
 * 
 * Weekly report showing top patterns, best fixes, registry version
 * Used for GPT Actions and model improvement
 */

import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";
import { loadFormulaRegistry } from "@/lib/formulas/registry";

interface ModelNutrition {
  date: string;
  week_start: string;
  week_end: string;
  registry_version: string;
  top_patterns: Array<{
    pattern: string;
    frequency: number;
    avg_impact_usd: number;
    avg_resolution_min: number;
  }>;
  best_fixes: Array<{
    pulse_id: string;
    impact_usd: number;
    resolution_min: number;
    pattern: string;
  }>;
  model_performance: {
    recommendation_accuracy?: number;
    fix_success_rate?: number;
    avg_time_to_fix?: number;
  };
  metadata?: {
    total_pulses_analyzed?: number;
    total_revenue_impact?: number;
    top_integration?: string;
  };
}

export const GET = withAuth(async ({ req, tenantId }) => {
  const key = `model-nutrition:${tenantId}:${new Date().toISOString().slice(0,10)}`;
  const data = await cacheJSON(key, 86400, async () => {
    const reg = await loadFormulaRegistry(); // pulls weights/thresholds/version
    const patterns = await loadTopPatterns(tenantId);     // [{pattern, avgDeltaUSD, successRate}, ...]
    const issues = await loadCommonIssues(tenantId);       // ['missing Product schema', ...]
    const engines = await loadEnginePresence(tenantId);    // { ChatGPT: 89, Perplexity:78, ... }

    return {
      generatedAt: new Date().toISOString(),
      tenantId,
      registryVersion: reg.version,
      visibilityWeights: reg.visibility_weights,
      visibilityThresholds: reg.visibility_thresholds,
      topFixPatterns: patterns,
      commonIssues: issues,
      enginePresence: engines,
      guidance: [
        "Prefer FAQPage on Service pages for Gemini",
        "Ensure AutoDealer + Product schema on VDP/home",
        "Improve reply latency < 48h for Trust momentum"
      ]
    };
  });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" }
  });
});

// ---- mock loaders (replace) ----
async function loadTopPatterns(tenantId: string) {
  return [
    { pattern: "schema_vdp_product", avgDeltaUSD: 4200, successRate: 0.88 },
    { pattern: "reviews_reply_48h", avgDeltaUSD: 2300, successRate: 0.74 }
  ];
}
async function loadCommonIssues(tenantId: string) {
  return ["Missing Product schema on VDPs", "No FAQPage on Service", "High review reply latency"];
}
async function loadEnginePresence(tenantId: string) {
  return { ChatGPT: 89, Perplexity: 78, Gemini: 72, Copilot: 64 };
}
