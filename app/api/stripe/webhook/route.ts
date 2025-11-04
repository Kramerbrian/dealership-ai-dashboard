import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { verifyStripeWebhook } from '@/lib/middleware/webhook-security';
import { errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy billing manager import
async function getBillingManager() {
  const { billingManager } = await import('@/lib/stripe-billing');
  return billingManager;
}

/**
 * Stripe Webhook Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Webhook signature verification (no auth required)
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const POST = createApiRoute(
  {
    endpoint: '/api/stripe/webhook',
    requireAuth: false, // Webhooks don't use auth, use signature verification
    rateLimit: true, // Still rate limited (prevents abuse)
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        await logger.error('Stripe webhook called but not configured', { requestId });
        return NextResponse.json(
          {
            success: false,
            error: 'Stripe is not configured',
          },
          { status: 503 }
        );
      }

      // Verify webhook signature
      const verification = await verifyStripeWebhook(req);
      if (!verification.success) {
        return verification.response;
      }

      const event = verification.event;

      await logger.info('Stripe webhook event received', {
        requestId,
        eventType: event.type,
        eventId: event.id,
      });

      // Handle the event
      const billingManager = await getBillingManager();
      const result = await billingManager.handleWebhookEvent(event);

      if (!result.success) {
        await logger.error('Error handling Stripe webhook event', {
          requestId,
          eventType: event.type,
          eventId: event.id,
          error: result.error,
        });
        
        return errorResponse(
          new Error(result.error || 'Failed to handle webhook event'),
          500,
          {
            requestId,
            endpoint: '/api/stripe/webhook',
            eventType: event.type,
            eventId: event.id,
          }
        );
      }

      await logger.info('Stripe webhook event processed successfully', {
        requestId,
        eventType: event.type,
        eventId: event.id,
      });

      return NextResponse.json({
        success: true,
        received: true,
      });

    } catch (error) {
      await logger.error('Stripe webhook error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/stripe/webhook',
      });
    }
  }
);
