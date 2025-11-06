import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/forecast-actual
 * 
 * Submit actual KPI scores to compare with forecasts
 * This enables forecast accuracy tracking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { forecastId, actualScores, actualLeads, actualRevenue } = body;

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

    // Parse forecast and calculate accuracy
    const forecastData = typeof forecast.forecast === 'string' 
      ? JSON.parse(forecast.forecast) 
      : forecast.forecast;

    // Calculate MAPE (Mean Absolute Percentage Error)
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

    // Update forecast with actual scores
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
    });
  } catch (error: any) {
    console.error("Forecast actual update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update forecast with actual scores" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forecast-actual
 * 
 * Get forecast accuracy statistics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!('forecastLog' in db) || typeof (db as any).forecastLog?.findMany !== 'function') {
      return NextResponse.json({ accuracy: [], stats: null });
    }

    // Get forecasts with actual scores
    const forecasts = await (db as any).forecastLog.findMany({
      where: {
        actualScores: { not: null },
        accuracy: { not: null },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Calculate statistics
    const accuracies = forecasts
      .map((f: any) => f.accuracy)
      .filter((a: any) => a !== null);

    const stats = accuracies.length > 0 ? {
      averageAccuracy: accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length,
      minAccuracy: Math.min(...accuracies),
      maxAccuracy: Math.max(...accuracies),
      totalForecasts: forecasts.length,
    } : null;

    return NextResponse.json({
      accuracy: forecasts.map((f: any) => ({
        id: f.id,
        timestamp: f.timestamp.toISOString(),
        accuracy: f.accuracy,
        forecast: typeof f.forecast === 'string' ? JSON.parse(f.forecast) : f.forecast,
        actualScores: typeof f.actualScores === 'string' ? JSON.parse(f.actualScores) : f.actualScores,
      })),
      stats,
    });
  } catch (error: any) {
    console.error("Forecast accuracy error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get forecast accuracy" },
      { status: 500 }
    );
  }
}

