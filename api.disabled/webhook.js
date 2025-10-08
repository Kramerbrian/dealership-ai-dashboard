const express = require('express');
const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      case 'entitlements.active_entitlement_summary.updated':
        await handleEntitlementUpdate(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook handler failed'
    });
  }
});

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata } = session;

  // Get subscription details
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  // Create/update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: metadata?.user_id,
    email: session.customer_email,
    dealership_url: metadata?.dealership_url,
    dealership_name: metadata?.dealership_name,
    stripe_customer_id: customer,
    stripe_subscription_id: subscription,
    stripe_price_id: stripeSubscription.items.data[0].price.id,
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000),
    trial_ends_at: stripeSubscription.trial_end 
      ? new Date(stripeSubscription.trial_end * 1000) 
      : null,
  }, { onConflict: 'stripe_customer_id' });

  console.log('Subscription created for user:', metadata?.user_id);
}

async function handleSubscriptionUpdate(subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionCanceled(subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log('Subscription canceled:', subscription.id);
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // You can add email notifications here
}

async function handleTrialWillEnd(subscription) {
  console.log('Trial will end soon:', subscription.id);

  // Update subscription with trial ending notification
  await supabaseAdmin
    .from('subscriptions')
    .update({
      trial_ending_soon: true,
      updated_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // You can add email notifications here to remind users
}

async function handleEntitlementUpdate(summary) {
  console.log('Active entitlement summary updated:', summary.id);
  // Handle entitlement changes if using Stripe entitlements
}

module.exports = router;

