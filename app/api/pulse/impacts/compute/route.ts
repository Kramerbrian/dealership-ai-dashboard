import { NextRequest, NextResponse } from "next/server";
import { PulseRadar } from "@/lib/pulse/radar";
import { MarketEventSchema } from "@/lib/pulse/schemas";

export const dynamic = "force-dynamic";

const radar = new PulseRadar();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, modelId, historicalImpacts, event } = body;

    if (!dealerId || !modelId) {
      return NextResponse.json(
        { ok: false, error: "Missing dealerId or modelId" },
        { status: 400 }
      );
    }

    const validatedEvent = MarketEventSchema.parse(event || {
      id: `event_${Date.now()}`,
      type: "search_algorithm_update",
      severity: "medium",
      detectedAt: new Date().toISOString(),
    });

    const impact = await radar.forecastImpact(
      dealerId,
      modelId,
      historicalImpacts || [],
      validatedEvent
    );

    return NextResponse.json({ ok: true, impact });
  } catch (error: any) {
    console.error("Compute impact error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to compute impact" },
      { status: 500 }
    );
  }
}
