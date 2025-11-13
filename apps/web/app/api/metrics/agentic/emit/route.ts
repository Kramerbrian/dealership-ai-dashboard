import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { dealerId, metric, value, ts } = await req.json();

    if (!dealerId || metric === undefined || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: dealerId, metric, value" },
        { status: 400 }
      );
    }

    // TODO: persist to agentic_metrics
    try {
      await db.agenticMetric.create({
        data: {
          dealerId,
          metric: String(metric),
          value: Number(value),
          ts: ts ? new Date(ts) : new Date(),
        },
      });

      return NextResponse.json({ ok: true, dealerId, metric, value });
    } catch (dbError: any) {
      // Table might not exist yet, log but don't fail
      console.warn("Failed to persist metric:", dbError.message);
      return NextResponse.json({ ok: true, warning: "Metric not persisted" });
    }
  } catch (error: any) {
    console.error("Metrics emit error:", error);
    return NextResponse.json(
      { error: "Failed to emit metric", details: error.message },
      { status: 500 }
    );
  }
}

