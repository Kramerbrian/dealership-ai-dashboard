import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";

// Synthetic last-7 checks for AIV/ATI; swap with DB later
export const GET = withAuth(async ({ req, tenantId }) => {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || undefined || "example.com";
  const key = `scores_hist:${tenantId}:${domain}`;

  const data = await cacheJSON(key, 120, async () => {
    const now = Date.now();
    const mk = (offsetHrs: number, aiv: number, ati: number) => ({
      tsISO: new Date(now - offsetHrs * 3600 * 1000).toISOString(),
      aiv, ati
    });
    // last 7 points over 48 hours (for nice demo)
    const rows = [
      mk(48, 74, 68),
      mk(36, 75, 69),
      mk(24, 78, 71),
      mk(18, 79, 71),
      mk(12, 81, 72),
      mk(6,  83, 73),
      mk(0,  84, 74)
    ];
    return { domain, rows, lastUpdatedISO: new Date().toISOString() };
  });

  return NextResponse.json(data);
});

