import Stripe from "stripe";
import { NextResponse } from "next/server";
import { upsertIntegration } from "@/lib/integrations/store";

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

    const text = await req.text();
    let event: Stripe.Event;

    // In development, allow bypassing signature verification for testing
    if (process.env.NODE_ENV === "development" && (!process.env.STRIPE_SECRET_KEY || sig.includes("test"))) {
      try {
        event = JSON.parse(text) as Stripe.Event;
        console.log("⚠️ Development mode: Bypassing signature verification");
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    } else {
      // Production: require proper Stripe verification
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
      }

      try {
        event = stripe.webhooks.constructEvent(text, sig, webhookSecret);
      } catch (e: any) {
        console.error("Webhook signature verification failed:", e.message);
        return NextResponse.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
      }
    }

    // Handle checkout.session.completed → store plan in tenant metadata
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;
      const plan = session.metadata?.plan || "pro";
      
      if (tenantId) {
        try {
          await upsertIntegration({
            tenantId,
            kind: "billing",
            metadata: { plan, stripe_customer: session.customer, subscription: session.subscription }
          });
          console.log(`✅ Plan stored: ${plan} for tenant ${tenantId}`);
        } catch (error) {
          console.error("Failed to store plan:", error);
          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "object" && error !== null) {
            errorMessage = JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }
          console.error("Error details:", errorMessage);
          return NextResponse.json(
            { 
              error: "Failed to store plan", 
              details: errorMessage,
              hint: "Check Supabase connection and integrations table exists"
            },
            { status: 500 }
          );
        }
      } else {
        console.warn("⚠️ No tenantId in session metadata");
      }
    }
    // Optionally handle invoice.paid, customer.subscription.updated, ... to enforce status

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

