const express = require('express');
const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

/**
 * Verify Stripe checkout session and update user subscription
 * This endpoint is called after successful checkout to:
 * 1. Verify the Stripe session is valid
 * 2. Retrieve subscription details
 * 3. Update user subscription in database
 */
router.post('/', async (req, res) => {
  try {
    const { session_id, user_id, email } = req.body;

    // Validate input
    if (!session_id) {
      return res.status(400).json({
        error: 'session_id is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        error: 'email is required'
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer']
    });

    // Verify session is valid and payment succeeded
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: session.payment_status
      });
    }

    // Extract subscription details
    const subscription = session.subscription;
    const customer = session.customer;

    // Get subscription object details
    const subscriptionDetails = typeof subscription === 'string'
      ? await stripe.subscriptions.retrieve(subscription)
      : subscription;

    // Prepare subscription data
    const subscriptionData = {
      email,
      user_id,
      stripe_customer_id: typeof customer === 'string' ? customer : customer.id,
      stripe_subscription_id: subscriptionDetails.id,
      status: subscriptionDetails.status,
      plan: subscriptionDetails.items.data[0].price.id,
      current_period_start: new Date(subscriptionDetails.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionDetails.current_period_end * 1000).toISOString(),
      trial_end: subscriptionDetails.trial_end
        ? new Date(subscriptionDetails.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscriptionDetails.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };

    // Store or update subscription in database
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Failed to update subscription',
        details: error.message
      });
    }

    // Return subscription details to client
    res.json({
      success: true,
      customer_id: subscriptionData.stripe_customer_id,
      subscription_id: subscriptionData.stripe_subscription_id,
      status: subscriptionData.status,
      trial_end: subscriptionData.trial_end,
      current_period_end: subscriptionData.current_period_end,
      subscription: data
    });

  } catch (error) {
    console.error('Verify checkout error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid session ID',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to verify checkout session',
      details: error.message
    });
  }
});

module.exports = router;
