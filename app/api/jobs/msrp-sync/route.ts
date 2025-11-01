import { NextRequest, NextResponse } from "next/server";
import { syncMSRPRecords } from "@/lib/jobs/msrpSync";

/**
 * POST /api/jobs/msrp-sync
 * 
 * Nightly MSRP synchronization job
 * Can be triggered by:
 * - Supabase pg_cron (2 AM daily)
 * - Node scheduler (scripts/scheduler.ts)
 * - Manual trigger via diagnostics endpoint
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && authHeader !== `Bearer local-dev`) {
      // Allow local-dev for development, require proper secret in production
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const records = body.records || [];

    // If no records provided, fetch from your MSRP data source
    // This is a placeholder - implement your actual MSRP fetch logic
    if (records.length === 0) {
      console.log("No records provided, fetching from MSRP source...");
      // TODO: Implement MSRP data fetch from your source
      // Example: const msrpData = await fetchMSRPFromSource();
      // records = msrpData;
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No MSRP records to sync",
        changes: [],
      });
    }

    // Sync MSRP records and get changes
    const changes = await syncMSRPRecords(records);

    return NextResponse.json({
      success: true,
      message: `Synced ${records.length} records, ${changes.length} changes detected`,
      recordsProcessed: records.length,
      changesDetected: changes.length,
      changes: changes.slice(0, 100), // Limit response size
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("MSRP sync job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/msrp-sync
 * 
 * Health check endpoint for cron monitoring
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "msrp-sync",
    timestamp: new Date().toISOString(),
    cron: {
      schedule: "0 2 * * *", // 2 AM daily
      timezone: process.env.TZ || "America/New_York",
    },
  });
}

