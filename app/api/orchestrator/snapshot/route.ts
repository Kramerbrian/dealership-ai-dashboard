import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";

/**
 * GPT Action: Get current snapshot
 * Returns latest pulse feed + scores
 */
export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") || "";

    const cacheKey = `orchestrator:snapshot:${tenantId}:${domain}`;
    const snapshot = await cacheJSON(cacheKey, 30, async () => {
      // Fetch current pulse snapshot
      const pulseRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pulse/snapshot?domain=${encodeURIComponent(domain)}`,
        { cache: "no-store" }
      );
      const pulses = pulseRes.ok ? await pulseRes.json() : [];

      // TODO: Fetch current scores (AIV, ATI, CVI)
      const scores = {
        AIV: 87.3,
        ATI: 82.1,
        CVI: 79.5
      };

      return {
        tenantId,
        domain,
        timestamp: new Date().toISOString(),
        pulses,
        scores,
        integrations: {
          ga4: true,
          reviews: false,
          visibility: true
        }
      };
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Orchestrator snapshot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
});
