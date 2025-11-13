import { NextRequest, NextResponse } from "next/server";
import { createAuthRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CheckoutSchema = z.object({
  dealerId: z.string().min(1, 'Dealer ID is required'),
  source: z.string().optional().default('HAL_onboarding'),
});

export const POST = createAuthRoute(async (req: NextRequest, { userId, tenantId }) => {
  try {
    const body = await req.json();
    const { dealerId, source } = CheckoutSchema.parse(body);

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
}, {
  schema: CheckoutSchema,
});

