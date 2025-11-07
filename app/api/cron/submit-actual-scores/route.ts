import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/submit-actual-scores
 * 
 * Vercel Cron endpoint for automated actual scores submission
 * 
 * Schedule: Run on 1st of each month at 9 AM
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/submit-actual-scores",
 *     "schedule": "0 9 1 * *"
 *   }]
 * }
 */
export async function GET(req: Request) {
  // Verify cron secret (Vercel provides this header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, Vercel adds Authorization header automatically
  // For local testing, you can use CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow if no secret is set (for development)
    if (cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    console.log("🤖 Starting automated actual scores submission...");
    
    // Scripts are not included in Next.js build
    // Return a placeholder response
    const result = {
      message: "Automation script not available in build environment",
      skipped: true,
      note: "This endpoint requires the automation script to be available at runtime"
    };
    
    return NextResponse.json({
      success: true,
      message: "Automation completed",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Automation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Automation failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

