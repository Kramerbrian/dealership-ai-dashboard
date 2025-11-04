import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { aiVisibilityIndexQuerySchema, aiVisibilityIndexPostSchema, validateQueryParams, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse, cachedResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache-tags';

/**
 * AI Visibility Index API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Query parameter validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/ai/visibility-index',
    requireAuth: false, // Public endpoint for analysis
    validateQuery: aiVisibilityIndexQuerySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, aiVisibilityIndexQuerySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const { domain, dealerId } = queryValidation.data;

      await logger.info('AI Visibility Index requested', {
        requestId,
        domain,
        dealerId,
        userId: auth?.userId,
      });

      // Mock AI Visibility Index data
      const visibilityData = {
        success: true,
        domain: domain || 'demo-dealership.com',
        dealerId: dealerId || 'demo-dealer',
        timestamp: new Date().toISOString(),
        vai: {
          score: 87.3,
          grade: 'A',
          percentile: 87,
          trend: 'up',
          change: 2.3
        },
        breakdown: {
          searchPresence: {
            score: 89.2,
            weight: 0.3,
            factors: ['Google My Business', 'Local SEO', 'Directory Listings']
          },
          aiPlatforms: {
            score: 85.1,
            weight: 0.4,
            factors: ['ChatGPT', 'Claude', 'Perplexity', 'Bard']
          },
          contentQuality: {
            score: 88.7,
            weight: 0.3,
            factors: ['Website Content', 'Reviews', 'Social Media']
          }
        },
        recommendations: [
          {
            priority: 'high',
            category: 'AI Platforms',
            action: 'Optimize website content for AI training data',
            impact: 'Increase VAI by 5-8 points'
          },
          {
            priority: 'medium',
            category: 'Search Presence',
            action: 'Update Google My Business information',
            impact: 'Increase VAI by 2-3 points'
          }
        ]
      };

      await logger.info('AI Visibility Index completed', {
        requestId,
        domain,
        dealerId,
      });

      return cachedResponse(
        visibilityData,
        300, // 5 min cache
        600, // 10 min stale
        [CACHE_TAGS.AI_VISIBILITY_INDEX]
      );
    } catch (error) {
      await logger.error('AI Visibility Index API error', {
        requestId,
        userId: auth?.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/ai/visibility-index',
        userId: auth?.userId,
      });
    }
  }
);

export const POST = createApiRoute(
  {
    endpoint: '/api/ai/visibility-index',
    requireAuth: false, // Public endpoint
    validateBody: aiVisibilityIndexPostSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, aiVisibilityIndexPostSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { domain, dealerId, action } = bodyValidation.data;

      await logger.info('AI Visibility Index action requested', {
        requestId,
        action,
        domain,
        dealerId,
        userId: auth?.userId,
      });

      // Handle VAI calculation requests
      switch (action) {
        case 'calculate':
          return noCacheResponse({
            success: true,
            message: 'VAI calculation initiated',
            jobId: `vai-${Date.now()}`,
            estimatedTime: '2-3 minutes'
          });
        
        case 'refresh':
          return noCacheResponse({
            success: true,
            message: 'VAI refresh initiated',
            timestamp: new Date().toISOString()
          });
        
        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action',
              message: 'Action must be either "calculate" or "refresh"',
            },
            { status: 400 }
          );
      }
    } catch (error) {
      await logger.error('AI Visibility Index POST error', {
        requestId,
        userId: auth?.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/ai/visibility-index',
        userId: auth?.userId,
      });
    }
  }
);
