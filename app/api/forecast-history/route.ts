import { NextResponse } from "next/server";
import { getForecastHistory } from "@/lib/db/forecast-log";

export const dynamic = "force-dynamic";

/**
 * GET /api/forecast-history
 * 
 * Retrieves historical forecast predictions for the Forecast Review Dashboard
 * 
 * Returns empty array if database table doesn't exist yet (graceful degradation)
 */
export async function GET() {
  try {
    const forecasts = await getForecastHistory(100);
    return NextResponse.json(forecasts);
  } catch (error: any) {
    console.error("Forecast history error:", error);
    
    // Gracefully return empty array if table doesn't exist
    return NextResponse.json([]);
  }
}

