import Stripe from "stripe";
import { NextResponse } from "next/server";
import { upsertIntegration } from "@/lib/integrations/store";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  const text = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  // Handle checkout.session.completed → store plan in tenant metadata
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan || "pro";
    if (tenantId) {
      await upsertIntegration({
        tenantId,
        kind: "billing",
        metadata: { plan, stripe_customer: session.customer, subscription: session.subscription }
      });
    }
  }
  // Optionally handle invoice.paid, customer.subscription.updated, ... to enforce status

  return NextResponse.json({ received: true });
}

