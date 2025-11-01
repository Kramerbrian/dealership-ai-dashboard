import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { billingManager } from '@/lib/stripe-billing';
import { trackSubscriptionUpdate } from '@/lib/pulse-feed';

// Initialize Supabase client for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Phase 4 (Retain): Handle subscription updates for Pulse feed
 * Adjusts in-app entitlements based on subscription changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.warn('Subscription updated without userId in metadata');
      return;
    }

    // Update subscription in database
    await billingManager.handleWebhookEvent({
      type: 'customer.subscription.updated',
      data: { object: subscription },
    } as Stripe.Event);

    // Send to Pulse feed for retention monitoring
    if (process.env.PULSE_FEED_URL) {
      try {
        await fetch(`${process.env.PULSE_FEED_URL}/subscription-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscriptionId: subscription.id,
            status: subscription.status,
            plan: subscription.metadata?.plan,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }),
        });
      } catch (pulseError) {
        console.error('Error sending to Pulse feed:', pulseError);
      }
    }

    console.log(`✅ Subscription updated synced to Pulse: ${subscription.id} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Phase 4 (Retain): Handle subscription updates for Pulse feed
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      
      // Send to Pulse feed for retention monitoring
      const userId = subscription.metadata?.userId;
      if (userId) {
        await trackSubscriptionUpdate({
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
          plan: subscription.metadata?.plan || 'professional',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      }
    }

    // Phase 3 (Buy): Handle checkout session completed - Activate Pro tier
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;

      // Check if this is an ACP-enabled session
      const acpTokenId = session.metadata?.acp_token;
      if (acpTokenId) {
        console.log(`✅ ACP-enabled checkout completed: ${session.id} with token ${acpTokenId}`);
      }

      // Sync account status to Supabase
      if (userId) {
        try {
          await supabase.rpc('sync_account_status', {
            event: {
              userId,
              email: session.customer_email,
              plan: session.metadata?.plan || 'PRO',
              status: 'active',
              subscriptionId: session.subscription,
              customerId: session.customer,
              source: 'stripe'
            }
          });

          // Track conversion event
          await supabase.rpc('track_plg_event', {
            p_user_id: userId,
            p_event_type: 'conversion.completed',
            p_source: 'stripe',
            p_event_data: {
              sessionId: session.id,
              plan: session.metadata?.plan || 'PRO',
              amount: session.amount_total,
              acpToken: acpTokenId
            }
          });

          // Create order record
          await supabase.from('orders').insert({
            user_id: userId,
            order_id: session.id,
            sku: session.metadata?.plan || 'PRO',
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            source: acpTokenId ? 'agentic' : 'stripe',
            acp_token: acpTokenId,
            customer_id: session.customer as string,
            subscription_id: session.subscription as string,
            status: 'completed',
            metadata: session.metadata,
            completed_at: new Date().toISOString()
          });

          console.log(`✅ Account synced to Supabase for user: ${userId}`);
        } catch (supabaseError) {
          console.error('Error syncing to Supabase:', supabaseError);
          // Continue processing even if Supabase sync fails
        }
      }

      await billingManager.handleWebhookEvent(event);
    }
    // Phase 3: Handle subscription creation
    else if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        try {
          await supabase.rpc('track_plg_event', {
            p_user_id: userId,
            p_event_type: 'trial.started',
            p_source: 'stripe',
            p_event_data: {
              subscriptionId: subscription.id,
              plan: subscription.metadata?.plan || 'PRO',
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
            }
          });
        } catch (error) {
          console.error('Error tracking trial start:', error);
        }
      }

      const result = await billingManager.handleWebhookEvent(event);
      if (!result.success) {
        console.error('Error handling webhook event:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    // Phase 4: Handle subscription deletion (churn)
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        try {
          // Downgrade to free tier
          await supabase.rpc('sync_account_status', {
            event: {
              userId,
              plan: 'FREE',
              status: 'canceled',
              source: 'stripe'
            }
          });

          // Track churn event
          await supabase.rpc('track_plg_event', {
            p_user_id: userId,
            p_event_type: 'subscription.canceled',
            p_source: 'stripe',
            p_event_data: {
              subscriptionId: subscription.id,
              canceledAt: new Date().toISOString(),
              cancelReason: subscription.cancellation_details?.reason || 'unknown'
            }
          });
        } catch (error) {
          console.error('Error tracking subscription cancelation:', error);
        }
      }

      const result = await billingManager.handleWebhookEvent(event);
      if (!result.success) {
        console.error('Error handling webhook event:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    else {
      // Handle other Stripe events via billing manager
      const result = await billingManager.handleWebhookEvent(event);
      if (!result.success) {
        console.error('Error handling webhook event:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
