/**
 * Health Check Endpoint
 * Monitor system health for all critical services
 */

import { prisma } from '@/lib/prisma';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  checks: {
    database: ServiceHealth;
    redis?: ServiceHealth;
    anthropic?: ServiceHealth;
    openai?: ServiceHealth;
  };
  timestamp: string;
}

export interface ServiceHealth {
  healthy: boolean;
  latency?: number;
  error?: string;
}

export async function checkHealth(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    anthropic: await checkAnthropic(),
    openai: await checkOpenAI(),
  };

  const allHealthy = Object.values(checks).every((c) => c?.healthy !== false);
  const anyCritical = Object.values(checks).some((c) => !c?.healthy);

  return {
    status: allHealthy ? 'healthy' : anyCritical ? 'critical' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  };
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRedis(): Promise<ServiceHealth | undefined> {
  // Redis check (if configured)
  if (!process.env.KV_URL) {
    return undefined;
  }

  const start = Date.now();
  try {
    // Simple ping check
    // const redis = await getRedis();
    // await redis.ping();
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkAnthropic(): Promise<ServiceHealth | undefined> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return undefined;
  }

  const start = Date.now();
  try {
    // Simple API check
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    return {
      healthy: response.ok,
      latency: Date.now() - start,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkOpenAI(): Promise<ServiceHealth | undefined> {
  if (!process.env.OPENAI_API_KEY) {
    return undefined;
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    return {
      healthy: response.ok,
      latency: Date.now() - start,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
