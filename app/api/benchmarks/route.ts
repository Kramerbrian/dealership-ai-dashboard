import { NextResponse } from "next/server";
import { withAuth } from "../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";

/**
 * Cohort benchmarks API
 * Returns percentile rankings for AIV/ATI by segment
 */
export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const segment = url.searchParams.get("segment") || "all";
    const scope = url.searchParams.get("scope") || "dma"; // 'dma' | 'national'

    const cacheKey = `benchmarks:${segment}:${scope}`;
    const benchmarks = await cacheJSON(cacheKey, 3600, async () => {
      // TODO: Query from aggregated benchmark data
      // For now, synthetic percentiles
      return {
        segment,
        scope,
        percentiles: {
          AIV: {
            p25: 62,
            p50: 75,
            p75: 87,
            p90: 92
          },
          ATI: {
            p25: 58,
            p50: 72,
            p75: 84,
            p90: 89
          },
          CVI: {
            p25: 55,
            p50: 68,
            p75: 80,
            p90: 86
          }
        },
        sampleSize: 1247,
        lastUpdated: new Date().toISOString()
      };
    });

    return NextResponse.json(benchmarks);
  } catch (error) {
    console.error("Benchmarks error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
});

