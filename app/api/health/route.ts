import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRedis } from '@/lib/redis';
// Provide a basic rate limit health check fallback
import { createRateLimiters } from '@/lib/rate-limiter-redis';

/**
 * Comprehensive health check endpoint
 * Used by uptime monitors (UptimeRobot, Pingdom, etc.)
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';

  try {
    // 1. Database check (Supabase)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.from('users').select('count').limit(1);
      checks.database = {
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - startTime,
        error: error?.message,
      };
      if (error) overallStatus = 'degraded';
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Connection failed',
      };
      overallStatus = 'unhealthy';
    }

    // 2. Redis check (connectivity)
    try {
      const redis = getRedis();
      await redis.ping();
      checks.redis = { status: 'healthy' };
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Connection failed',
      };
      overallStatus = 'degraded';
    }

    // 3. Rate limiting check (basic)
    try {
      const { api } = createRateLimiters();
      const sample = await api.getUsage('healthcheck');
      checks.rateLimiting = {
        status: 'healthy',
        remaining: sample.remaining,
        resetTime: sample.resetTime,
      };
    } catch (error) {
      checks.rateLimiting = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Check failed',
      };
      overallStatus = 'degraded';
    }

    // 4. Environment checks
    checks.environment = {
      node: process.env.NODE_ENV,
      clerk: {
        configured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'healthy' : 'missing',
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        status: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'missing',
      },
      supabase: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        status:
          process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? 'healthy'
            : 'missing',
      },
    };

    // Check if any critical env vars are missing
    if (
      !checks.environment.clerk.configured ||
      !checks.environment.stripe.configured ||
      !checks.environment.supabase.configured
    ) {
      overallStatus = 'degraded';
    }

    // 5. System info
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        readable: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      },
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      },
      checks,
      responseTime: `${Date.now() - startTime}ms`,
    };

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
      },
      { status: 503 }
    );
  }
}