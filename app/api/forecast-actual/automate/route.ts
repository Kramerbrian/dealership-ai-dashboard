import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/forecast-actual/automate
 * 
 * Automated endpoint for submitting actual scores
 * Can be called by external systems, webhooks, or cron jobs
 * 
 * Requires authentication token or API key
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication (optional - add your auth logic)
    const authHeader = req.headers.get("authorization");
    const apiKey = process.env.AUTOMATION_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      forecastId, 
      actualScores, 
      actualLeads, 
      actualRevenue,
      source // e.g., "google_analytics", "crm", "manual"
    } = body;

    if (!forecastId || !actualScores) {
      return NextResponse.json(
        { error: "Missing required fields: forecastId, actualScores" },
        { status: 400 }
      );
    }

    // Find the forecast
    if (!('forecastLog' in db) || typeof (db as any).forecastLog?.findUnique !== 'function') {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const forecast = await (db as any).forecastLog.findUnique({
      where: { id: forecastId },
    });

    if (!forecast) {
      return NextResponse.json(
        { error: "Forecast not found" },
        { status: 404 }
      );
    }

    // Check if already has actual scores
    if (forecast.actualScores) {
      return NextResponse.json(
        { 
          error: "Forecast already has actual scores",
          existingAccuracy: forecast.accuracy,
        },
        { status: 409 }
      );
    }

    // Parse forecast and calculate accuracy
    const forecastData = typeof forecast.forecast === 'string' 
      ? JSON.parse(forecast.forecast) 
      : forecast.forecast;

    // Calculate MAPE
    const kpis = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI'];
    let totalError = 0;
    let validKPIs = 0;

    for (const kpi of kpis) {
      const predicted = forecastData[kpi];
      const actual = actualScores[kpi];

      if (predicted !== undefined && actual !== undefined && actual > 0) {
        const error = Math.abs((actual - predicted) / actual) * 100;
        totalError += error;
        validKPIs++;
      }
    }

    const accuracy = validKPIs > 0 ? 100 - (totalError / validKPIs) : null;

    // Update forecast
    await (db as any).forecastLog.update({
      where: { id: forecastId },
      data: {
        actualScores: typeof actualScores === 'object' 
          ? JSON.stringify(actualScores) 
          : actualScores,
        actualLeads,
        actualRevenue,
        accuracy,
      },
    });

    return NextResponse.json({
      status: "updated",
      accuracy: accuracy ? `${accuracy.toFixed(2)}%` : null,
      forecastId,
      source: source || "automated",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Automated actual scores error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update forecast with actual scores" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forecast-actual/automate
 * 
 * Get forecasts ready for automation (30+ days old, no actual scores)
 */
export async function GET() {
  try {
    if (!('forecastLog' in db) || typeof (db as any).forecastLog?.findMany !== 'function') {
      return NextResponse.json({ ready: [] });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const forecasts = await (db as any).forecastLog.findMany({
      where: {
        actualScores: null,
        timestamp: {
          lte: thirtyDaysAgo,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      ready: forecasts.map((f: any) => {
        let forecast = null;
        let dealers = null;
        
        try {
          forecast = typeof f.forecast === 'string' ? JSON.parse(f.forecast) : f.forecast;
          dealers = typeof f.dealers === 'string' ? JSON.parse(f.dealers) : f.dealers;
        } catch (e) {
          // Keep as null if parsing fails
        }
        
        const daysSince = Math.floor(
          (Date.now() - new Date(f.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          id: f.id,
          timestamp: f.timestamp.toISOString(),
          dealers,
          forecast,
          daysSince,
        };
      }),
      count: forecasts.length,
    });
  } catch (error: any) {
    console.error("Get ready forecasts error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get ready forecasts" },
      { status: 500 }
    );
  }
}

