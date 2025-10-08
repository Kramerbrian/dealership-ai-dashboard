const express = require('express');
const { stripe, STRIPE_PLANS } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// Create checkout session
router.post('/', async (req, res) => {
  try {
    const { email, dealershipUrl, dealershipName, plan = 'monthly', tier = 'pro' } = req.body;

    if (!email || !dealershipUrl) {
      return res.status(400).json({
        error: 'Email and dealership URL required'
      });
    }

    // Get or create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({ email }, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Check for existing customer
    let customerId;
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      
      line_items: [{
        price: STRIPE_PLANS[tier].monthly,
        quantity: 1,
      }],
      
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      
      subscription_data: {
        metadata: {
          user_id: user.id,
          dealership_url: dealershipUrl,
          dealership_name: dealershipName || '',
        },
        trial_period_days: 7, // 7-day free trial
      },
      
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/pricing?canceled=true`,
      
      metadata: {
        user_id: user.id,
        dealership_url: dealershipUrl,
      }
    });

    res.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;

