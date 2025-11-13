import { NextRequest, NextResponse } from "next/server";
import { calculatePulseScore, type PulseScoreInput } from "@/lib/ai/formulas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signals, timeDelta, penalties } = body as PulseScoreInput;

    if (!signals) {
      return NextResponse.json(
        { ok: false, error: "Missing signals object" },
        { status: 400 }
      );
    }

    const result = calculatePulseScore({
      signals,
      timeDelta,
      penalties,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("Pulse simulation error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

