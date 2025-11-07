import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";

/**
 * GPT Action: Get pulse recommendations
 * Returns prioritized pulses based on impact/confidence
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const body = await req.json();
    const { limit = 5, minImpact = 1000 } = body;

    // Fetch pulse snapshot
    const pulseRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pulse/snapshot`,
      { cache: "no-store" }
    );
    const allPulses = pulseRes.ok ? await pulseRes.json() : [];

    // Filter and sort by impact
    const recommended = allPulses
      .filter((p: any) => p.impactMonthlyUSD >= minImpact)
      .sort((a: any, b: any) => b.impactMonthlyUSD - a.impactMonthlyUSD)
      .slice(0, limit)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        impactUSD: p.impactMonthlyUSD,
        confidence: p.confidenceScore,
        etaSeconds: p.etaSeconds,
        prescription: p.prescription
      }));

    return NextResponse.json({
      recommended,
      total: allPulses.length,
      filtered: recommended.length
    });
  } catch (error) {
    console.error("Pulse recommend error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
});

