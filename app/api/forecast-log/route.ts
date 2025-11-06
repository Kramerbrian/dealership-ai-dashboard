import { NextRequest, NextResponse } from "next/server";
import { createForecastLog } from "@/lib/db/forecast-log";

export const dynamic = "force-dynamic";

/**
 * POST /api/forecast-log
 * 
 * Stores forecast predictions for accuracy tracking
 * 
 * To enable database storage, run the migration:
 * supabase/migrations/create_forecast_logs_table.sql
 * 
 * Then update your Prisma schema to include:
 * model ForecastLog {
 *   id            String   @id @default(uuid())
 *   timestamp     DateTime
 *   dealers       String[]
 *   forecast      Json
 *   ci            String?
 *   leadsForecast Int?
 *   revenueForecast Int?
 *   createdAt     DateTime @default(now()) @map("created_at")
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      timestamp,
      dealers,
      forecast,
      ci,
      leadsForecast,
      revenueForecast,
    } = body;

    if (!timestamp || !dealers || !forecast) {
      return NextResponse.json(
        { error: "Missing required fields: timestamp, dealers, forecast" },
        { status: 400 }
      );
    }

    // Store forecast using helper function
    // This will gracefully handle missing database table
    const result = await createForecastLog({
      timestamp,
      dealers,
      forecast,
      ci,
      leadsForecast,
      revenueForecast,
    });

    return NextResponse.json({
      status: "logged",
      message: "Forecast logged successfully",
      timestamp,
      id: result?.id || null, // Return forecast ID for reference
    });
  } catch (error: any) {
    console.error("Forecast log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log forecast" },
      { status: 500 }
    );
  }
}
