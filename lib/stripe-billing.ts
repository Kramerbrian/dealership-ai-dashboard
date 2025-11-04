import Stripe from 'stripe';
import { userManager, SUBSCRIPTION_PLANS, SubscriptionPlan } from './user-management';

// Initialize Stripe - lazy initialization to avoid build errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeInstance;
}

// Export stripe with lazy initialization
const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  successUrl: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?payment=success',
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/pricing?payment=cancelled',
};

// Stripe product and price IDs (configured via environment variables)
export const STRIPE_PRODUCTS = {
  free: {
    productId: null,
    priceId: null, // Free tier has no Stripe price
  },
  professional: {
    productId: process.env.STRIPE_TIER_2_PRODUCT_ID || 'prod_professional',
    priceId: process.env.STRIPE_TIER_2_PRICE_ID || 'price_professional_monthly',
  },
  enterprise: {
    productId: process.env.STRIPE_TIER_3_PRODUCT_ID || 'prod_enterprise',
    priceId: process.env.STRIPE_TIER_3_PRICE_ID || 'price_enterprise_monthly',
  },
};

// Billing management class
export class BillingManager {
  private static instance: BillingManager;

  static getInstance(): BillingManager {
    if (!BillingManager.instance) {
      BillingManager.instance = new BillingManager();
    }
    return BillingManager.instance;
  }

  // Create Stripe customer
  async createCustomer(userData: {
    id: string;
    email: string;
    name?: string;
  }) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          userId: userData.id,
        },
      });

      return { success: true, customerId: customer.id };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create checkout session
  async createCheckoutSession(userId: string, plan: SubscriptionPlan, customerId?: string) {
    try {
      const planConfig = SUBSCRIPTION_PLANS[plan];
      const stripeProduct = STRIPE_PRODUCTS[plan];

      if (!stripeProduct) {
        throw new Error(`Stripe product not configured for plan: ${plan}`);
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripeProduct.priceId,
            quantity: 1,
          },
        ],
        success_url: `${STRIPE_CONFIG.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata: {
          userId,
          plan,
        },
        subscription_data: {
          metadata: {
            userId,
            plan,
          },
        },
      };

      if (customerId) {
        sessionParams.customer = customerId;
      } else {
        sessionParams.customer_email = 'customer@example.com'; // Will be updated with real email
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return { success: true, sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create billing portal session
  async createBillingPortalSession(customerId: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
      });

      return { success: true, url: session.url };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session.subscription) {
        throw new Error('No subscription found in session');
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as SubscriptionPlan;

      if (!userId || !plan) {
        throw new Error('Missing user ID or plan in session metadata');
      }

      // Update user subscription in database
      const result = await userManager.upgradeSubscription(
        userId,
        plan,
        subscription.id
      );

      if (!result.success) {
        throw new Error('Failed to update user subscription');
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error handling successful payment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Handle checkout session completed
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan;

    if (!userId || !plan) {
      console.error('Missing user ID or plan in checkout session');
      return;
    }

    await userManager.upgradeSubscription(userId, plan, session.subscription as string);
  }

  // Handle subscription updated
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan as SubscriptionPlan;

    if (!userId || !plan) {
      console.error('Missing user ID or plan in subscription');
      return;
    }

    // Update subscription status in database
    // This would require updating the user-management.ts to handle status updates
    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  }

  // Handle subscription deleted
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('Missing user ID in subscription');
      return;
    }

    await userManager.cancelSubscription(userId);
  }

  // Handle payment failed
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    
    if (!subscriptionId) {
      console.error('No subscription ID in failed invoice');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('Missing user ID in subscription');
      return;
    }

    // Handle payment failure - could send email, update status, etc.
    console.log(`Payment failed for user ${userId}`);
  }

  // Get subscription details
  async getSubscriptionDetails(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      let subscription: Stripe.Subscription;

      if (immediately) {
        subscription = await stripe.subscriptions.cancel(subscriptionId);
      } else {
        subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get customer details
  async getCustomerDetails(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return { success: true, customer };
    } catch (error) {
      console.error('Error getting customer details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create usage record (for usage-based billing)
  async createUsageRecord(subscriptionItemId: string, quantity: number) {
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
        }
      );

      return { success: true, usageRecord };
    } catch (error) {
      console.error('Error creating usage record:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const billingManager = BillingManager.getInstance();

// Helper functions
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function getPlanStripePriceId(plan: SubscriptionPlan): string {
  return STRIPE_PRODUCTS[plan]?.priceId || '';
}

export function getPlanStripeProductId(plan: SubscriptionPlan): string {
  return STRIPE_PRODUCTS[plan]?.productId || '';
}