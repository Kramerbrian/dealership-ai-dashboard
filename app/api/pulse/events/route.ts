import { NextRequest, NextResponse } from "next/server";
import { PulseRadar } from "@/lib/pulse/radar";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const radar = new PulseRadar();
    const event = await radar.detectEvent(body);
    return NextResponse.json({ ok: true, event });
  } catch (error: any) {
    console.error("Pulse event error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
