/**
 * Background Job Queue API
 * 
 * Endpoints for managing background jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addJob, getQueueStats, JobType } from '@/lib/job-queue';
import { errorResponse, withRequestId } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/jobs/queue
 * 
 * Add a new job to the queue
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return errorResponse('Unauthorized', 401, { requestId });
    }

    const body = await req.json();
    const { type, payload, priority, delay, attempts } = body;

    if (!type || !Object.values(JobType).includes(type)) {
      return errorResponse('Invalid job type', 400, { requestId });
    }

    const jobId = await addJob({
      type: type as JobType,
      payload: payload || {},
      priority,
      delay,
      attempts,
    });

    await logger.info('Job added to queue', {
      requestId,
      jobId,
      type,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        type,
        status: 'queued',
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'X-Request-ID': requestId,
      },
    });

  } catch (error) {
    await logger.error('Failed to queue job', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      'Failed to queue job',
      500,
      { requestId, timestamp: new Date().toISOString() }
    );
  }
}

/**
 * GET /api/jobs/queue
 * 
 * Get queue statistics
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `stats-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return errorResponse('Unauthorized', 401, { requestId });
    }

    const stats = await getQueueStats();

    if (!stats) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          message: 'Job queue not configured (Redis not available)',
        },
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'X-Request-ID': requestId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: true,
        ...stats,
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'X-Request-ID': requestId,
      },
    });

  } catch (error) {
    await logger.error('Failed to get queue stats', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return errorResponse(
      'Failed to get queue stats',
      500,
      { requestId, timestamp: new Date().toISOString() }
    );
  }
}

