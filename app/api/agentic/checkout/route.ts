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

    // Create Stripe checkout session
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return NextResponse.json({
        ok: false,
        error: 'Stripe not configured',
        ai_checkout_url: null,
      }, { status: 503 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_123',
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/onboarding`,
      metadata: {
        userId,
        tenantId,
        dealerId,
        source,
      },
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      ok: true,
      ai_checkout_url: session.url,
      sessionId: session.id,
      next: "scene_7_tier_upgrade",
      dealerId,
      source,
    });
  } catch (error: any) {
    console.error("Agentic checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}

