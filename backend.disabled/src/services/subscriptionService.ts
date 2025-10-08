import Stripe from 'stripe';
import { supabase } from '../database/supabase';
import { config } from '../config/config';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
});

export interface CheckoutSessionParams {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export class SubscriptionService {
  async createCheckoutSession(params: CheckoutSessionParams) {
    try {
      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', params.userId)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      // Create or get Stripe customer
      let customerId: string;
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', params.userId)
        .single();

      if (subscription?.stripe_customer_id) {
        customerId = subscription.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: params.userId,
          },
        });
        customerId = customer.id;
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          userId: params.userId,
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async getSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return null;
      }

      // Get latest subscription data from Stripe
      if (data.stripe_subscription_id) {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          data.stripe_subscription_id
        );

        // Update local data with Stripe data
        const { data: updatedData, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: stripeSubscription.status,
            current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        return updatedData || data;
      }

      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single();

      if (error || !subscription?.stripe_subscription_id) {
        throw new Error('Subscription not found');
      }

      // Cancel subscription in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      // Update local database
      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async reactivateSubscription(userId: string) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single();

      if (error || !subscription?.stripe_subscription_id) {
        throw new Error('Subscription not found');
      }

      // Reactivate subscription in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: false,
        }
      );

      // Update local database
      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  async createBillingPortalSession(userId: string) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (error || !subscription?.stripe_customer_id) {
        throw new Error('Customer not found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${config.security.allowedOrigins[0]}/dashboard`,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }
}

export const subscriptionService = new SubscriptionService();
