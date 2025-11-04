import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { subscriptionCreateSchema, validateRequestBody } from '@/lib/validation/schemas';
import { userManager } from '@/lib/user-management';
import { billingManager } from '@/lib/stripe-billing';
import { errorResponse, noCacheResponse, cachedResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache-tags';

/**
 * User Subscription API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Input validation (POST)
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/user/subscription',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      await logger.info('Getting user subscription', {
        requestId,
        userId: auth.userId,
      });

      const subscription = await userManager.getUserSubscription(auth.userId);
      
      if (!subscription.success) {
        await logger.error('Failed to get user subscription', {
          requestId,
          userId: auth.userId,
          error: subscription.error,
        });
        
        return errorResponse(
          new Error(subscription.error || 'Failed to fetch subscription'),
          500,
          {
            requestId,
            endpoint: '/api/user/subscription',
            userId: auth.userId,
          }
        );
      }

      await logger.info('User subscription retrieved', {
        requestId,
        userId: auth.userId,
      });

      return cachedResponse(
        {
          success: true,
          data: subscription.data
        },
        60, // 1 min cache
        300, // 5 min stale
        [CACHE_TAGS.USER_SUBSCRIPTION, CACHE_TAGS.USER]
      );

    } catch (error) {
      await logger.error('Error getting user subscription', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/user/subscription',
        userId: auth.userId,
      });
    }
  }
);

export const POST = createApiRoute(
  {
    endpoint: '/api/user/subscription',
    requireAuth: true,
    validateBody: subscriptionCreateSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, subscriptionCreateSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { plan } = bodyValidation.data;

      await logger.info('Creating checkout session for subscription', {
        requestId,
        userId: auth.userId,
        plan,
      });

      // Create checkout session
      const checkoutResult = await billingManager.createCheckoutSession(
        auth.userId,
        plan
      );

      if (!checkoutResult.success) {
        await logger.error('Failed to create checkout session', {
          requestId,
          userId: auth.userId,
          plan,
          error: checkoutResult.error,
        });
        
        return errorResponse(
          new Error(checkoutResult.error || 'Failed to create checkout session'),
          500,
          {
            requestId,
            endpoint: '/api/user/subscription',
            userId: auth.userId,
          }
        );
      }

      await logger.info('Checkout session created', {
        requestId,
        userId: auth.userId,
        plan,
        checkoutUrl: checkoutResult.url,
      });

      return noCacheResponse({
        success: true,
        checkoutUrl: checkoutResult.url
      });

    } catch (error) {
      await logger.error('Error creating checkout session', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/user/subscription',
        userId: auth.userId,
      });
    }
  }
);
