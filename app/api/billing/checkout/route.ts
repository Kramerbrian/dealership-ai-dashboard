import Stripe from "stripe";
import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export const POST = withAuth(async ({ req, tenantId }) => {
  const body = await req.json().catch(()=>null);
  if (!body?.plan) return NextResponse.json({ error: "plan required" }, { status: 400 });

  // Support both old and new env var names
  const price = body.plan === "pro" 
    ? (process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_ID_PRO_MONTHLY)
    : (process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY);
  if (!price) return NextResponse.json({ error: "price not configured" }, { status: 400 });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${new URL(req.url).origin}/drive?billing=success`,
      cancel_url: `${new URL(req.url).origin}/drive?billing=cancel`,
      metadata: { tenantId, plan: body.plan }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});

