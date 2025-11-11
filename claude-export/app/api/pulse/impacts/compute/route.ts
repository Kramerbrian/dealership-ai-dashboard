import { NextRequest, NextResponse } from "next/server";
import { PulseRadar } from "@/lib/pulse/radar";
import { MarketEvent } from "@/lib/pulse/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { dealerId, modelId, historicalImpacts, event } = await req.json();

    if (!dealerId || !modelId || !event) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: dealerId, modelId, event" },
        { status: 400 }
      );
    }

    const radar = new PulseRadar();
    const impact = await radar.forecastImpact(
      dealerId,
      modelId,
      historicalImpacts || [],
      event as MarketEvent
    );

    return NextResponse.json({ ok: true, impact });
  } catch (error: any) {
    console.error("Pulse impact compute error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
