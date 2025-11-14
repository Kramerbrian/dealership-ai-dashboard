import Stripe from 'stripe';
import { logger } from '@/lib/utils/logger';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    dealers: number;
    reports: number;
    apiCalls: number;
    support: 'email' | 'phone' | 'priority';
  };
  stripePriceId: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface BillingInfo {
  subscription: Subscription;
  nextInvoice: {
    amount: number;
    date: Date;
    status: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
  };
}

export class SubscriptionService {
  private stripe!: Stripe;
  private isInitialized: boolean = false;

  // Subscription tiers configuration
  public readonly TIERS: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Starter',
      description: 'Perfect for small dealerships getting started',
      price: 0,
      interval: 'month',
      features: [
        'Up to 2 dealers',
        'Basic AI visibility tracking',
        'Monthly reports',
        'Email support',
        'Standard dashboard'
      ],
      limits: {
        dealers: 2,
        reports: 1,
        apiCalls: 1000,
        support: 'email'
      },
      stripePriceId: ''
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Ideal for growing dealerships',
      price: 499,
      interval: 'month',
      features: [
        'Up to 10 dealers',
        'Advanced AI analytics',
        'Weekly reports',
        'Priority email support',
        'Custom dashboard',
        'API access',
        'Competitor analysis'
      ],
      limits: {
        dealers: 10,
        reports: 4,
        apiCalls: 10000,
        support: 'email'
      },
      stripePriceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large dealership groups',
      price: 1999,
      interval: 'month',
      features: [
        'Unlimited dealers',
        'Real-time AI monitoring',
        'Daily reports',
        'Phone & email support',
        'White-label dashboard',
        'Full API access',
        'Advanced competitor analysis',
        'Custom integrations',
        'Dedicated account manager'
      ],
      limits: {
        dealers: -1, // unlimited
        reports: 30,
        apiCalls: 100000,
        support: 'phone'
      },
      stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY || ''
    }
  ];

  constructor() {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      if (stripeSecretKey) {
        this.stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-10-29.clover'
        });
        this.isInitialized = true;
        logger.info('Stripe client initialized successfully', 'SubscriptionService');
      } else {
        logger.warn('Stripe secret key not configured, using mock data', 'SubscriptionService');
        this.isInitialized = false;
      }
    } catch (error) {
      logger.error('Failed to initialize Stripe client', 'SubscriptionService', error as Error);
      this.isInitialized = false;
    }
  }

  /**
   * Get all available subscription tiers
   */
  getTiers(): SubscriptionTier[] {
    return this.TIERS;
  }

  /**
   * Get a specific tier by ID
   */
  getTier(tierId: string): SubscriptionTier | null {
    return this.TIERS.find(tier => tier.id === tierId) || null;
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string> {
    if (!this.isInitialized) {
      logger.warn('Stripe not initialized, returning mock customer ID', 'SubscriptionService', { email });
      return 'cus_mock_' + Date.now();
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          created_via: 'dealershipai'
        }
      });

      logger.info('Stripe customer created', 'SubscriptionService', { customerId: customer.id, email });
      return customer.id;
    } catch (error) {
      logger.error('Failed to create Stripe customer', 'SubscriptionService', error as Error, { email });
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(customerId: string, tierId: string, paymentMethodId?: string): Promise<Subscription> {
    const tier = this.getTier(tierId);
    if (!tier) {
      throw new Error('Invalid subscription tier');
    }

    if (!this.isInitialized) {
      return this.getMockSubscription(customerId, tier);
    }

    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: tier.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      return this.mapStripeSubscription(subscription, tier);
    } catch (error) {
      logger.error('Failed to create subscription', 'SubscriptionService', error as Error, { customerId, tierId });
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    if (!this.isInitialized) {
      return this.getMockSubscription('cus_mock', this.TIERS[1]);
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
      });

      const tier = this.TIERS.find(t => t.stripePriceId === subscription.items.data[0].price.id);
      if (!tier) {
        throw new Error('Subscription tier not found');
      }

      return this.mapStripeSubscription(subscription, tier);
    } catch (error) {
      logger.error('Failed to get subscription', 'SubscriptionService', error as Error, { subscriptionId });
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<Subscription> {
    if (!this.isInitialized) {
      const mockSub = this.getMockSubscription('cus_mock', this.TIERS[1]);
      mockSub.status = 'canceled';
      return mockSub;
    }

    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd
      });

      const tier = this.TIERS.find(t => t.stripePriceId === subscription.items.data[0].price.id);
      if (!tier) {
        throw new Error('Subscription tier not found');
      }

      return this.mapStripeSubscription(subscription, tier);
    } catch (error) {
      logger.error('Failed to cancel subscription', 'SubscriptionService', error as Error, { subscriptionId });
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get billing information
   */
  async getBillingInfo(customerId: string): Promise<BillingInfo | null> {
    if (!this.isInitialized) {
      return this.getMockBillingInfo(customerId);
    }

    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      const tier = this.TIERS.find(t => t.stripePriceId === subscription.items.data[0].price.id);
      if (!tier) {
        return null;
      }

      const upcomingInvoice = await this.stripe.invoices.createPreview({
        customer: customerId
      });

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      const firstPaymentMethod = paymentMethods.data[0];
      const cardDetails = firstPaymentMethod?.type === 'card' ? firstPaymentMethod.card : null;

      return {
        subscription: this.mapStripeSubscription(subscription, tier),
        nextInvoice: {
          amount: upcomingInvoice.amount_due,
          date: new Date(upcomingInvoice.period_end * 1000),
          status: upcomingInvoice.status || 'draft'
        },
        paymentMethod: cardDetails ? {
          type: 'card',
          last4: cardDetails.last4 || '',
          brand: cardDetails.brand || ''
        } : {
          type: 'card',
          last4: '0000',
          brand: 'visa'
        }
      };
    } catch (error) {
      logger.error('Failed to get billing info', 'SubscriptionService', error as Error, { customerId });
      return null;
    }
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(customerId: string, tierId: string, successUrl: string, cancelUrl: string): Promise<string> {
    const tier = this.getTier(tierId);
    if (!tier) {
      throw new Error('Invalid subscription tier');
    }

    if (!this.isInitialized) {
      return 'cs_mock_' + Date.now();
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: tier.stripePriceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          tier_id: tierId
        }
      });

      return session.url || '';
    } catch (error) {
      logger.error('Failed to create checkout session', 'SubscriptionService', error as Error, { customerId, tierId });
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Map Stripe subscription to our Subscription interface
   */
  private mapStripeSubscription(stripeSub: Stripe.Subscription, tier: SubscriptionTier): Subscription {
    const stripeSubTyped = stripeSub as any; // Cast to any to access Stripe properties
    return {
      id: stripeSubTyped.id,
      customerId: stripeSubTyped.customer as string,
      tier,
      status: stripeSubTyped.status as Subscription['status'],
      currentPeriodStart: new Date(stripeSubTyped.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubTyped.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubTyped.cancel_at_period_end,
      trialEnd: stripeSubTyped.trial_end ? new Date(stripeSubTyped.trial_end * 1000) : undefined
    };
  }

  /**
   * Mock data for development
   */
  private getMockSubscription(customerId: string, tier: SubscriptionTier): Subscription {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      id: 'sub_mock_' + Date.now(),
      customerId,
      tier,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      cancelAtPeriodEnd: false
    };
  }

  private getMockBillingInfo(customerId: string): BillingInfo {
    const subscription = this.getMockSubscription(customerId, this.TIERS[1]);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      subscription,
      nextInvoice: {
        amount: subscription.tier.price * 100, // Convert to cents
        date: nextMonth,
        status: 'open'
      },
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa'
      }
    };
  }
}
