import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/price-changes
 * 
 * "What changed this week" API - Returns price change diff feed
 * 
 * Query params:
 * - dealerId: Filter by dealer (optional)
 * - since: ISO date string (default: 7 days ago)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get("dealerId") || undefined;
    const sinceParam = searchParams.get("since");
    
    // Default to 7 days ago
    const since = sinceParam 
      ? new Date(sinceParam)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch price changes from database
    // Note: This assumes you have a PriceChange model in Prisma
    // If not, you may need to query from a different source
    
    const changes = await prisma.priceChange.findMany({
      where: {
        createdAt: { gte: since },
        // Add dealer filter when dealerId -> VIN relationship is modeled
        // ...(dealerId ? { dealerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Calculate summary statistics
    const summary = {
      count: changes.length,
      avgDeltaPct: changes.length > 0
        ? Number(
            (
              changes.reduce((sum, c) => sum + (c.deltaPct || 0), 0) / changes.length
            ).toFixed(2)
          )
        : 0,
      since: since.toISOString(),
      ...(dealerId ? { dealerId } : {}),
    };

    return NextResponse.json({
      summary,
      changes: changes.slice(0, 500), // Limit response size
    });

  } catch (error) {
    console.error("Price changes API error:", error);
    
    // If PriceChange model doesn't exist yet, return empty result with helpful message
    if (error instanceof Error && error.message.includes("PriceChange")) {
      return NextResponse.json({
        summary: {
          count: 0,
          avgDeltaPct: 0,
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          note: "PriceChange model not yet migrated. Run: npx prisma migrate dev --name add_price_tracking",
        },
        changes: [],
      });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

