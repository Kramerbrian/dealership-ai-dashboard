const express = require('express');
const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// Create customer portal session
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required'
      });
    }

    // Get subscription
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('email', email)
      .single();

    if (error || !subscription) {
      return res.status(404).json({
        error: 'No subscription found'
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/dashboard`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;

