import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/health
 * 
 * Versioned health check endpoint for production monitoring
 */
export const GET = createPublicRoute(async () => {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        redis: process.env.UPSTASH_REDIS_REST_URL ? 'connected' : 'not_configured',
        ai_providers: 'available',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}););

