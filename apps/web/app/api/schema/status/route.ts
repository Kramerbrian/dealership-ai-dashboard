import { NextRequest, NextResponse } from "next/server";
import { getLastSchemaValidation } from "@/lib/schema/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;
    const dealerId = sp.get("dealerId");
    if (!dealerId) {
      return NextResponse.json(
        { ok: false, error: "dealerId required" },
        { status: 400 }
      );
    }

    const last = await getLastSchemaValidation(dealerId);
    return NextResponse.json({ dealerId, last });
  } catch (error: any) {
    console.error("Schema status error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

