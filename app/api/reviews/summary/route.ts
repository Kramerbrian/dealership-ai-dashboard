// app/api/reviews/summary/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";
import { getIntegration } from "@/lib/integrations/store";

type ReviewsSummary = {
  placeId: string | null;
  avgRating: number;           // 0..5
  totalReviews: number;
  last30New: number;
  replyRatePct: number;        // 0..100
  replyLatencyHours: number;   // avg hours to first reply
  recentUnanswered: number;    // count
  lastUpdatedISO: string;
  connected: boolean;
};

export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const placeIdQ = url.searchParams.get("placeId");
    const domain = url.searchParams.get("domain") || "";

    // Get stored integration to retrieve place_id
    const integ = await getIntegration(tenantId, "reviews");
    const placeId = placeIdQ || integ?.metadata?.place_id || "";

    const cacheKey = `reviews:${tenantId}:${placeId}:${domain}`;
    const data = await cacheJSON(cacheKey, 120, async () => {
      if (!placeId) {
        // Not connected yet → soft synthetic
        const synthetic: ReviewsSummary = {
          placeId: null,
          avgRating: 4.3,
          totalReviews: 1276,
          last30New: 84,
          replyRatePct: 61,
          replyLatencyHours: 72,
          recentUnanswered: 12,
          lastUpdatedISO: new Date().toISOString(),
          connected: false
        };
        return synthetic;
      }

      // TODO: call GBP provider using placeId and provider in integ.metadata.provider
      // For now: synthetic data with connected flag
      const synthetic: ReviewsSummary = {
        placeId,
        avgRating: 4.5,
        totalReviews: 1650,
        last30New: 112,
        replyRatePct: 78,
        replyLatencyHours: 28,
        recentUnanswered: 4,
        lastUpdatedISO: new Date().toISOString(),
        connected: true
      };
      return synthetic;
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=900" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
});
