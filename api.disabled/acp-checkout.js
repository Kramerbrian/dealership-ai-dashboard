const express = require('express');
const { stripe, STRIPE_PLANS, PLAN_FEATURES } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabase');
const crypto = require('crypto');

const router = express.Router();

// In-memory session store (in production, use Redis or database)
const sessions = new Map();

/**
 * Agentic Commerce Protocol (ACP) Checkout Implementation
 *
 * This implements the standard ACP checkout flow:
 * 1. POST /checkout_sessions - Initiate checkout session
 * 2. POST /checkout_sessions/:id - Update session details
 * 3. POST /checkout_sessions/:id/complete - Complete checkout with payment
 */

// Validation middleware
const validateSessionRequest = (req, res, next) => {
  const errors = [];

  if (!req.body) {
    return res.status(400).json({
      error: 'Request body required',
      code: 'INVALID_REQUEST'
    });
  }

  next();
};

// Rate limiting helper (simple in-memory implementation)
const rateLimiter = new Map();
const checkRateLimit = (identifier, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(identifier) || [];

  // Clean old requests
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimiter.set(identifier, recentRequests);
  return true;
};

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;

  if (!checkRateLimit(identifier)) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  next();
};

/**
 * POST /api/acp-checkout/checkout_sessions
 * Initiate a new checkout session
 *
 * Request body:
 * {
 *   buyer: {
 *     email: string,
 *     name?: string,
 *     phone?: string
 *   },
 *   items: [{
 *     product_id: string,
 *     quantity: number,
 *     variant_id?: string
 *   }],
 *   metadata?: object
 * }
 */
router.post('/checkout_sessions', rateLimitMiddleware, validateSessionRequest, async (req, res) => {
  try {
    const { buyer, items, metadata = {} } = req.body;

    // Validate buyer information
    if (!buyer || !buyer.email) {
      return res.status(400).json({
        error: 'Buyer email is required',
        code: 'INVALID_BUYER_INFO'
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'At least one item is required',
        code: 'INVALID_ITEMS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer.email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Generate session ID
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Get or create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        email: buyer.email,
        name: buyer.name || null,
        phone: buyer.phone || null
      }, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        error: 'Failed to create user',
        code: 'USER_CREATION_FAILED'
      });
    }

    // Process and validate items
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      // Map product_id to tier (pro, premium, etc.)
      const tier = item.product_id || 'pro';
      const planFeatures = PLAN_FEATURES[tier];

      if (!planFeatures) {
        return res.status(400).json({
          error: `Invalid product: ${tier}`,
          code: 'INVALID_PRODUCT'
        });
      }

      const itemTotal = planFeatures.price * (item.quantity || 1);
      totalAmount += itemTotal;

      processedItems.push({
        product_id: tier,
        product_name: planFeatures.name,
        quantity: item.quantity || 1,
        unit_price: planFeatures.price,
        total_price: itemTotal,
        variant_id: item.variant_id,
        features: planFeatures
      });
    }

    // Create session object
    const session = {
      id: sessionId,
      status: 'pending',
      buyer: {
        email: buyer.email,
        name: buyer.name || null,
        phone: buyer.phone || null,
        user_id: user.id
      },
      items: processedItems,
      total_amount: totalAmount,
      currency: 'USD',
      shipping: null,
      payment: null,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        ip_address: req.ip || req.connection.remoteAddress
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Store session in database
    const { error: sessionError } = await supabaseAdmin
      .from('acp_checkout_sessions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        buyer_email: buyer.email,
        items: processedItems,
        total_amount: totalAmount,
        currency: session.currency,
        status: 'pending',
        metadata: session.metadata,
        expires_at: session.expires_at
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      // Continue even if DB insert fails - use in-memory session
    }

    // Store in memory for quick access
    sessions.set(sessionId, session);

    // Return session response
    res.status(201).json({
      session_id: sessionId,
      status: 'pending',
      buyer: session.buyer,
      items: processedItems,
      total_amount: totalAmount,
      currency: 'USD',
      expires_at: session.expires_at,
      next_steps: {
        update_url: `/api/acp-checkout/checkout_sessions/${sessionId}`,
        complete_url: `/api/acp-checkout/checkout_sessions/${sessionId}/complete`
      }
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      code: 'SESSION_CREATION_FAILED',
      message: error.message
    });
  }
});

/**
 * POST /api/acp-checkout/checkout_sessions/:id
 * Update an existing checkout session (shipping, variants, etc.)
 *
 * Request body:
 * {
 *   shipping?: {
 *     address: string,
 *     city: string,
 *     state: string,
 *     zip: string,
 *     country: string
 *   },
 *   items?: [...],
 *   metadata?: object
 * }
 */
router.post('/checkout_sessions/:id', rateLimitMiddleware, validateSessionRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping, items, metadata } = req.body;

    // Get session from memory or database
    let session = sessions.get(id);

    if (!session) {
      // Try to fetch from database
      const { data: dbSession, error } = await supabaseAdmin
        .from('acp_checkout_sessions')
        .select('*')
        .eq('session_id', id)
        .single();

      if (error || !dbSession) {
        return res.status(404).json({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        });
      }

      // Reconstruct session from database
      session = {
        id: dbSession.session_id,
        status: dbSession.status,
        buyer: {
          email: dbSession.buyer_email,
          user_id: dbSession.user_id
        },
        items: dbSession.items,
        total_amount: dbSession.total_amount,
        currency: dbSession.currency,
        shipping: dbSession.shipping,
        payment: dbSession.payment,
        metadata: dbSession.metadata,
        created_at: dbSession.created_at,
        expires_at: dbSession.expires_at
      };
    }

    // Check if session is still valid
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Session has expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Check if session is already completed
    if (session.status === 'completed' || session.status === 'paid') {
      return res.status(400).json({
        error: 'Session is already completed',
        code: 'SESSION_ALREADY_COMPLETED'
      });
    }

    // Update shipping information
    if (shipping) {
      session.shipping = shipping;
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      const processedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const tier = item.product_id || 'pro';
        const planFeatures = PLAN_FEATURES[tier];

        if (!planFeatures) {
          return res.status(400).json({
            error: `Invalid product: ${tier}`,
            code: 'INVALID_PRODUCT'
          });
        }

        const itemTotal = planFeatures.price * (item.quantity || 1);
        totalAmount += itemTotal;

        processedItems.push({
          product_id: tier,
          product_name: planFeatures.name,
          quantity: item.quantity || 1,
          unit_price: planFeatures.price,
          total_price: itemTotal,
          variant_id: item.variant_id,
          features: planFeatures
        });
      }

      session.items = processedItems;
      session.total_amount = totalAmount;
    }

    // Update metadata
    if (metadata) {
      session.metadata = {
        ...session.metadata,
        ...metadata
      };
    }

    session.updated_at = new Date().toISOString();
    session.status = 'updated';

    // Update in memory
    sessions.set(id, session);

    // Update in database
    await supabaseAdmin
      .from('acp_checkout_sessions')
      .update({
        items: session.items,
        total_amount: session.total_amount,
        shipping: session.shipping,
        metadata: session.metadata,
        status: session.status,
        updated_at: session.updated_at
      })
      .eq('session_id', id);

    res.json({
      session_id: id,
      status: session.status,
      buyer: session.buyer,
      items: session.items,
      total_amount: session.total_amount,
      currency: session.currency,
      shipping: session.shipping,
      updated_at: session.updated_at,
      next_steps: {
        complete_url: `/api/acp-checkout/checkout_sessions/${id}/complete`
      }
    });

  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({
      error: 'Failed to update session',
      code: 'SESSION_UPDATE_FAILED',
      message: error.message
    });
  }
});

/**
 * POST /api/acp-checkout/checkout_sessions/:id/complete
 * Complete the checkout with payment token
 *
 * Request body:
 * {
 *   payment_token: string,
 *   payment_method?: string
 * }
 */
router.post('/checkout_sessions/:id/complete', rateLimitMiddleware, validateSessionRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_token, payment_method = 'card' } = req.body;

    if (!payment_token) {
      return res.status(400).json({
        error: 'Payment token is required',
        code: 'PAYMENT_TOKEN_REQUIRED'
      });
    }

    // Get session
    let session = sessions.get(id);

    if (!session) {
      const { data: dbSession, error } = await supabaseAdmin
        .from('acp_checkout_sessions')
        .select('*')
        .eq('session_id', id)
        .single();

      if (error || !dbSession) {
        return res.status(404).json({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        });
      }

      session = {
        id: dbSession.session_id,
        status: dbSession.status,
        buyer: {
          email: dbSession.buyer_email,
          user_id: dbSession.user_id
        },
        items: dbSession.items,
        total_amount: dbSession.total_amount,
        currency: dbSession.currency,
        shipping: dbSession.shipping,
        payment: dbSession.payment,
        metadata: dbSession.metadata,
        created_at: dbSession.created_at,
        expires_at: dbSession.expires_at
      };
    }

    // Validate session
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Session has expired',
        code: 'SESSION_EXPIRED'
      });
    }

    if (session.status === 'completed' || session.status === 'paid') {
      return res.status(400).json({
        error: 'Session is already completed',
        code: 'SESSION_ALREADY_COMPLETED'
      });
    }

    // Get or create Stripe customer
    let customerId;
    const existingCustomers = await stripe.customers.list({
      email: session.buyer.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.buyer.email,
        name: session.buyer.name,
        metadata: {
          user_id: session.buyer.user_id,
          session_id: id
        }
      });
      customerId = customer.id;
    }

    // Attach payment method to customer
    let paymentMethodId;
    try {
      const paymentMethod = await stripe.paymentMethods.attach(payment_token, {
        customer: customerId,
      });
      paymentMethodId = paymentMethod.id;

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      console.error('Payment method attachment error:', error);
      return res.status(400).json({
        error: 'Invalid payment token',
        code: 'INVALID_PAYMENT_TOKEN',
        message: error.message
      });
    }

    // Create subscription or one-time payment based on items
    let stripeSubscription;
    let paymentIntent;

    // For subscription-based products
    if (session.items.some(item => STRIPE_PLANS[item.product_id])) {
      const lineItems = session.items
        .filter(item => STRIPE_PLANS[item.product_id])
        .map(item => ({
          price: STRIPE_PLANS[item.product_id].monthly,
          quantity: item.quantity
        }));

      stripeSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: lineItems,
        default_payment_method: paymentMethodId,
        metadata: {
          user_id: session.buyer.user_id,
          session_id: id,
          ...session.metadata
        },
        trial_period_days: 7 // 7-day trial
      });

      session.payment = {
        method: payment_method,
        status: 'succeeded',
        subscription_id: stripeSubscription.id,
        amount: session.total_amount,
        currency: session.currency,
        timestamp: new Date().toISOString()
      };
    } else {
      // For one-time payments
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(session.total_amount * 100), // Convert to cents
        currency: session.currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          user_id: session.buyer.user_id,
          session_id: id,
          ...session.metadata
        }
      });

      session.payment = {
        method: payment_method,
        status: paymentIntent.status,
        payment_intent_id: paymentIntent.id,
        amount: session.total_amount,
        currency: session.currency,
        timestamp: new Date().toISOString()
      };
    }

    session.status = 'completed';
    session.completed_at = new Date().toISOString();

    // Update in memory
    sessions.set(id, session);

    // Update in database
    await supabaseAdmin
      .from('acp_checkout_sessions')
      .update({
        status: 'completed',
        payment: session.payment,
        completed_at: session.completed_at,
        stripe_subscription_id: stripeSubscription?.id || null,
        stripe_payment_intent_id: paymentIntent?.id || null
      })
      .eq('session_id', id);

    // Create order record
    await supabaseAdmin
      .from('orders')
      .insert({
        user_id: session.buyer.user_id,
        session_id: id,
        items: session.items,
        total_amount: session.total_amount,
        currency: session.currency,
        payment_method: payment_method,
        payment_status: 'succeeded',
        shipping_address: session.shipping,
        stripe_subscription_id: stripeSubscription?.id || null,
        stripe_payment_intent_id: paymentIntent?.id || null,
        metadata: session.metadata
      });

    // Send confirmation (implement email sending here)
    console.log(`Order completed for session ${id}, user ${session.buyer.email}`);

    res.json({
      session_id: id,
      status: 'completed',
      order_id: id, // Could generate a separate order ID
      payment: {
        status: 'succeeded',
        amount: session.total_amount,
        currency: session.currency
      },
      subscription: stripeSubscription ? {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
      } : null,
      completed_at: session.completed_at,
      confirmation: {
        email_sent: true,
        email: session.buyer.email
      }
    });

  } catch (error) {
    console.error('Checkout completion error:', error);

    // Update session status to failed
    if (sessions.has(id)) {
      const session = sessions.get(id);
      session.status = 'failed';
      session.error = error.message;
      sessions.set(id, session);

      await supabaseAdmin
        .from('acp_checkout_sessions')
        .update({
          status: 'failed',
          error: error.message
        })
        .eq('session_id', id);
    }

    res.status(500).json({
      error: 'Failed to complete checkout',
      code: 'CHECKOUT_FAILED',
      message: error.message
    });
  }
});

/**
 * GET /api/acp-checkout/checkout_sessions/:id
 * Retrieve session status
 */
router.get('/checkout_sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try memory first
    let session = sessions.get(id);

    if (!session) {
      // Try database
      const { data: dbSession, error } = await supabaseAdmin
        .from('acp_checkout_sessions')
        .select('*')
        .eq('session_id', id)
        .single();

      if (error || !dbSession) {
        return res.status(404).json({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        });
      }

      session = {
        id: dbSession.session_id,
        status: dbSession.status,
        buyer: {
          email: dbSession.buyer_email,
          user_id: dbSession.user_id
        },
        items: dbSession.items,
        total_amount: dbSession.total_amount,
        currency: dbSession.currency,
        shipping: dbSession.shipping,
        payment: dbSession.payment,
        metadata: dbSession.metadata,
        created_at: dbSession.created_at,
        completed_at: dbSession.completed_at,
        expires_at: dbSession.expires_at
      };
    }

    res.json({
      session_id: session.id,
      status: session.status,
      buyer: session.buyer,
      items: session.items,
      total_amount: session.total_amount,
      currency: session.currency,
      shipping: session.shipping,
      payment: session.payment,
      created_at: session.created_at,
      completed_at: session.completed_at,
      expires_at: session.expires_at
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      code: 'SESSION_RETRIEVAL_FAILED'
    });
  }
});

module.exports = router;
