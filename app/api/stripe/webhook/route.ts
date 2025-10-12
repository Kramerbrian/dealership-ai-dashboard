import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TierManager } from '@/lib/tier-manager';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout session completed:', session.id);

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const priceId = session.line_items?.data[0]?.price?.id;

    if (!customerId || !subscriptionId || !priceId) {
      console.error('Missing required session data');
      return;
    }

    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const email = customer.email;

    if (!email) {
      console.error('No email found for customer');
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error('User not found for email:', email);
      return;
    }

    // Determine tier based on price ID
    const tier = getTierFromPriceId(priceId);
    if (!tier) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Update user tier
    await TierManager.upgradeUser(user.id, tier);

    // Update user with Stripe data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        plan: tier,
        sessionsLimit: TierManager.getSessionLimit(tier)
      }
    });

    console.log(`Successfully upgraded user ${user.id} to ${tier}`);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription created:', subscription.id);

    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    });

    if (!user) {
      console.error('User not found for customer ID:', customerId);
      return;
    }

    const tier = getTierFromPriceId(priceId);
    if (!tier) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        plan: tier,
        sessionsLimit: TierManager.getSessionLimit(tier),
        subscriptionStatus: subscription.status
      }
    });

    console.log(`Updated subscription for user ${user.id}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription updated:', subscription.id);

    const user = await prisma.user.findUnique({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (!user) {
      console.error('User not found for subscription ID:', subscription.id);
      return;
    }

    // Update subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status
      }
    });

    // If subscription is cancelled or past due, downgrade to FREE
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      await TierManager.upgradeUser(user.id, 'FREE');
      console.log(`Downgraded user ${user.id} to FREE due to subscription status: ${subscription.status}`);
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription deleted:', subscription.id);

    const user = await prisma.user.findUnique({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (!user) {
      console.error('User not found for subscription ID:', subscription.id);
      return;
    }

    // Downgrade to FREE
    await TierManager.upgradeUser(user.id, 'FREE');

    // Clear Stripe data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: null,
        subscriptionStatus: 'canceled'
      }
    });

    console.log(`Downgraded user ${user.id} to FREE due to subscription deletion`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment succeeded:', invoice.id);

    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const user = await prisma.user.findUnique({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (!user) {
      console.error('User not found for subscription ID:', subscriptionId);
      return;
    }

    // Update payment status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastPaymentDate: new Date(),
        subscriptionStatus: 'active'
      }
    });

    console.log(`Updated payment status for user ${user.id}`);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment failed:', invoice.id);

    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const user = await prisma.user.findUnique({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (!user) {
      console.error('User not found for subscription ID:', subscriptionId);
      return;
    }

    // Update payment status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due'
      }
    });

    console.log(`Updated payment failure status for user ${user.id}`);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

function getTierFromPriceId(priceId: string): 'FREE' | 'PRO' | 'ENTERPRISE' | null {
  const priceMapping: Record<string, 'FREE' | 'PRO' | 'ENTERPRISE'> = {
    [process.env.STRIPE_PRICE_ID_PRO_MONTHLY!]: 'PRO',
    [process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!]: 'ENTERPRISE'
  };

  return priceMapping[priceId] || null;
}
