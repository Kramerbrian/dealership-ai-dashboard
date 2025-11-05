/**
 * GET /api/diagnostics/redis
 * 
 * Health check endpoint for Redis Pub/Sub configuration
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redisUrl = process.env.REDIS_URL;
    const hasRedis = !!redisUrl;

    // Check if Redis module is available
    let redisModuleAvailable = false;
    try {
      await import('redis');
      redisModuleAvailable = true;
    } catch {
      redisModuleAvailable = false;
    }

    // Check if event bus is initialized
    let busStatus = 'unknown';
    let busError: string | undefined;
    try {
      const { bus } = await import('@/lib/events/bus');
      busStatus = bus ? 'initialized' : 'not-initialized';
    } catch (error) {
      busStatus = 'error';
      busError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      redisUrl: hasRedis ? 'configured' : 'not-configured',
      redisModuleAvailable,
      busStatus,
      ...(busError && { busError }),
      status: hasRedis && redisModuleAvailable ? 'configured' : 'fallback-local',
      message: hasRedis && redisModuleAvailable
        ? 'Redis Pub/Sub is configured and ready'
        : 'Using local EventEmitter fallback (single-instance mode)',
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        redisUrl: 'error',
        redisModuleAvailable: false,
        busStatus: 'error',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
