const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// Get subscription status
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Email required'
      });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .in('status', ['trialing', 'active', 'past_due'])
      .single();

    if (error || !subscription) {
      return res.json({
        status: 'free',
        hasAccess: false,
        subscription: null
      });
    }

    const hasAccess = ['trialing', 'active'].includes(subscription.status);
    
    res.json({
      status: subscription.status,
      hasAccess,
      subscription
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Check if user can access feature
router.post('/check-feature', async (req, res) => {
  try {
    const { email, feature } = req.body;

    if (!email || !feature) {
      return res.status(400).json({
        error: 'Email and feature required'
      });
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('email', email)
      .in('status', ['trialing', 'active', 'past_due'])
      .single();

    if (!subscription) {
      return res.json({
        hasAccess: false,
        reason: 'No active subscription'
      });
    }

    const hasAccess = ['trialing', 'active'].includes(subscription.status);
    
    res.json({
      hasAccess,
      reason: hasAccess ? 'Access granted' : 'Subscription not active'
    });

  } catch (error) {
    console.error('Feature check error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;

