import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export { stripe };

// Pricing tiers
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 99,
    interval: 'month',
    features: [
      '1 Dealership',
      'Basic SEO Analysis',
      'Monthly Reports',
      'Email Support'
    ],
    limits: {
      dealerships: 1,
      api_calls_per_month: 1000,
      users: 2
    }
  },
  professional: {
    name: 'Professional',
    price: 299,
    interval: 'month',
    features: [
      'Up to 5 Dealerships',
      'Full Three-Pillar Analysis',
      'Weekly Reports',
      'AI Visibility Tracking',
      'Priority Support'
    ],
    limits: {
      dealerships: 5,
      api_calls_per_month: 5000,
      users: 10
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: [
      'Unlimited Dealerships',
      'Advanced Analytics',
      'Real-time Monitoring',
      'Custom Integrations',
      'Dedicated Support',
      'White-label Options'
    ],
    limits: {
      dealerships: -1, // Unlimited
      api_calls_per_month: 50000,
      users: -1 // Unlimited
    }
  }
};

export async function createCheckoutSession(
  tenantId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
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
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

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
    throw error;
  }
}

export async function handleWebhook(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
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
    
    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenant_id;
  if (!tenantId) return;

  // Update tenant with subscription info
  const { supabaseAdmin } = await import('./supabase');
  
  await supabaseAdmin
    .from('tenants')
    .update({
      settings: {
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: 'active'
      }
    })
    .eq('id', tenantId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) return;

  const { supabaseAdmin } = await import('./supabase');
  
  await supabaseAdmin
    .from('tenants')
    .update({
      settings: {
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status
      }
    })
    .eq('id', tenantId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) return;

  const { supabaseAdmin } = await import('./supabase');
  
  await supabaseAdmin
    .from('tenants')
    .update({
      settings: {
        subscription_status: 'canceled'
      }
    })
    .eq('id', tenantId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment
  console.log('Payment failed:', invoice.id);
}
