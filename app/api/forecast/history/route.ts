import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/forecast/history
 * 
 * Returns historical forecast entries for accuracy tracking
 * In production, this would query from database
 * 
 * Note: For MVP, forecasts are stored client-side in localStorage.
 * This endpoint returns empty array but can be extended to query database.
 */
export async function GET(req: NextRequest) {
  try {
    // In production, fetch from database:
    // const forecasts = await db.forecastLog.findMany({
    //   orderBy: { timestamp: "desc" },
    //   take: 100,
    // });

    // For MVP, forecasts are stored client-side in localStorage
    // The ForecastAccuracyLeaderboard component will read from localStorage
    // In production, this would return actual database records

    return NextResponse.json(
      {
        forecasts: [],
        message: "Forecast history stored client-side. In production, this would query database.",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("Forecast history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch forecast history" },
      { status: 500 }
    );
  }
}

