/**
 * DealershipAI Enterprise Stripe Billing Integration
 * Handles $499/$999 subscription tiers and enterprise billing
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const STRIPE_CONFIG = {
  // Product IDs (set these in Stripe Dashboard)
  TIER_2_PRICE_ID: process.env.STRIPE_TIER_2_PRICE_ID!, // $499/mo Intelligence
  TIER_3_PRICE_ID: process.env.STRIPE_TIER_3_PRICE_ID!, // $999/mo Boss Mode
  TIER_4_PRICE_ID: process.env.STRIPE_TIER_4_PRICE_ID,  // Enterprise (custom pricing)
  
  // Webhook secrets
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Billing periods
  BILLING_INTERVALS: {
    monthly: 'month',
    yearly: 'year',
  },
} as const;

export interface SubscriptionTier {
  id: number;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  maxDealerships: number;
  maxUsers: number;
  apiCallsPerMonth: number;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 1,
    name: 'Test Drive',
    price: 0,
    priceId: '', // Free tier
    features: [
      'Basic AI Visibility Score',
      '1 Dealership',
      '2 Users',
      '30-day Analytics Retention',
      '1,000 API Calls/Month',
    ],
    maxDealerships: 1,
    maxUsers: 2,
    apiCallsPerMonth: 1000,
  },
  {
    id: 2,
    name: 'Intelligence',
    price: 499,
    priceId: STRIPE_CONFIG.TIER_2_PRICE_ID,
    features: [
      'AI Visibility Score',
      'AOER Analytics',
      'Competitor Analysis',
      '5 Dealerships',
      '10 Users',
      '90-day Analytics Retention',
      '10,000 API Calls/Month',
      'Email Support',
    ],
    maxDealerships: 5,
    maxUsers: 10,
    apiCallsPerMonth: 10000,
  },
  {
    id: 3,
    name: 'Boss Mode',
    price: 999,
    priceId: STRIPE_CONFIG.TIER_3_PRICE_ID,
    features: [
      'Everything in Intelligence',
      'Algorithmic Visibility Index',
      'Predictive Analytics',
      '25 Dealerships',
      '50 Users',
      '365-day Analytics Retention',
      '50,000 API Calls/Month',
      'Priority Support',
      'API Access',
    ],
    maxDealerships: 25,
    maxUsers: 50,
    apiCallsPerMonth: 50000,
  },
  {
    id: 4,
    name: 'Enterprise',
    price: 0, // Custom pricing
    priceId: STRIPE_CONFIG.TIER_4_PRICE_ID || '',
    features: [
      'Everything in Boss Mode',
      'Custom Integrations',
      'Dedicated Support',
      'SSO/SAML',
      'White Label',
      'Custom Reporting',
      'Up to 350 Dealerships',
      'Unlimited Users',
      'Unlimited API Calls',
    ],
    maxDealerships: 350,
    maxUsers: 1000,
    apiCallsPerMonth: -1, // Unlimited
  },
];

/**
 * Create Stripe customer for tenant
 */
export async function createStripeCustomer(tenantData: {
  name: string;
  email: string;
  tenantId: string;
}) {
  const customer = await stripe.customers.create({
    name: tenantData.name,
    email: tenantData.email,
    metadata: {
      tenant_id: tenantData.tenantId,
    },
  });
  
  return customer;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession({
  tenantId,
  priceId,
  successUrl,
  cancelUrl,
  customerId,
}: {
  tenantId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}) {
  const session = await stripe.checkout.sessions.create({
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
      tenant_id: tenantId,
    },
    subscription_data: {
      metadata: {
        tenant_id: tenantId,
      },
    },
  });
  
  return session;
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  });
  
  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier({
  subscriptionId,
  newPriceId,
  prorationBehavior = 'create_prorations',
}: {
  subscriptionId: string;
  newPriceId: string;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
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
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenant_id;
  if (!tenantId) return;
  
  // Update tenant with subscription info
  // TODO: Update database with subscription details
  console.log('Checkout completed for tenant:', tenantId);
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) return;
  
  // Determine tier based on price ID
  const tier = getTierFromPriceId(subscription.items.data[0].price.id);
  
  // Update tenant subscription status
  // TODO: Update database
  console.log('Subscription created:', { tenantId, tier, subscriptionId: subscription.id });
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) return;
  
  // Update tenant subscription status
  // TODO: Update database
  console.log('Subscription updated:', { tenantId, status: subscription.status });
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) return;
  
  // Downgrade tenant to free tier
  // TODO: Update database
  console.log('Subscription deleted:', { tenantId });
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;
  
  // Update tenant billing status
  // TODO: Update database
  console.log('Payment succeeded for subscription:', subscriptionId);
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;
  
  // Handle failed payment
  // TODO: Update database, send notifications
  console.log('Payment failed for subscription:', subscriptionId);
}

/**
 * Get tier from Stripe price ID
 */
function getTierFromPriceId(priceId: string): number {
  if (priceId === STRIPE_CONFIG.TIER_2_PRICE_ID) return 2;
  if (priceId === STRIPE_CONFIG.TIER_3_PRICE_ID) return 3;
  if (priceId === STRIPE_CONFIG.TIER_4_PRICE_ID) return 4;
  return 1; // Default to free tier
}

/**
 * Get subscription tier by ID
 */
export function getSubscriptionTier(tierId: number): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
}

/**
 * Calculate usage-based billing
 */
export function calculateUsageBilling(
  tier: SubscriptionTier,
  actualUsage: {
    apiCalls: number;
    dealerships: number;
    users: number;
  }
) {
  const overages = {
    apiCalls: Math.max(0, actualUsage.apiCalls - tier.apiCallsPerMonth),
    dealerships: Math.max(0, actualUsage.dealerships - tier.maxDealerships),
    users: Math.max(0, actualUsage.users - tier.maxUsers),
  };
  
  const overageCharges = {
    apiCalls: overages.apiCalls * 0.01, // $0.01 per API call overage
    dealerships: overages.dealerships * 50, // $50 per dealership overage
    users: overages.users * 5, // $5 per user overage
  };
  
  return {
    basePrice: tier.price,
    overages,
    overageCharges,
    totalCharges: Object.values(overageCharges).reduce((sum, charge) => sum + charge, 0),
  };
}
