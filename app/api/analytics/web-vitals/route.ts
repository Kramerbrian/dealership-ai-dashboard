/**
 * Web Vitals API Endpoint
 * 
 * Receives and logs Core Web Vitals metrics from the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Use Node.js runtime for logger compatibility
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();

    // Validate metric structure
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Log the metric (structured logging)
    await logger.info('Web Vital metric received', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: metric.timestamp,
    });

    // TODO: Store in database or analytics service
    // For now, we just log it
    
    // In production, you might want to:
    // 1. Store in database for historical tracking
    // 2. Send to analytics service (e.g., PostHog, Mixpanel)
    // 3. Alert if metrics are consistently poor

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    await logger.error('Failed to process Web Vital metric', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}

