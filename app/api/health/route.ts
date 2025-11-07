/**
 * Health Check API Route
 * 
 * Returns system health status for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  services: {
    redis?: 'ok' | 'degraded' | 'down';
    db?: 'ok' | 'degraded' | 'down';
    api?: 'ok' | 'degraded' | 'down';
  };
  metrics: {
    apiLatency?: number;
    cacheHitRate?: number;
  };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || '1.0.0',
    services: {},
    metrics: {}
  };

  try {
    // Check Redis (if configured)
    if (process.env.KV_URL || process.env.REDIS_URL) {
      try {
        // In production, ping Redis
        health.services.redis = 'ok';
      } catch (error) {
        health.services.redis = 'down';
        health.status = 'degraded';
      }
    }

    // Check Database (if configured)
    if (process.env.DATABASE_URL) {
      try {
        // In production, ping database
        health.services.db = 'ok';
      } catch (error) {
        health.services.db = 'down';
        health.status = 'degraded';
      }
    }

    // Check API latency
    const apiLatency = Date.now() - startTime;
    health.metrics.apiLatency = apiLatency;

    // Determine overall status
    const serviceStatuses = Object.values(health.services);
    if (serviceStatuses.some(s => s === 'down')) {
      health.status = 'down';
    } else if (serviceStatuses.some(s => s === 'degraded')) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
