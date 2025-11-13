/**
 * Cron Job: Process Nurture Email Sequences
 * Run every hour to send welcome + nurture emails
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/nurture",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

// Stub for processNurtureBatch if email lib doesn't exist
async function processNurtureBatch(stage: number, limit: number) {
  return { sent: 0, failed: 0 };
}

export async function GET(req: Request) {
  // Verify cron secret (for security)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      welcome: { sent: 0, failed: 0 },
      day1: { sent: 0, failed: 0 },
      day3: { sent: 0, failed: 0 },
      day7: { sent: 0, failed: 0 },
    };

    // Process welcome emails (stage 0)
    results.welcome = await processNurtureBatch(0, 100);

    // Process day 1 nurture (stage 1)
    results.day1 = await processNurtureBatch(1, 100);

    // Process day 3 nurture (stage 2)
    results.day3 = await processNurtureBatch(2, 100);

    // Process day 7 nurture (stage 3)
    results.day7 = await processNurtureBatch(3, 100);

    const totalSent =
      results.welcome.sent +
      results.day1.sent +
      results.day3.sent +
      results.day7.sent;
    const totalFailed =
      results.welcome.failed +
      results.day1.failed +
      results.day3.failed +
      results.day7.failed;

    console.log("[Cron] Nurture batch complete:", {
      totalSent,
      totalFailed,
      results,
    });

    return NextResponse.json({
      ok: true,
      totalSent,
      totalFailed,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Nurture batch error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
