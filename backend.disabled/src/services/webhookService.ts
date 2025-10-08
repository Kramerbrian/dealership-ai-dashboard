import Stripe from 'stripe';
import { supabase } from '../database/supabase';
import { config } from '../config/config';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
});

export class WebhookService {
  async handleStripeWebhook(payload: any, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    // Update or create subscription record
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        email: session.customer_details?.email || '',
        stripe_customer_id: customerId,
        status: 'active',
        plan: 'pro',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    // Get user ID from customer metadata
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.userId;

    if (!userId) {
      console.error('No userId in customer metadata');
      return;
    }

    await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if ((invoice as any).subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    if ((invoice as any).subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);
    }
  }

  async handleClerkWebhook(payload: any, signature: string, timestamp: string) {
    try {
      // Verify webhook signature (implement based on Clerk's verification method)
      // For now, we'll process the webhook without verification in development
      
      const event = payload;
      
      switch (event.type) {
        case 'user.created':
          await this.handleUserCreated(event.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(event.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(event.data);
          break;
        default:
          console.log(`Unhandled Clerk event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Clerk webhook error:', error);
      throw error;
    }
  }

  private async handleUserCreated(user: any) {
    await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email_addresses[0]?.email_address,
        created_at: new Date().toISOString(),
      });
  }

  private async handleUserUpdated(user: any) {
    await supabase
      .from('users')
      .update({
        email: user.email_addresses[0]?.email_address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  private async handleUserDeleted(user: any) {
    // Handle user deletion - you might want to anonymize data instead of deleting
    console.log(`User deleted: ${user.id}`);
  }

  async handleVercelWebhook(payload: any) {
    try {
      // Handle Vercel deployment webhooks
      console.log('Vercel webhook received:', payload);
      
      // You could implement deployment notifications, status updates, etc.
    } catch (error) {
      console.error('Vercel webhook error:', error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService();
