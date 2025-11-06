import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/forecast-actual/list
 * 
 * Get list of forecasts that don't have actual scores yet
 * This helps users identify which forecasts need actual data
 */
export async function GET() {
  try {
    if (!('forecastLog' in db) || typeof (db as any).forecastLog?.findMany !== 'function') {
      return NextResponse.json({ forecasts: [] });
    }

    // Get forecasts without actual scores
    const forecasts = await (db as any).forecastLog.findMany({
      where: {
        actualScores: null,
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      forecasts: forecasts.map((f: any) => {
        let forecast = null;
        let dealers = null;
        
        try {
          forecast = typeof f.forecast === 'string' ? JSON.parse(f.forecast) : f.forecast;
          dealers = typeof f.dealers === 'string' ? JSON.parse(f.dealers) : f.dealers;
        } catch (e) {
          // Keep as null if parsing fails
        }
        
        return {
          id: f.id,
          timestamp: f.timestamp.toISOString(),
          dealers,
          forecast,
          ci: f.ci,
          leadsForecast: f.leadsForecast,
          revenueForecast: f.revenueForecast,
          daysSince: Math.floor((Date.now() - new Date(f.timestamp).getTime()) / (1000 * 60 * 60 * 24)),
        };
      }),
    });
  } catch (error: any) {
    console.error("Forecast list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get forecast list" },
      { status: 500 }
    );
  }
}

