import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { dealerId, source = "HAL_onboarding" } = await req.json();

    if (!dealerId) {
      return NextResponse.json(
        { error: "Missing required field: dealerId" },
        { status: 400 }
      );
    }

    // TODO: create Stripe PaymentIntent / ACP session
    // For now, return stub response
    const resp = {
      ok: true,
      ai_checkout_url: "https://stripe.example/checkout/session/demo",
      next: "scene_7_tier_upgrade",
      dealerId,
      source,
    };

    return NextResponse.json(resp);
  } catch (error: any) {
    console.error("Agentic checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}

