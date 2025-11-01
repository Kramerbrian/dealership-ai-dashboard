import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

/**
 * POST /api/checkout/session
 * 
 * Creates a Stripe Checkout Session with ACP delegate token for agentic commerce.
 * Supports both user-initiated upgrades and agent-driven purchases.
 * 
 * Phase 2 (Try): Trial data unlocks → Stripe ACP
 * Phase 3 (Buy): Agent/user clicks Upgrade → ACP checkout
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
    const { plan = "professional", domain, company } = body;

    // Phase 2/3: Create ACP Delegated Payment token
    let delegateToken: Stripe.AgenticCommerce.Token | null = null;
    
    try {
      delegateToken = await stripe.agenticCommerce.tokens.create({
        type: "delegate_payment",
        amount: 49900, // $499/month
        currency: "usd",
        merchant: "dealershipAI",
        metadata: {
          userId,
          plan,
          source: "web_checkout",
        },
      });
    } catch (error) {
      console.error("ACP delegate token creation failed:", error);
      // Continue without ACP if token creation fails (fallback to standard checkout)
    }

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
      acpTokenId: delegateToken?.id,
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

