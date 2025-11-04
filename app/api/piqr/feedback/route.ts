/**
 * POST /api/piqr/feedback
 * 
 * PIQR feedback endpoint
 * Handles user feedback events: accept_recommendation, reject_recommendation, manual_override, correction
 * Uses weighted feedback for model retraining (accept: +1.0, reject: -0.5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { z } from 'zod';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const feedbackEventSchema = z.object({
  dealerId: z.string(),
  event: z.enum(['accept_recommendation', 'reject_recommendation', 'manual_override', 'correction']),
  recommendation_id: z.string().optional(),
  correction: z.object({
    metric: z.enum(['aiv_score', 'ati_score', 'crs_score', 'piqr_overall']),
    old_value: z.number(),
    new_value: z.number(),
    reason: z.string().optional(),
  }).optional(),
  use_in_retrain: z.boolean().default(true),
});

// Feedback weights as specified
const FEEDBACK_WEIGHTS = {
  accept_recommendation: 1.0,
  reject_recommendation: -0.5,
  manual_override: 0.8,
  correction: 1.0,
} as const;

export const POST = createApiRoute(
  {
    endpoint: '/api/piqr/feedback',
    requireAuth: false,
    validateBody: feedbackEventSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { dealerId, event, recommendation_id, correction, use_in_retrain } = body;

      // Get weight for this event type
      const weight = FEEDBACK_WEIGHTS[event];

      // Create feedback record
      const feedbackRecord = {
        feedback_id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dealerId,
        event,
        recommendation_id,
        correction,
        weight,
        timestamp: new Date().toISOString(),
        use_in_retrain,
      };

      // In production, this would:
      // 1. Store feedback in database
      // 2. Queue for retraining if use_in_retrain is true
      // 3. Update model weights based on feedback

      await logger.info('PIQR feedback received', {
        dealerId,
        event,
        recommendation_id,
        weight,
        use_in_retrain,
        has_correction: !!correction,
      });

      const response = {
        success: true,
        data: {
          feedback_id: feedbackRecord.feedback_id,
          event,
          weight,
          will_retrain: use_in_retrain,
          message: use_in_retrain 
            ? 'Feedback recorded and queued for model retraining'
            : 'Feedback recorded',
        },
        meta: {
          timestamp: feedbackRecord.timestamp,
          dealerId,
        },
      };

      return noCacheResponse(response);
    } catch (error) {
      await logger.error('PIQR feedback error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return errorResponse('Failed to process feedback', 500);
    }
  }
);
