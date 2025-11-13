/**
 * Stripe Configuration and Pricing
 * Centralized Stripe setup for DealershipAI v2.0
 */

import Stripe from 'stripe';

// Initialize Stripe with fallback for build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const stripePublishableKey = publishableKey;

// Pricing configuration - DealershipAI Original Model
export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Level 1',
    price: 0,
    priceId: null,
    sessionsLimit: 1, // 1 AI scan
    features: ['ai_scan', 'evidence_report', 'fix_list'],
    description: 'Basic AI visibility score and evidence report'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Level 2',
    price: 499,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_dummy_professional',
    sessionsLimit: 24, // Bi-weekly checks = 24 per month
    features: ['bi_weekly_checks', 'auto_responses', 'schema_generator', 'priority_support', 'chatgpt_analysis', 'reviews_hub', 'market_scans', 'roi_calculator'],
    description: 'Bi-weekly AI monitoring with advanced analytics and automation'
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Level 3',
    price: 999,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_dummy_enterprise',
    sessionsLimit: -1, // Unlimited
    features: ['unlimited_scans', 'mystery_shop_automation', 'predictive_analytics', 'daily_monitoring', 'real_time_alerts', 'competitor_battle_plans', 'enterprise_guardrails', 'multi_rooftop', 'sla_sso', 'dedicated_support'],
    description: 'Unlimited AI monitoring with enterprise features and automation'
  }
};

// Stripe checkout configuration
export const CHECKOUT_CONFIG = {
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?upgrade=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?upgrade=cancelled`,
  billingPortalReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
};

// Webhook configuration
export const WEBHOOK_CONFIG = {
  endpointSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_webhook_secret',
  events: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed'
  ]
};

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  metadata?: Record<string, string>
) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: CHECKOUT_CONFIG.successUrl,
      cancel_url: CHECKOUT_CONFIG.cancelUrl,
      customer: customerId,
      metadata: metadata || {},
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: metadata || {},
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create Stripe customer portal session
 */
export async function createPortalSession(customerId: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: CHECKOUT_CONFIG.billingPortalReturnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Failed to create portal session');
  }
}

/**
 * Get customer subscription
 */
export async function getCustomerSubscription(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    console.error('Error getting customer subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

/**
 * Get plan by price ID
 */
export function getPlanByPriceId(priceId: string) {
  for (const [key, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return { tier: key as keyof typeof PRICING_PLANS, plan };
    }
  }
  return null;
}

/**
 * Get plan by tier
 */
export function getPlanByTier(tier: string) {
  return PRICING_PLANS[tier as keyof typeof PRICING_PLANS] || PRICING_PLANS.FREE;
}
