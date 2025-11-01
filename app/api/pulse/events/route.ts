import { NextRequest, NextResponse } from "next/server";
import { recordMarketEvent } from "@/lib/pulse/service";
import { MarketEventSchema } from "@/lib/pulse/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = MarketEventSchema.parse(body);

    const eventId = await recordMarketEvent(validated);

    return NextResponse.json({ ok: true, id: eventId, event: validated });
  } catch (error: any) {
    console.error("Market event error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Invalid event data" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { getRecentMarketEvents } = await import("@/lib/pulse/service");
    const events = await getRecentMarketEvents(20);

    return NextResponse.json({ ok: true, events });
  } catch (error: any) {
    console.error("Get market events error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

