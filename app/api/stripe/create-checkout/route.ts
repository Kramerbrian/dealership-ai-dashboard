import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { stripeCheckoutCreateSchema, validateRequestBody } from '@/lib/validation/schemas';
import { stripe, PRICING_TIERS } from '@/lib/stripe';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/**
 * Stripe Checkout Creation Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required (optional - can be public for signup)
 * - Input validation
 * - Rate limiting
 * - Performance monitoring
 */
export const POST = createApiRoute(
  {
    endpoint: '/api/stripe/create-checkout',
    requireAuth: false, // Public endpoint for signup flow
    validateBody: stripeCheckoutCreateSchema,
    rateLimit: true, // Rate limiting (prevents abuse)
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        await logger.error('Stripe checkout called but not configured', { requestId });
        return NextResponse.json(
          {
            success: false,
            error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
          },
          { status: 503 }
        );
      }

      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, stripeCheckoutCreateSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { email, name, company, phone, domain, plan } = bodyValidation.data;

      // Validate plan against pricing tiers
      const planUpper = plan.toUpperCase();
      if (!PRICING_TIERS[planUpper as keyof typeof PRICING_TIERS]) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid plan selected',
            message: `Plan must be one of: ${Object.keys(PRICING_TIERS).join(', ')}`,
          },
          { status: 400 }
        );
      }

      const pricingTier = PRICING_TIERS[planUpper as keyof typeof PRICING_TIERS];
      
      await logger.info('Creating Stripe checkout session', {
        requestId,
        email,
        plan,
        domain,
        userId: auth?.userId,
      });

      // Create or retrieve customer
      let customer;
      try {
        const existingCustomers = await stripe.customers.list({
          email: email,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email,
            name,
            phone,
            metadata: {
              company,
              domain,
              source: 'dealershipai_web'
            }
          });
        }
      } catch (error) {
        await logger.error('Stripe customer creation error', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
          email,
        });
        
        return errorResponse(
          new Error('Failed to create customer'),
          500,
          {
            requestId,
            endpoint: '/api/stripe/create-checkout',
          }
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: pricingTier.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup?plan=${plan}&domain=${encodeURIComponent(domain)}`,
        metadata: {
          plan,
          domain,
          company,
          source: 'dealershipai_web'
        },
        subscription_data: {
          metadata: {
            plan,
            domain,
            company,
            source: 'dealershipai_web'
          },
          trial_period_days: 14, // 14-day free trial
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      });

      await logger.info('Stripe checkout session created', {
        requestId,
        sessionId: session.id,
        email,
        plan,
      });

      return noCacheResponse({
        success: true,
        url: session.url,
      });

    } catch (error) {
      await logger.error('Stripe checkout creation error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/stripe/create-checkout',
      });
    }
  }
);
