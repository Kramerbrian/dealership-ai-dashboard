/**
 * DealershipAI v2.0 - Stripe Integration
 * 
 * Handles Stripe checkout and subscription management
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  features: string[];
  sessions: number;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceId: '',
    features: [
      'Basic AI visibility score',
      'View 3 competitors',
      'Monthly reports'
    ],
    sessions: 0,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$499',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
    features: [
      'Everything in Free',
      '50 sessions/month',
      'E-E-A-T scoring',
      'Unlimited competitors',
      'API access'
    ],
    sessions: 50,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$999',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
    features: [
      'Everything in Pro',
      '200 sessions/month',
      'Mystery Shop automation',
      'Multi-location',
      '24/7 support'
    ],
    sessions: 200,
  },
];

export interface CheckoutSession {
  id: string;
  url: string;
}

export class StripeService {
  /**
   * Create checkout session for plan upgrade
   */
  static async createCheckoutSession(
    priceId: string,
    userId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutSession | null> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: successUrl || `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: cancelUrl || `${window.location.origin}/dashboard?upgrade=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { session } = await response.json();
      return session;
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      return null;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  static async redirectToCheckout(
    priceId: string,
    userId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<boolean> {
    try {
      const session = await this.createCheckoutSession(priceId, userId, successUrl, cancelUrl);
      
      if (!session) {
        return false;
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Stripe checkout redirect failed:', error);
      return false;
    }
  }

  /**
   * Create customer portal session
   */
  static async createCustomerPortalSession(
    userId: string,
    returnUrl?: string
  ): Promise<string | null> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl: returnUrl || `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Stripe portal session creation failed:', error);
      return null;
    }
  }

  /**
   * Redirect to customer portal
   */
  static async redirectToPortal(userId: string, returnUrl?: string): Promise<boolean> {
    try {
      const portalUrl = await this.createCustomerPortalSession(userId, returnUrl);
      
      if (!portalUrl) {
        return false;
      }

      window.location.href = portalUrl;
      return true;
    } catch (error) {
      console.error('Stripe portal redirect failed:', error);
      return false;
    }
  }

  /**
   * Get subscription status
   */
  static async getSubscriptionStatus(userId: string): Promise<{
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    plan: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null> {
    try {
      const response = await fetch(`/api/stripe/subscription-status?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }
}

// Export convenience functions
export const createCheckoutSession = (priceId: string, userId: string, successUrl?: string, cancelUrl?: string) =>
  StripeService.createCheckoutSession(priceId, userId, successUrl, cancelUrl);

export const redirectToCheckout = (priceId: string, userId: string, successUrl?: string, cancelUrl?: string) =>
  StripeService.redirectToCheckout(priceId, userId, successUrl, cancelUrl);

export const redirectToPortal = (userId: string, returnUrl?: string) =>
  StripeService.redirectToPortal(userId, returnUrl);

export const getSubscriptionStatus = (userId: string) =>
  StripeService.getSubscriptionStatus(userId);

export const cancelSubscription = (userId: string) =>
  StripeService.cancelSubscription(userId);