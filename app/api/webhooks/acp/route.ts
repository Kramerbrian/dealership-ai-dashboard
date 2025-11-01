import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/acp
 *
 * Handles Agentic Commerce Protocol (ACP) webhooks from OpenAI/Stripe
 *
 * Events:
 * - agentic.order.created: Order initiated by agent
 * - agentic.order.completed: Payment successful
 * - agentic.order.canceled: User or agent canceled
 * - agentic.order.refunded: Order refunded
 *
 * Flow: ACP → This Webhook → Supabase → Pulse feed
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const headersList = await headers();
    const signature = headersList.get('x-acp-signature');
    const timestamp = headersList.get('x-acp-timestamp');

    if (!signature || !timestamp) {
      console.error('Missing ACP webhook headers');
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = await req.json();
    const { event, data } = payload;

    console.log('ACP webhook received:', {
      event,
      orderId: data?.orderId,
      userId: data?.metadata?.userId,
    });

    // Verify webhook signature
    const isValid = await verifyACPSignature(
      JSON.stringify(payload),
      signature,
      timestamp
    );

    if (!isValid) {
      console.error('Invalid ACP webhook signature');
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Handle different ACP events
    switch (event) {
      case 'agentic.order.created':
        await handleOrderCreated(data);
        break;

      case 'agentic.order.completed':
        await handleOrderCompleted(data);
        break;

      case 'agentic.order.canceled':
        await handleOrderCanceled(data);
        break;

      case 'agentic.order.refunded':
        await handleOrderRefunded(data);
        break;

      default:
        console.warn('Unknown ACP event:', event);
    }

    return NextResponse.json({ received: true, event });

  } catch (error) {
    console.error('ACP webhook processing error:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle agentic.order.created event
 */
async function handleOrderCreated(data: any) {
  const { orderId, amount, currency, metadata } = data;
  const { userId, plan, domain } = metadata || {};

  console.log('Order created:', { orderId, userId, plan, amount });

  // Insert order record into Supabase
  const { error } = await supabase
    .from('orders')
    .insert({
      order_id: orderId,
      user_id: userId,
      plan,
      domain,
      amount,
      currency,
      status: 'pending',
      source: 'agentic',
      metadata: data,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to insert order:', error);
    throw error;
  }

  // Track PLG metric
  await trackPLGMetric('order_created', {
    userId,
    plan,
    source: 'agentic',
    amount,
  });
}

/**
 * Handle agentic.order.completed event
 */
async function handleOrderCompleted(data: any) {
  const { orderId, customerId, subscriptionId, metadata } = data;
  const { userId, plan } = metadata || {};

  console.log('Order completed:', { orderId, userId, plan });

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'completed',
      customer_id: customerId,
      subscription_id: subscriptionId,
      completed_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (orderError) {
    console.error('Failed to update order:', orderError);
  }

  // Activate Pro tier via Supabase function
  const { error: syncError } = await supabase.rpc('sync_account_status', {
    event: {
      userId,
      plan,
      status: 'active',
      subscriptionId,
    },
  });

  if (syncError) {
    console.error('Failed to sync account status:', syncError);
  }

  // Update Pulse feed
  await updatePulseFeed(userId, {
    type: 'conversion',
    source: 'agentic',
    plan,
    amount: data.amount,
  });

  // Track PLG metric
  await trackPLGMetric('order_completed', {
    userId,
    plan,
    source: 'agentic',
    amount: data.amount,
  });
}

/**
 * Handle agentic.order.canceled event
 */
async function handleOrderCanceled(data: any) {
  const { orderId, metadata } = data;
  const { userId } = metadata || {};

  console.log('Order canceled:', { orderId, userId });

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) {
    console.error('Failed to update canceled order:', error);
  }

  // Track PLG metric
  await trackPLGMetric('order_canceled', {
    userId,
    source: 'agentic',
  });
}

/**
 * Handle agentic.order.refunded event
 */
async function handleOrderRefunded(data: any) {
  const { orderId, refundAmount, metadata } = data;
  const { userId, plan } = metadata || {};

  console.log('Order refunded:', { orderId, userId, refundAmount });

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refund_amount: refundAmount,
      refunded_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (orderError) {
    console.error('Failed to update refunded order:', orderError);
  }

  // Downgrade user account
  const { error: syncError } = await supabase.rpc('sync_account_status', {
    event: {
      userId,
      plan: 'free',
      status: 'canceled',
    },
  });

  if (syncError) {
    console.error('Failed to sync account status after refund:', syncError);
  }

  // Track PLG metric
  await trackPLGMetric('order_refunded', {
    userId,
    plan,
    source: 'agentic',
    refundAmount,
  });
}

/**
 * Verify ACP webhook signature
 */
async function verifyACPSignature(
  payload: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  try {
    // Verify timestamp is recent (within 5 minutes)
    const receivedTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (Math.abs(currentTime - receivedTime) > 300) {
      console.error('Webhook timestamp too old');
      return false;
    }

    // Verify HMAC signature
    const webhookSecret = process.env.ACP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('ACP_WEBHOOK_SECRET not configured');
      return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const expectedSig = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSig;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Update Pulse feed with event
 */
async function updatePulseFeed(userId: string, event: any) {
  try {
    const { error } = await supabase
      .from('pulse_events')
      .insert({
        user_id: userId,
        event_type: event.type,
        event_data: event,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to update pulse feed:', error);
    }
  } catch (error) {
    console.error('Pulse feed update error:', error);
  }
}

/**
 * Track PLG metrics
 */
async function trackPLGMetric(metric: string, data: any) {
  try {
    const { error } = await supabase
      .from('plg_metrics')
      .insert({
        metric_name: metric,
        metric_data: data,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to track PLG metric:', error);
    }
  } catch (error) {
    console.error('PLG metric tracking error:', error);
  }
}
