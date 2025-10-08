import Stripe from 'stripe'

// Initialize Stripe with proper error handling
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export const plans = {
  test_drive: {
    name: 'Test Drive',
    price: 0,
    features: ['Basic AI visibility', '1 location', 'Weekly email reports'],
    stripePriceId: null,
    limits: {
      locations: 1,
      users: 2,
      apiCalls: 1000,
    },
  },
  tier_1: {
    name: 'Intelligence',
    price: 499,
    features: [
      'Full AI tracking & analytics',
      'Multi-platform review management',
      'Actionable optimization playbook',
      'Dedicated support',
      '1 location',
    ],
    stripePriceId: process.env.STRIPE_TIER_1_PRICE_ID,
    limits: {
      locations: 1,
      users: 5,
      apiCalls: 10000,
    },
  },
  tier_2: {
    name: 'Boss Mode',
    price: 999,
    features: [
      'Everything in Intelligence',
      'AI agent automation',
      'Competitor intelligence',
      'Advanced reporting & forecasting',
      'White-glove onboarding',
      'Up to 3 locations',
    ],
    stripePriceId: process.env.STRIPE_TIER_2_PRICE_ID,
    limits: {
      locations: 3,
      users: 10,
      apiCalls: 50000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    features: [
      'Up to 350 rooftops',
      'Consolidated billing',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantees',
    ],
    stripePriceId: null,
    limits: {
      locations: 350,
      users: -1, // unlimited
      apiCalls: -1, // unlimited
    },
  },
}

export interface BillingInfo {
  subscriptionId?: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  plan: string
  amount: number
}

export interface UsageInfo {
  apiCalls: number
  locations: number
  users: number
  periodStart: Date
  periodEnd: Date
}

/**
 * Create a Stripe checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  tenantId: string,
  plan: string,
  customerEmail?: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const planConfig = plans[plan as keyof typeof plans]
  
  if (!planConfig.stripePriceId) {
    throw new Error(`Plan "${plan}" is not available for checkout. Please contact sales for enterprise plans.`)
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=false`,
      metadata: {
        tenant_id: tenantId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          tenant_id: tenantId,
          plan: plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session. Please try again.')
  }
}

/**
 * Create a customer portal session for billing management
 */
export async function createCustomerPortalSession(
  tenantId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured.')
  }

  try {
    // First, find the customer by tenant_id
    const customers = await stripe.customers.list({
      limit: 100,
    })

    const customer = customers.data.find(c => 
      c.metadata?.tenant_id === tenantId
    )

    if (!customer) {
      throw new Error('Customer not found. Please contact support.')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw new Error('Failed to create customer portal session.')
  }
}

/**
 * Get billing information for a tenant
 */
export async function getBillingInfo(tenantId: string): Promise<BillingInfo | null> {
  if (!stripe) {
    return null
  }

  try {
    // Find customer by tenant_id
    const customers = await stripe.customers.list({
      limit: 100,
    })

    const customer = customers.data.find(c => 
      c.metadata?.tenant_id === tenantId
    )

    if (!customer) {
      return null
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return {
        status: 'canceled',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        plan: 'test_drive',
        amount: 0,
      }
    }

    const subscription = subscriptions.data[0]
    const price = subscription.items.data[0]?.price

    return {
      subscriptionId: subscription.id,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      plan: subscription.metadata?.plan || 'unknown',
      amount: price ? (price.unit_amount || 0) / 100 : 0,
    }
  } catch (error) {
    console.error('Error getting billing info:', error)
    return null
  }
}

/**
 * Cancel a subscription at the end of the billing period
 */
export async function cancelSubscription(tenantId: string): Promise<boolean> {
  if (!stripe) {
    throw new Error('Stripe is not configured.')
  }

  try {
    const billingInfo = await getBillingInfo(tenantId)
    
    if (!billingInfo?.subscriptionId) {
      throw new Error('No active subscription found.')
    }

    await stripe.subscriptions.update(billingInfo.subscriptionId, {
      cancel_at_period_end: true,
    })

    return true
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription.')
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(tenantId: string): Promise<boolean> {
  if (!stripe) {
    throw new Error('Stripe is not configured.')
  }

  try {
    const billingInfo = await getBillingInfo(tenantId)
    
    if (!billingInfo?.subscriptionId) {
      throw new Error('No subscription found.')
    }

    await stripe.subscriptions.update(billingInfo.subscriptionId, {
      cancel_at_period_end: false,
    })

    return true
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw new Error('Failed to reactivate subscription.')
  }
}

/**
 * Get billing history for a tenant
 */
export async function getBillingHistory(
  tenantId: string,
  options: { limit: number; offset: number }
): Promise<Stripe.Invoice[]> {
  if (!stripe) {
    return []
  }

  try {
    // Find customer by tenant_id
    const customers = await stripe.customers.list({
      limit: 100,
    })

    const customer = customers.data.find(c => 
      c.metadata?.tenant_id === tenantId
    )

    if (!customer) {
      return []
    }

    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: options.limit,
      starting_after: options.offset > 0 ? undefined : undefined, // Simplified for demo
    })

    return invoices.data
  } catch (error) {
    console.error('Error getting billing history:', error)
    return []
  }
}

/**
 * Get usage information for a tenant
 */
export async function getUsageInfo(tenantId: string): Promise<UsageInfo> {
  // This would typically query your database for actual usage
  // For now, return mock data
  return {
    apiCalls: 1250,
    locations: 1,
    users: 3,
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    periodEnd: new Date(),
  }
}

/**
 * Check if a tenant has exceeded their plan limits
 */
export async function checkPlanLimits(tenantId: string, plan: string): Promise<{
  exceeded: boolean
  limits: any
  usage: UsageInfo
}> {
  const planConfig = plans[plan as keyof typeof plans]
  const usage = await getUsageInfo(tenantId)

  const exceeded = {
    apiCalls: planConfig.limits.apiCalls !== -1 && usage.apiCalls > planConfig.limits.apiCalls,
    locations: planConfig.limits.locations !== -1 && usage.locations > planConfig.limits.locations,
    users: planConfig.limits.users !== -1 && usage.users > planConfig.limits.users,
  }

  return {
    exceeded: Object.values(exceeded).some(Boolean),
    limits: planConfig.limits,
    usage,
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; eventType?: string }> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook not configured.')
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log(`Received Stripe webhook: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true, eventType: event.type }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid signature')
  }
}

// Webhook handlers
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenant_id
  const plan = session.metadata?.plan

  if (!tenantId || !plan) {
    console.error('Missing tenant_id or plan in session metadata')
    return
  }

  console.log(`Checkout completed for tenant ${tenantId}, plan ${plan}`)
  // Update tenant subscription in database
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id

  if (!tenantId) {
    console.error('Missing tenant_id in subscription metadata')
    return
  }

  console.log(`Subscription created for tenant ${tenantId}`)
  // Update tenant subscription status in database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id

  if (!tenantId) {
    console.error('Missing tenant_id in subscription metadata')
    return
  }

  console.log(`Subscription updated for tenant ${tenantId}`)
  // Update tenant subscription status in database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id

  if (!tenantId) {
    console.error('Missing tenant_id in subscription metadata')
    return
  }

  console.log(`Subscription deleted for tenant ${tenantId}`)
  // Update tenant subscription status in database
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenant_id

  if (!tenantId) {
    console.error('Missing tenant_id in invoice metadata')
    return
  }

  console.log(`Payment succeeded for tenant ${tenantId}`)
  // Update tenant payment status in database
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenant_id

  if (!tenantId) {
    console.error('Missing tenant_id in invoice metadata')
    return
  }

  console.log(`Payment failed for tenant ${tenantId}`)
  // Update tenant payment status in database
}