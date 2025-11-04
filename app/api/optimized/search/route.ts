/**
 * Optimized Search API Endpoint
 * 
 * Demonstrates Phase 1 enhancements:
 * - Multi-layer caching
 * - Response compression
 * - Field selection
 * - Pagination
 * - Advanced search/filtering
 */

import { NextRequest } from 'next/server';
import { withCache, generateCacheKey, getCacheHeaders } from '@/lib/cache-strategy';
import { optimizedResponse, parseOptimizationOptions } from '@/lib/api-optimization';
import { applySearchFilter, parseSearchFilter, SearchFilter } from '@/lib/search-filter';
import { logger } from '@/lib/logger';
import { errorResponse, withRequestId } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `search-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  try {
    // Parse search filter and optimization options
    const searchFilter = parseSearchFilter(req);
    const optimizationOptions = parseOptimizationOptions(req);

    await logger.info('Search request received', {
      requestId,
      query: searchFilter.query,
      filters: searchFilter.filters,
    });

    // Generate cache key
    const cacheKey = generateCacheKey(
      'search',
      searchFilter.query || 'all',
      JSON.stringify(searchFilter.filters || {}),
      JSON.stringify(optimizationOptions)
    );

    // Multi-layer cache with database fallback
    const result = await withCache(
      cacheKey,
      async () => {
        // Simulate database query (replace with actual query)
        const allData = await fetchAllData(); // Replace with actual data fetching
        
        // Apply search filter
        const filtered = applySearchFilter(allData, searchFilter);
        
        return filtered;
      },
      {
        ttl: 300, // 5 minutes
        tags: ['search', 'dashboard'],
        layer: 'redis',
      }
    );

    const duration = Date.now() - startTime;

    await logger.info('Search completed', {
      requestId,
      duration,
      fromCache: result.fromCache,
      layer: result.layer,
      total: result.data.total,
      filtered: result.data.filtered,
    });

    // Create optimized response
    let response = optimizedResponse(
      result.data,
      req,
      {
        ...optimizationOptions,
        compress: true, // Enable compression
      }
    );

    // Add cache headers
    const cacheHeaders = getCacheHeaders(300, 600); // 5 min cache, 10 min stale
    for (const [key, value] of Object.entries(cacheHeaders)) {
      response.headers.set(key, value);
    }

    // Add performance metadata
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', String(duration));
    response.headers.set('X-Cache-Hit', result.fromCache ? 'true' : 'false');
    response.headers.set('X-Cache-Layer', result.layer);

    response = withRequestId(response, requestId);

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;

    await logger.error('Search API error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    return errorResponse(
      'Search failed',
      500,
      { requestId, timestamp: new Date().toISOString() }
    );
  }
}

// Mock data fetcher (replace with actual database query)
async function fetchAllData(): Promise<any[]> {
  // This would be your actual database query
  // Example: return await prisma.dealership_data.findMany();
  
  // Mock data for demonstration
  return [
    {
      id: '1',
      name: 'Dealership A',
      score: 85,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Dealership B',
      score: 92,
      createdAt: new Date().toISOString(),
    },
  ];
}

