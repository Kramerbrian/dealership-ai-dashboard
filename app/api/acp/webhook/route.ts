import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

/**
 * POST /api/acp/webhook
 * 
 * Handles ACP (Agentic Commerce Protocol) webhook events from Stripe.
 * 
 * Phase 3 (Buy): agentic.order.completed → Sync order to Supabase orders table
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_ACP_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("ACP Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle ACP-specific events
    switch (event.type) {
      case "agentic.order.completed":
        await handleACPOrderCompleted(event.data.object as Stripe.AgenticCommerce.Order);
        break;

      case "agentic.order.cancelled":
        await handleACPOrderCancelled(event.data.object as Stripe.AgenticCommerce.Order);
        break;

      case "agentic.token.created":
        await handleACPTokenCreated(event.data.object as Stripe.AgenticCommerce.Token);
        break;

      default:
        console.log(`Unhandled ACP event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("ACP webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle ACP order completed event
 * Syncs order data to Supabase/Prisma orders table
 */
async function handleACPOrderCompleted(order: Stripe.AgenticCommerce.Order) {
  try {
    const userId = order.metadata?.userId;
    const plan = order.metadata?.plan || "professional";

    if (!userId) {
      console.warn("ACP order completed without userId in metadata");
      return;
    }

    // Sync order to database
    try {
      // Find user by userId (could be Clerk ID or email)
      const user = await prisma.user.findFirst({
        where: { 
          OR: [
            { id: userId },
            { email: userId }, // Fallback if userId is email
            { metadata: { contains: userId } }, // Fallback if userId is Clerk ID in metadata
          ],
        },
      });

      if (user) {
        // Create Order record
        await prisma.order.create({
          data: {
            userId: user.id,
            stripeOrderId: order.id,
            acpTokenId: order.metadata?.acp_token || null,
            plan: plan.toUpperCase(),
            amount: order.amount || 0,
            currency: order.currency || "usd",
            status: "completed",
            metadata: JSON.stringify(order.metadata || {}),
          },
        });

        // Update subscription
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            plan: plan.toUpperCase(),
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            stripeCustomerId: order.customer as string,
            stripeSubscriptionId: order.subscription as string,
          },
          update: {
            plan: plan.toUpperCase(),
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            stripeCustomerId: order.customer as string,
            stripeSubscriptionId: order.subscription as string,
          },
        });

        console.log(`✅ ACP order synced: ${order.id} for user ${userId}`);
      } else {
        console.warn(`User not found for userId: ${userId}`);
      }
    } catch (dbError) {
      console.error("Error syncing ACP order to database:", dbError);
    }

    // Optionally send to Supabase for additional tracking
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        await supabase.from("orders").upsert({
          id: order.id,
          user_id: userId,
          plan,
          amount: order.amount || 0,
          currency: order.currency || "usd",
          status: "completed",
          stripe_order_id: order.id,
          acp_token_id: order.metadata?.acp_token || null,
          metadata: order.metadata || {},
          created_at: new Date().toISOString(),
        }, {
          onConflict: "stripe_order_id",
        });

        console.log(`✅ ACP order synced to Supabase: ${order.id}`);
      } catch (supabaseError) {
        console.error("Error syncing ACP order to Supabase:", supabaseError);
      }
    }

  } catch (error) {
    console.error("Error handling ACP order completed:", error);
    throw error;
  }
}

/**
 * Handle ACP order cancelled event
 */
async function handleACPOrderCancelled(order: Stripe.AgenticCommerce.Order) {
  try {
    const userId = order.metadata?.userId;

    if (userId) {
      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          status: "CANCELLED",
        },
      });

      console.log(`✅ ACP order cancelled: ${order.id} for user ${userId}`);
    }
  } catch (error) {
    console.error("Error handling ACP order cancelled:", error);
  }
}

/**
 * Handle ACP token created event
 * Useful for tracking delegate token creation
 */
async function handleACPTokenCreated(token: Stripe.AgenticCommerce.Token) {
  try {
    console.log(`✅ ACP token created: ${token.id}`, {
      type: token.type,
      merchant: token.merchant,
      userId: token.metadata?.userId,
    });
    // Can be used for analytics or logging
  } catch (error) {
    console.error("Error handling ACP token created:", error);
  }
}

