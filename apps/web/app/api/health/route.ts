import { NextRequest, NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { prisma } from '@/lib/prisma';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    redis: {
      status: 'up' | 'down';
      error?: string;
    };
    anthropic: {
      status: 'configured' | 'not_configured';
    };
    sendgrid: {
      status: 'configured' | 'not_configured';
    };
    clerk: {
      status: 'configured' | 'not_configured';
    };
  };
  version: string;
  environment: string;
}

async function handler(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: { status: 'down' },
      redis: { status: 'down' },
      anthropic: { status: 'not_configured' },
      sendgrid: { status: 'not_configured' },
      clerk: { status: 'not_configured' },
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  };

  // Check database connection
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.services.database = {
      status: 'up',
      latency: Date.now() - dbStartTime,
    };
  } catch (error) {
    result.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    result.status = 'degraded';
  }

  // Check Redis/Upstash configuration
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      );
      result.services.redis.status = response.ok ? 'up' : 'down';
    } catch (error) {
      result.services.redis = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      result.status = 'degraded';
    }
  }

  // Check service configurations
  result.services.anthropic.status = process.env.ANTHROPIC_API_KEY
    ? 'configured'
    : 'not_configured';

  result.services.sendgrid.status =
    process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL
      ? 'configured'
      : 'not_configured';

  result.services.clerk.status =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
      ? 'configured'
      : 'not_configured';

  // Determine overall health status
  const criticalServicesDown = result.services.database.status === 'down';

  if (criticalServicesDown) {
    result.status = 'unhealthy';
  } else if (result.status !== 'degraded') {
    result.status = 'healthy';
  }

  const statusCode = result.status === 'healthy' ? 200 :
                     result.status === 'degraded' ? 200 : 503;

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': result.status,
    },
  });
}

export const GET = createPublicRoute(handler, { rateLimit: false });
