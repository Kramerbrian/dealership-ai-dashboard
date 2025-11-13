/**
 * POST /api/auto-fix/queue
 * Queue auto-fix job for dealer issues
 * Queue: auto_fix
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';
import {
  createAutoFixJob,
  calculateEstimatedConfidence,
  type Issue,
} from '@/lib/auto-fix/engine';

const AutoFixQueueSchema = z.object({
  dealer_id: z.string().min(1, 'dealer_id is required'),
  issues: z.array(
    z.object({
      type: z.enum([
        'MISSING_FAQ_SCHEMA',
        'MISSING_LOCAL_SCHEMA',
        'NAP_MISMATCH',
        'SLOW_CORE_WEB_VITALS',
        'MISSING_REVIEW_SCHEMA',
        'STALE_CONTENT',
      ]),
      severity: z.enum(['low', 'medium', 'high']),
      description: z.string(),
      impact_estimate: z.number(),
      confidence: z.number().min(0).max(1),
    })
  ).min(1, 'At least one issue is required'),
});

export const POST = createAuthRoute(async (req: NextRequest, { userId, tenantId }) => {
  try {
    const body = await req.json();
    const validated = AutoFixQueueSchema.parse(body);
    const { dealer_id, issues } = validated;

    // Create auto-fix job
    const job = await createAutoFixJob(dealer_id, issues as Issue[]);

    // TODO: Queue job in background worker
    // - Add to Redis queue
    // - Trigger worker to process job
    // - Store job in database

    return NextResponse.json({
      ok: true,
      job_id: job.job_id,
      estimated_confidence: job.estimated_confidence,
      status: job.status,
      dealer_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Auto-fix queue error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to queue auto-fix job' },
      { status: 500 }
    );
  }
}, {
  schema: AutoFixQueueSchema,
});

