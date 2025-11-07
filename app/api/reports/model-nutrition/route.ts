import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";
import { loadFormulaRegistry } from "@/lib/formulas/registry";

/**
 * Model Nutrition - Weekly report (Sunday 23:00)
 * Tracks top patterns, best fixes, registry version
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registry = await loadFormulaRegistry();

    // TODO: Aggregate from telemetry/ledger over last 7 days
    // For now, synthetic structure
    const nutrition = {
      week: new Date().toISOString().split("T")[0],
      registry_version: registry.version,
      top_patterns: [
        {
          pattern: "missing_product_schema",
          frequency: 1247,
          avgImpactUSD: 8200,
          avgTimeToResolveMin: 23
        },
        {
          pattern: "gemini_low_presence",
          frequency: 892,
          avgImpactUSD: 2400,
          avgTimeToResolveMin: 45
        },
        {
          pattern: "reviews_latency_high",
          frequency: 634,
          avgImpactUSD: 3100,
          avgTimeToResolveMin: 120
        }
      ],
      best_fixes: [
        {
          fixId: "schema_inject_product",
          successRate: 0.94,
          avgDeltaUSD: 8200,
          avgTimeMin: 17
        },
        {
          fixId: "faqpage_add_service",
          successRate: 0.87,
          avgDeltaUSD: 2400,
          avgTimeMin: 45
        }
      ],
      registry_health: {
        thresholds_updated: 0,
        weights_updated: 0,
        tenant_overrides: 12
      }
    };

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Model nutrition error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

