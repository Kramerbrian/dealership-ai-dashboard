/**
 * DealershipAI - Stripe Configuration
 * 
 * Server-side Stripe configuration for subscription billing
 */

import Stripe from 'stripe';

// Create Stripe client only if key is available (for local builds)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null;

// Pricing tiers for DealershipAI
export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Level 1',
    price: 0,
    priceId: null,
    features: [
      'AI scan',
      'Evidence report', 
      'Fix list'
    ],
    limits: {
      scans: 1,
      reports: 1,
      dealerships: 1
    }
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Level 2',
    price: 49900, // $499.00 in cents
    priceId: process.env.STRIPE_TIER_2_PRICE_ID || 'price_professional_monthly',
    features: [
      'Bi-weekly checks',
      'Auto-responses',
      'Schema generator',
      'Priority support'
    ],
    limits: {
      scans: 24, // Bi-weekly = 2 per month
      reports: 24,
      dealerships: 1
    }
  },
  ENTERPRISE: {
    id: 'enterprise', 
    name: 'Level 3',
    price: 99900, // $999.00 in cents
    priceId: process.env.STRIPE_TIER_3_PRICE_ID || 'price_enterprise_monthly',
    features: [
      'Enterprise guardrails',
      'Multi-rooftop',
      'SLA & SSO',
      'Dedicated support',
      'Custom integrations'
    ],
    limits: {
      scans: -1, // Unlimited
      reports: -1,
      dealerships: -1
    }
  }
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

/**
 * Create a Stripe customer
 */
export async function createCustomer(email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not initialized');
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'dealershipai_web'
    }
  });
}

/**
 * Create a subscription checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  if (!stripe) throw new Error('Stripe not initialized');
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...metadata,
      source: 'dealershipai_web'
    },
    subscription_data: {
      metadata: {
        ...metadata,
        source: 'dealershipai_web'
      }
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe not initialized');
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not initialized');
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer', 'items.data.price']
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (!stripe) throw new Error('Stripe not initialized');
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
}
