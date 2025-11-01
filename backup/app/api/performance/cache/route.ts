import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { PerformanceOptimizer } from '@/lib/performance/cache-optimizer';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 3. Initialize performance optimizer
    const optimizer = new PerformanceOptimizer(redis, prisma);

    let result;

    switch (action) {
      case 'cache_stats':
        result = await optimizer.getCacheStats();
        break;

      case 'connection_pool':
        result = await optimizer.optimizeConnectionPool();
        break;

      case 'warmup':
        result = await optimizer.warmupCache();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Performance optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to get performance data' },
      { status: 500 }
    );
  }
}

// POST endpoint for cache operations
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 2. Initialize performance optimizer
    const optimizer = new PerformanceOptimizer(redis, prisma);

    let result;

    switch (action) {
      case 'invalidate_cache':
        const { pattern } = data;
        if (!pattern) {
          return NextResponse.json({ error: 'Pattern is required' }, { status: 400 });
        }
        
        result = await optimizer.invalidateCache(pattern);
        break;

      case 'invalidate_by_tags':
        const { tags } = data;
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
        }
        
        result = await optimizer.invalidateByTags(tags);
        break;

      case 'optimize_query':
        const { query, params } = data;
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        
        result = await optimizer.optimizeQuery(query, params || []);
        break;

      case 'get_cached':
        const { key, configName } = data;
        if (!key) {
          return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }
        
        // This would typically be used internally, but for demo purposes
        result = await optimizer.getCached(key, async () => {
          // Mock fetcher function
          return { data: 'cached_data' };
        }, configName || 'default');
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Cache operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform cache operation' },
      { status: 500 }
    );
  }
}
