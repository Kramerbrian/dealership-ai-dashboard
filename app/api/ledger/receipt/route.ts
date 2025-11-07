import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

/**
 * GPT Action: Get impact ledger receipt
 * Returns fix receipts with impact tracking
 */
export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "7");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // TODO: Query from impact_ledger table
    // For now, synthetic structure
    const receipts = [
      {
        fixId: "fix-123",
        pulseId: "schema_missing_vdp",
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        impactUSD: 8200,
        status: "completed",
        timeToResolveMin: 17
      },
      {
        fixId: "fix-124",
        pulseId: "gemini_low_presence",
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        impactUSD: 2400,
        status: "completed",
        timeToResolveMin: 45
      }
    ];

    const totalImpact = receipts.reduce((sum, r) => sum + r.impactUSD, 0);

    return NextResponse.json({
      tenantId,
      periodDays: days,
      receipts,
      totalImpactUSD: totalImpact,
      fixesCompleted: receipts.length
    });
  } catch (error) {
    console.error("Ledger receipt error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
});

