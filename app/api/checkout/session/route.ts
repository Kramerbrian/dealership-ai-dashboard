import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

/**
 * POST /api/checkout/session
 *
 * Creates a Stripe Checkout Session for subscription management.
 * Supports both user-initiated upgrades and future ACP integration.
 *
 * Phase 2 (Try): Trial data unlocks → Stripe checkout
 * Phase 3 (Buy): User clicks Upgrade → Standard checkout
 *
 * Note: ACP delegate tokens require Stripe SDK v15+ with beta API access
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan = "professional", domain, company, acpToken } = body;

    // ACP token can be passed from external agent
    // Stored in metadata for webhook processing
    const delegateToken = acpToken || null;

    // Determine price ID based on plan
    const priceId = plan === "enterprise" 
      ? process.env.STRIPE_PRICE_ID_ENTERPRISE || process.env.STRIPE_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!;

    // Create Checkout Session with ACP delegate token
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      payment_method_types: ["card"],
      metadata: {
        userId,
        plan,
        domain: domain || "",
        company: company || "",
        source: "dealershipai_web",
        ...(delegateToken && { acp_token: delegateToken.id }),
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          domain: domain || "",
          company: company || "",
          source: "dealershipai_web",
          ...(delegateToken && { acp_token: delegateToken.id }),
        },
        trial_period_days: 14, // 14-day free trial for Phase 2 (Try)
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL}/pricing?plan=${plan}&domain=${encodeURIComponent(domain || "")}`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      acpTokenId: delegateToken,
    });

  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

