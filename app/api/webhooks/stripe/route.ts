import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { handleStripeWebhook } from '@/lib/stripe-billing';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the webhook event
    await handleStripeWebhook(event);

    // Log the event to database
    await logBillingEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function logBillingEvent(event: Stripe.Event) {
  try {
    const tenantId = getTenantIdFromEvent(event);
    
    await supabaseAdmin
      .from('billing_events')
      .insert({
        tenant_id: tenantId,
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data.object,
        processed: true,
      });
  } catch (error) {
    console.error('Failed to log billing event:', error);
  }
}

function getTenantIdFromEvent(event: Stripe.Event): string | null {
  switch (event.type) {
    case 'checkout.session.completed':
      return (event.data.object as Stripe.Checkout.Session).metadata?.tenant_id || null;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return (event.data.object as Stripe.Subscription).metadata?.tenant_id || null;
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        // We'd need to fetch the subscription to get tenant_id
        // For now, return null and handle in the main webhook handler
        return null;
      }
      return null;
    default:
      return null;
  }
}
