/**
 * AVI Report Cache Utilities
 * Provides caching layer for AVI reports with Next.js cache integration
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

// Cache configuration
export const AVI_CACHE_CONFIG = {
  // Cache TTL in seconds (5 minutes default)
  TTL: parseInt(process.env.AVI_CACHE_TTL || '300', 10),

  // Revalidation tags
  TAGS: {
    ALL: 'avi-reports',
    TENANT: (tenantId: string) => `avi-reports:tenant:${tenantId}`,
    LATEST: (tenantId: string) => `avi-reports:latest:${tenantId}`,
  },

  // Cache keys
  KEYS: {
    REPORT: (tenantId: string, reportId: string) => `avi-report:${tenantId}:${reportId}`,
    LATEST: (tenantId: string) => `avi-report:latest:${tenantId}`,
  },
};

/**
 * Generate cache key for AVI report
 */
export function getAviReportCacheKey(tenantId: string, reportId?: string): string {
  if (reportId) {
    return AVI_CACHE_CONFIG.KEYS.REPORT(tenantId, reportId);
  }
  return AVI_CACHE_CONFIG.KEYS.LATEST(tenantId);
}

/**
 * Generate cache tags for AVI report
 */
export function getAviReportCacheTags(tenantId: string): string[] {
  return [
    AVI_CACHE_CONFIG.TAGS.ALL,
    AVI_CACHE_CONFIG.TAGS.TENANT(tenantId),
    AVI_CACHE_CONFIG.TAGS.LATEST(tenantId),
  ];
}

/**
 * Invalidate AVI report cache for a tenant
 */
export async function invalidateAviReportCache(tenantId: string): Promise<void> {
  const tags = getAviReportCacheTags(tenantId);
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/**
 * Invalidate all AVI report caches
 */
export async function invalidateAllAviReportCaches(): Promise<void> {
  revalidateTag(AVI_CACHE_CONFIG.TAGS.ALL);
}

/**
 * Create cached AVI report fetcher
 *
 * @example
 * const cachedFetcher = createCachedAviReportFetcher(tenantId);
 * const report = await cachedFetcher(() => fetchFromDatabase());
 */
export function createCachedAviReportFetcher<T>(tenantId: string) {
  return unstable_cache(
    async (fetchFn: () => Promise<T>) => {
      return await fetchFn();
    },
    [getAviReportCacheKey(tenantId)],
    {
      revalidate: AVI_CACHE_CONFIG.TTL,
      tags: getAviReportCacheTags(tenantId),
    }
  );
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hit: boolean;
  key: string;
  timestamp: number;
}

/**
 * Log cache hit/miss (development only)
 */
export function logCacheAccess(stats: CacheStats): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AVI Cache] ${stats.hit ? 'HIT' : 'MISS'} - ${stats.key} at ${new Date(stats.timestamp).toISOString()}`);
  }
}
