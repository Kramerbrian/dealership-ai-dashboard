import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    redis?: 'connected' | 'disconnected' | 'error';
    ai_providers: {
      openai: 'available' | 'unavailable';
      anthropic: 'available' | 'unavailable';
      perplexity: 'available' | 'unavailable';
      gemini: 'available' | 'unavailable';
    };
  };
  metrics?: {
    uptime: number;
    memory_usage: NodeJS.MemoryUsage;
    response_time_ms: number;
  };
}

/**
 * GET /api/health
 * 
 * Production health check endpoint
 * Returns system status and service availability
 */
export const GET = createPublicRoute(async () => {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    services: {
      database: 'disconnected',
      ai_providers: {
        openai: 'unavailable',
        anthropic: 'unavailable',
        perplexity: 'unavailable',
        gemini: 'unavailable',
      },
    },
  };

  try {
    // Check database connection
    try {
      const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('dealerships').select('count').limit(1);
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine for health check
          throw error;
        }
        
        healthStatus.services.database = 'connected';
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      healthStatus.services.database = 'error';
      healthStatus.status = 'degraded';
    }

    // Check Redis connection (if configured)
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (redisUrl && redisToken) {
      try {
        const response = await fetch(`${redisUrl}/ping`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
          },
          signal: AbortSignal.timeout(2000),
        });
        
        if (response.ok) {
          healthStatus.services.redis = 'connected';
        } else {
          healthStatus.services.redis = 'error';
        }
      } catch (error) {
        console.error('Redis health check failed:', error);
        healthStatus.services.redis = 'error';
      }
    }

    // Check AI provider availability (lightweight checks)
    const aiChecks = await Promise.allSettled([
      checkOpenAI(),
      checkAnthropic(),
      checkPerplexity(),
      checkGemini(),
    ]);

    healthStatus.services.ai_providers.openai = aiChecks[0].status === 'fulfilled' ? 'available' : 'unavailable';
    healthStatus.services.ai_providers.anthropic = aiChecks[1].status === 'fulfilled' ? 'available' : 'unavailable';
    healthStatus.services.ai_providers.perplexity = aiChecks[2].status === 'fulfilled' ? 'available' : 'unavailable';
    healthStatus.services.ai_providers.gemini = aiChecks[3].status === 'fulfilled' ? 'available' : 'unavailable';

    // Determine overall status
    const criticalServicesDown = healthStatus.services.database === 'error';
    const aiServicesDown = Object.values(healthStatus.services.ai_providers).every(
      status => status === 'unavailable'
    );

    if (criticalServicesDown) {
      healthStatus.status = 'unhealthy';
    } else if (aiServicesDown) {
      healthStatus.status = 'degraded';
    }

    // Add metrics
    const responseTime = Date.now() - startTime;
    healthStatus.metrics = {
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      response_time_ms: responseTime,
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Check': 'true',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
});

/**
 * Lightweight AI provider availability checks
 */
async function checkOpenAI(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) return false;
  // Just check if key is present, don't make actual API call
  return process.env.OPENAI_API_KEY.length > 0;
}

async function checkAnthropic(): Promise<boolean> {
  if (!process.env.ANTHROPIC_API_KEY) return false;
  return process.env.ANTHROPIC_API_KEY.length > 0;
}

async function checkPerplexity(): Promise<boolean> {
  if (!process.env.PERPLEXITY_API_KEY) return false;
  return process.env.PERPLEXITY_API_KEY.length > 0;
}

async function checkGemini(): Promise<boolean> {
  if (!process.env.GEMINI_API_KEY) return false;
  return process.env.GEMINI_API_KEY.length > 0;
}
