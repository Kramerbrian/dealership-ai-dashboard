import { NextRequest, NextResponse } from "next/server";
import { PulseRadar } from "@/lib/pulse/radar";

export const dynamic = "force-dynamic";

const radar = new PulseRadar();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const radarView = await radar.getRadarView(limit);

    return NextResponse.json({ ok: true, ...radarView });
  } catch (error: any) {
    console.error("Radar view error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, severity, affectedDealers, metadata } = body;

    const event = await radar.detectEvent({
      type,
      severity,
      affectedDealers,
      metadata,
    });

    return NextResponse.json({ ok: true, event });
  } catch (error: any) {
    console.error("Detect event error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
