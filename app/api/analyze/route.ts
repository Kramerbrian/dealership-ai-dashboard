import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { analyzeRequestSchema, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/**
 * ROI Analysis API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Input validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const POST = createApiRoute(
  {
    endpoint: '/api/analyze',
    requireAuth: false, // Public endpoint for ROI calculator
    validateBody: analyzeRequestSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, analyzeRequestSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { revenue, marketSize, competition, visibility } = bodyValidation.data;

      await logger.info('ROI analysis requested', {
        requestId,
        revenue,
        marketSize,
        competition,
        visibility,
        userId: auth?.userId,
      });

      const revenueNumber = revenue || 0;
      const visibilityPercent = visibility || 0;

      const marketMultipliers: Record<string, number> = {
        small: 0.8,
        medium: 1,
        large: 1.5,
      };

      const competitionMultipliers: Record<string, number> = {
        low: 0.8,
        moderate: 1,
        high: 1.2,
      };

      const marketKey = marketSize || 'medium';
      const competitionKey = competition || 'moderate';

      const marketFactor = marketMultipliers[marketKey] ?? 1;
      const competitionFactor = competitionMultipliers[competitionKey] ?? 1;

      const revenueAtRisk = revenueNumber * ((100 - visibilityPercent) / 100) * marketFactor;
      const potentialRecovery = revenueAtRisk * 0.8 * competitionFactor;

      const spend = revenueNumber * 0.1;
      const expectedROI = spend > 0 ? (potentialRecovery / spend) * 100 : null;

      const result = {
        revenueAtRisk: Math.round(revenueAtRisk),
        potentialRecovery: Math.round(potentialRecovery),
        expectedROI: expectedROI !== null ? Math.round(expectedROI) : null,
      };

      await logger.info('ROI analysis completed', {
        requestId,
        result,
      });

      return noCacheResponse(result);

    } catch (error) {
      await logger.error('ROI analysis error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/analyze',
        userId: auth?.userId,
      });
    }
  }
);
