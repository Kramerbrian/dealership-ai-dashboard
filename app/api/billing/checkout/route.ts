import Stripe from "stripe";
import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export const POST = withAuth(async ({ req, tenantId }) => {
  const body = await req.json().catch(()=>null);
  if (!body?.plan) return NextResponse.json({ error: "plan required" }, { status: 400 });

  const price = body.plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_ENTERPRISE;
  if (!price) return NextResponse.json({ error: "price not configured" }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${new URL(req.url).origin}/drive?billing=success`,
    cancel_url: `${new URL(req.url).origin}/drive?billing=cancel`,
    metadata: { tenantId, plan: body.plan }
  });

  return NextResponse.json({ url: session.url });
});

