import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { usageQuerySchema, usageTrackSchema, validateQueryParams, validateRequestBody } from '@/lib/validation/schemas';
import { userManager } from '@/lib/user-management';
import { errorResponse, noCacheResponse, cachedResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache-tags';

/**
 * User Usage API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Query parameter validation (GET)
 * - Body validation (POST)
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/user/usage',
    requireAuth: true,
    validateQuery: usageQuerySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, usageQuerySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const { feature } = queryValidation.data;

      await logger.info('Getting user usage stats', {
        requestId,
        userId: auth.userId,
        feature: feature || 'all',
      });

      let usage;
      if (feature) {
        // Get usage for specific feature
        usage = await userManager.getUsageStats(auth.userId, feature);
      } else {
        // Get all usage stats
        usage = await userManager.getUsageStats(auth.userId);
      }
      
      if (!usage.success) {
        await logger.error('Failed to get usage stats', {
          requestId,
          userId: auth.userId,
          feature: feature || 'all',
          error: usage.error,
        });
        
        return errorResponse(
          new Error(usage.error || 'Failed to fetch usage stats'),
          500,
          {
            requestId,
            endpoint: '/api/user/usage',
            userId: auth.userId,
          }
        );
      }

      await logger.info('Usage stats retrieved', {
        requestId,
        userId: auth.userId,
        feature: feature || 'all',
      });

      return cachedResponse(
        {
          success: true,
          data: usage.data
        },
        60, // 1 min cache
        300, // 5 min stale
        [CACHE_TAGS.USER_USAGE, CACHE_TAGS.USER]
      );

    } catch (error) {
      await logger.error('Error getting usage stats', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/user/usage',
        userId: auth.userId,
      });
    }
  }
);

export const POST = createApiRoute(
  {
    endpoint: '/api/user/usage',
    requireAuth: true,
    validateBody: usageTrackSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, usageTrackSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { feature, metadata } = bodyValidation.data;

      await logger.info('Tracking feature usage', {
        requestId,
        userId: auth.userId,
        feature,
      });

      // Check if user can access the feature
      const canAccess = await userManager.canAccessFeature(auth.userId, feature);
      
      if (!canAccess) {
        await logger.warn('Feature not available for user', {
          requestId,
          userId: auth.userId,
          feature,
        });
        
        return NextResponse.json({ 
          success: false,
          error: 'Feature not available in your plan',
          code: 'FEATURE_NOT_AVAILABLE'
        }, { status: 403 });
      }

      // Check usage limits
      const limits = await userManager.checkUsageLimits(auth.userId, feature);
      
      if (!limits.canUse) {
        await logger.warn('Usage limit exceeded', {
          requestId,
          userId: auth.userId,
          feature,
          remaining: limits.remaining,
        });
        
        return NextResponse.json({ 
          success: false,
          error: 'Usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED',
          remaining: limits.remaining
        }, { status: 429 });
      }

      // Track usage
      const result = await userManager.trackFeatureUsage(auth.userId, feature, metadata);
      
      if (!result.success) {
        await logger.error('Failed to track feature usage', {
          requestId,
          userId: auth.userId,
          feature,
          error: result.error,
        });
        
        return errorResponse(
          new Error(result.error || 'Failed to track usage'),
          500,
          {
            requestId,
            endpoint: '/api/user/usage',
            userId: auth.userId,
          }
        );
      }

      await logger.info('Feature usage tracked', {
        requestId,
        userId: auth.userId,
        feature,
        remaining: limits.remaining,
      });

      return noCacheResponse({
        success: true,
        remaining: limits.remaining
      });

    } catch (error) {
      await logger.error('Error tracking usage', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/user/usage',
        userId: auth.userId,
      });
    }
  }
);
