/**
 * GET /api/price-changes
 * 
 * Returns price changes within a time window (default: last 7 days)
 * Query params:
 * - dealerId: optional filter by dealer
 * - since: ISO timestamp (default: 7 days ago)
 * 
 * Returns summary with count, avgDeltaPct, and list of changes
 */

import { NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";

export const GET = createApiRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get("dealerId") ?? undefined;
  const sinceParam = searchParams.get("since");
  
  // Default to 7 days ago if not provided
  const since = sinceParam 
    ? new Date(sinceParam)
    : new Date(Date.now() - 7 * 24 * 3600 * 1000);

  // TODO: Replace with actual database query when PriceChange model exists
  // For now, return mock data structure
  const changes = [
    {
      id: "1",
      vin: "1HGBH41JXMN109186",
      oldPrice: 25000,
      newPrice: 24500,
      deltaPct: -2.0,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "2",
      vin: "1HGBH41JXMN109187",
      oldPrice: 32000,
      newPrice: 31500,
      deltaPct: -1.56,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
  ].filter((c) => {
    const createdAt = new Date(c.createdAt);
    return createdAt >= since && (!dealerId || true); // TODO: add dealer filter when modeled
  });

  const summary = {
    count: changes.length,
    avgDeltaPct: Number(
      (
        changes.reduce((s, c) => s + (c.deltaPct ?? 0), 0) / Math.max(1, changes.length)
      ).toFixed(2)
    ),
    since: since.toISOString(),
    dealerId: dealerId || null,
  };

  return NextResponse.json(
    { summary, changes },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
});

