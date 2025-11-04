/**
 * GET /api/diagnostics/redis
 * 
 * Redis connection diagnostics endpoint
 * Returns Redis configuration status and connection health
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { cachedResponse } from '@/lib/api-response';

export const GET = createApiRoute(
  {
    endpoint: '/api/diagnostics/redis',
    requireAuth: false,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req) => {
    const redisUrl = process.env.REDIS_URL;
    const hasRedisUrl = !!redisUrl;
    
    // Check if Redis is actually connected (from the event bus)
    const isConnected = (globalThis as any).__dai_bus_connected || false;
    
    const response = {
      redisUrl: hasRedisUrl,
      redisConfigured: hasRedisUrl,
      status: hasRedisUrl ? (isConnected ? "connected" : "configured") : "fallback-local",
      mode: hasRedisUrl ? "redis-pubsub" : "local-eventemitter",
      message: hasRedisUrl
        ? "Redis Pub/Sub enabled - multi-instance safe"
        : "Using local EventEmitter - single instance only",
    };

    return cachedResponse(response, 60); // Cache for 60 seconds
  }
);

