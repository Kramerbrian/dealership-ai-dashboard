/**
 * POST /api/scan/full
 * 
 * Full scan for authenticated users
 * Returns comprehensive metrics including E-E-A-T
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { runFullScan } from '@/lib/trust-engine/scanner'; // TODO: Implement trust engine scanner
import { cachedResponse, errorResponse, withRequestId } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const scanFullSchema = z.object({
  dealer_url: z.string().url(),
  dealer_name: z.string().optional(),
  email: z.string().email().optional(),
  geo: z.string().optional(),
  referral_code: z.string().optional(),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return errorResponse('Authentication required', 401);
  }

  const requestId = req.headers.get('x-request-id') || `scan-full-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  try {
    // Parse and validate input
    const body = await req.json();
    const validated = scanFullSchema.parse(body);

    await logger.info('Full scan request', {
      requestId,
      userId,
      dealer_url: validated.dealer_url,
      geo: validated.geo,
      referral_code: validated.referral_code,
    });

    // Run full scan (stub implementation)
    // TODO: Implement runFullScan when trust-engine/scanner is ready
    const result = {
      scores: {
        trust_score: 0.85,
        expertise_score: 0.82,
        authoritativeness_score: 0.88,
        trustworthiness_score: 0.83,
      },
      citations: [],
      conflicts: [],
      competitors: [],
      recommendations: [],
    };

    // Track referral if provided
    if (validated.referral_code) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/referral/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referral_code: validated.referral_code,
            new_user_id: userId,
            dealer_url: validated.dealer_url,
          }),
        });
      } catch {}
    }

    const duration = Date.now() - startTime;

    await logger.info('Full scan completed', {
      requestId,
      userId,
      dealer_url: validated.dealer_url,
      trust_score: result.scores.trust_score,
      duration,
    });

    // Track analytics
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'full_report_viewed',
          surface: 'dashboard',
          metadata: {
            dealer_url: validated.dealer_url,
            trust_score: result.scores.trust_score,
          },
        }),
      });
    } catch {}

    let response = cachedResponse(
      {
        scores: result.scores,
        citations: result.citations,
        conflicts: result.conflicts,
        competitors: result.competitors,
        recommendations: result.recommendations,
      },
      60, // 1 minute cache
      300,
      [`scan:full:${userId}`]
    );

    response = withRequestId(response, requestId);
    response.headers.set('Server-Timing', `scan-full;dur=${duration}`);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      await logger.error('Full scan validation error', {
        requestId,
        userId,
        errors: error.errors,
        duration,
      });

      return errorResponse(
        'Invalid request. Please check your input.',
        400,
        { requestId, errors: error.errors }
      );
    }

    await logger.error('Full scan error', {
      requestId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    return errorResponse(
      'Failed to run scan. Please try again.',
      500,
      { requestId }
    );
  }
}

