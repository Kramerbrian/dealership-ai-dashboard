/**
 * POST /api/scan/lite
 * 
 * Lightweight scan for PLG widget
 * Returns 5 key metrics without authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { runLiteScan } from '@/lib/trust-engine/scanner';
import { cachedResponse, errorResponse, withRequestId } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const scanLiteSchema = z.object({
  dealer_url: z.string().url(),
  dealer_name: z.string().optional(),
  email: z.string().email().optional(),
  geo: z.string().optional(),
});

// Rate limit: 6 per hour per IP
const liteScanRateLimit = {
  limit: 6,
  window: 60 * 60 * 1000, // 1 hour
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `scan-lite-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitCheck = await checkRateLimit(
      liteScanRateLimit,
      `scan-lite:${clientIP}`
    );

    if (!rateLimitCheck.success) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        { requestId, retryAfter: 3600 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validated = scanLiteSchema.parse(body);

    await logger.info('Lite scan request', {
      requestId,
      dealer_url: validated.dealer_url,
      geo: validated.geo,
    });

    // Run scan
    const result = await runLiteScan(validated);

    // Generate report ID
    const reportId = `lite-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Generate hints
    const hints = generateHints(result.metrics);

    const duration = Date.now() - startTime;

    await logger.info('Lite scan completed', {
      requestId,
      dealer_url: validated.dealer_url,
      trust_score: result.metrics.trust_score,
      duration,
    });

    // Track analytics
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'scan_completed',
          surface: 'widget',
          metadata: {
            dealer_url: validated.dealer_url,
            trust_score: result.metrics.trust_score,
          },
        }),
      });
    } catch {}

    let response = cachedResponse(
      {
        dealer: {
          name: validated.dealer_name || extractDealerName(validated.dealer_url),
          url: validated.dealer_url,
        },
        scores: {
          freshness_score: result.metrics.freshness_score,
          info_match_score: result.metrics.business_identity_match_score,
          review_trust_score: result.metrics.review_trust_score,
          schema_coverage: 0, // Not included in lite scan
          ai_mention_rate: result.metrics.ai_mention_rate,
          zero_click_coverage: 0, // Not included in lite scan
          trust_score: result.metrics.trust_score,
        },
        hints,
        report_id: reportId,
      },
      30, // 30 second cache
      300,
      [`scan:${reportId}`]
    );

    response = withRequestId(response, requestId);
    response.headers.set('Server-Timing', `scan-lite;dur=${duration}`);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      await logger.error('Lite scan validation error', {
        requestId,
        errors: error.errors,
        duration,
      });

      return errorResponse(
        'Invalid request. Please check your input.',
        400,
        { requestId, errors: error.errors }
      );
    }

    await logger.error('Lite scan error', {
      requestId,
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

function generateHints(metrics: any): string[] {
  const hints: string[] = [];

  if (metrics.trust_score < 70) {
    hints.push('Your Trust Score is being capped by stale content and NAP mismatches.');
  } else {
    hints.push('Strong Trust Score. Keep schema and reviews on a 90-day cadence.');
  }

  if (metrics.freshness_score < 60) {
    hints.push('Content freshness is low. Update key pages quarterly.');
  }

  if (metrics.business_identity_match_score < 70) {
    hints.push('NAP consistency needs improvement. Unify across all platforms.');
  }

  if (metrics.review_trust_score < 70) {
    hints.push('Respond to reviews within 24 hours to boost trust.');
  }

  return hints;
}

function extractDealerName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'Dealership';
  }
}

