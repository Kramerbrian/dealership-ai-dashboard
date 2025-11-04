import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { stripeSessionVerifySchema, validateQueryParams } from '@/lib/validation/schemas';
import { stripe } from '@/lib/stripe';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Onboarding Session API Endpoint
 * Get Stripe session data for onboarding personalization
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Query parameter validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/onboarding/session',
    requireAuth: true,
    validateQuery: stripeSessionVerifySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, stripeSessionVerifySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const { session_id } = queryValidation.data;

      await logger.info('Fetching onboarding session', {
        requestId,
        sessionId: session_id,
        userId: auth.userId,
      });

      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        await logger.error('Stripe not configured', { requestId });
        return NextResponse.json(
          {
            success: false,
            error: 'Stripe is not configured',
          },
          { status: 503 }
        );
      }

      // Get Stripe checkout session
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['subscription', 'customer']
      });

      // Verify session belongs to current user
      if (session.client_reference_id && session.client_reference_id !== auth.userId) {
        await logger.warn('Session does not belong to user', {
          requestId,
          sessionId: session_id,
          userId: auth.userId,
          sessionUserId: session.client_reference_id,
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'Session does not belong to current user',
          },
          { status: 403 }
        );
      }

      // Get subscription details if exists
      let subscriptionData = null;
      if (session.subscription && typeof session.subscription === 'string') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        subscriptionData = {
          id: subscription.id,
          plan: session.metadata?.plan || 'professional',
          status: subscription.status,
          trialEnd: subscription.trial_end,
          currentPeriodEnd: subscription.current_period_end,
        };
      }

      const result = {
        success: true,
        subscription: subscriptionData,
        dealership: {
          domain: session.metadata?.domain || '',
          company: session.metadata?.company || '',
        },
        customer: {
          id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          email: session.customer_details?.email || '',
        },
        metadata: session.metadata || {}
      };

      await logger.info('Onboarding session retrieved', {
        requestId,
        sessionId: session_id,
        userId: auth.userId,
      });

      return noCacheResponse(result);

    } catch (error) {
      await logger.error('Error fetching onboarding session', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/onboarding/session',
        userId: auth.userId,
      });
    }
  }
);
