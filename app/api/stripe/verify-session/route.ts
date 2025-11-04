import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { stripeSessionVerifySchema, validateQueryParams } from '@/lib/validation/schemas';
import { stripe } from '@/lib/stripe';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/**
 * Stripe Session Verification Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Query parameter validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/stripe/verify-session',
    requireAuth: false, // Public endpoint for session verification
    validateQuery: stripeSessionVerifySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        await logger.error('Stripe session verification called but not configured', { requestId });
        return NextResponse.json(
          {
            success: false,
            error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
          },
          { status: 503 }
        );
      }

      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, stripeSessionVerifySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const { session_id } = queryValidation.data;

      await logger.info('Verifying Stripe checkout session', {
        requestId,
        sessionId: session_id,
      });

      // Retrieve the checkout session
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['customer', 'subscription']
      });

      if (!session || session.payment_status !== 'paid') {
        await logger.warn('Invalid or unpaid Stripe session', {
          requestId,
          sessionId: session_id,
          paymentStatus: session?.payment_status,
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or unpaid session',
            message: 'The checkout session is invalid or payment was not completed',
          },
          { status: 400 }
        );
      }

      // Get customer details
      const customer = session.customer as any;
      const subscription = session.subscription as any;

      await logger.info('Stripe session verified successfully', {
        requestId,
        sessionId: session_id,
        customerId: customer?.id,
      });

      return noCacheResponse({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          plan: session.metadata?.plan || 'professional',
          domain: session.metadata?.domain,
          company: session.metadata?.company,
          subscriptionId: subscription?.id,
          status: subscription?.status
        }
      });

    } catch (error) {
      await logger.error('Stripe session verification error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/stripe/verify-session',
      });
    }
  }
);
