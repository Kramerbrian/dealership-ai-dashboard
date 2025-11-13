import { NextRequest, NextResponse } from 'next/server';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { PerformanceMonitor } from '@/lib/monitoring';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface AIHealthData {
  platforms: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    score: number;
    responseTime: number;
    uptime: number;
  }[];
  performance: {
    averageResponseTime: number;
    overallUptime: number;
    accuracy: number;
    throughput: number;
  };
  alerts: {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }[];
}

// Mock AI Health data generator
function generateAIHealthData(): AIHealthData {
  const platforms = [
    { name: 'ChatGPT', baseScore: 94, baseResponseTime: 1.2 },
    { name: 'Gemini', baseScore: 89, baseResponseTime: 1.5 },
    { name: 'Perplexity', baseScore: 92, baseResponseTime: 1.1 },
    { name: 'Claude', baseScore: 87, baseResponseTime: 1.8 },
    { name: 'Bing Chat', baseScore: 85, baseResponseTime: 1.3 },
    { name: 'You.com', baseScore: 83, baseResponseTime: 1.6 }
  ];

  const platformData = platforms.map(platform => {
    const variation = Math.random() * 0.1 - 0.05; // ±5% variation
    const score = Math.max(0, Math.min(100, platform.baseScore + variation * 100));
    
    return {
      name: platform.name,
      status: score > 90 ? 'operational' : score > 70 ? 'degraded' : 'down',
      score: Math.round(score),
      responseTime: platform.baseResponseTime + Math.random() * 0.5 - 0.25,
      uptime: Math.max(95, 100 - Math.random() * 5)
    };
  });

  const averageResponseTime = platformData.reduce((sum, p) => sum + p.responseTime, 0) / platformData.length;
  const overallUptime = platformData.reduce((sum, p) => sum + p.uptime, 0) / platformData.length;
  const accuracy = 94.2 + Math.random() * 2 - 1; // 93.2-95.2%
  const throughput = 1250 + Math.random() * 200 - 100; // 1150-1350 requests/min

  const alerts = [
    {
      id: '1',
      type: 'success' as const,
      title: 'All Systems Operational',
      message: 'All AI platforms are responding normally',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Performance Optimized',
      message: 'Response times improved by 15% this week',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ];

  return {
    platforms: platformData,
    performance: {
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      overallUptime: Math.round(overallUptime * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      throughput: Math.round(throughput)
    },
    alerts
  };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const monitor = PerformanceMonitor.getInstance();

  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Check cache first
    const cache = CacheManager.getInstance();
    const cacheKey = CACHE_KEYS.AI_HEALTH_DATA(timeRange);

    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      const duration = Date.now() - startTime;

      const response = NextResponse.json({
        success: true,
        data: cachedData,
        meta: {
          timeRange,
          timestamp: new Date().toISOString(),
          responseTime: `${duration}ms`,
          source: 'cache'
        }
      });

      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      response.headers.set('Server-Timing', `ai-health;dur=${duration}`);

      return response;
    }

    // Generate AI Health data with performance tracking
    const aiHealthData = await monitor.trackApiCall(
      'ai_health_analysis',
      () => generateAIHealthData(),
      { timeRange }
    );

    // Cache the result
    await cache.set(cacheKey, aiHealthData, CACHE_TTL.AI_HEALTH_DATA);

    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      success: true,
      data: aiHealthData,
      meta: {
        timeRange,
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        source: 'ai_health_engine'
      }
    });

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    response.headers.set('Server-Timing', `ai-health;dur=${duration}`);

    return response;

  } catch (error: any) {
    console.error('AI Health API Error:', error);
    monitor.trackError(error, { api: 'ai_health', timeRange: req.url });

    // Return fallback data
    const fallbackData = generateAIHealthData();
    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch AI health data',
      data: fallbackData,
      meta: {
        timeRange: req.nextUrl.searchParams.get('timeRange') || '30d',
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        source: 'fallback_mock_data'
      }
    }, { status: 500 });

    response.headers.set('Server-Timing', `ai-health;dur=${duration}`);
    return response;
  }
}
