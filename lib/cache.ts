/**
 * Caching Utilities
 * Provides in-memory caching with TTL for API responses
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize = 1000; // Maximum cache entries

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value with TTL
   */
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  clean(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new Cache();

// Export CacheManager as alias for backward compatibility
export const CacheManager = cache;

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.clean();
  }, 5 * 60 * 1000);
}

/**
 * Generate cache key from request
 */
export function getCacheKey(req: Request): string {
  const url = new URL(req.url);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

/**
 * Cache middleware for API routes
 */
export async function withCache<T>(
  handler: (req: Request) => Promise<Response>,
  options: {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    skipCache?: (req: Request) => boolean;
  } = {}
): Promise<Response> {
  return async (req: Request) => {
    const { ttl = 60, keyGenerator = getCacheKey, skipCache } = options;

    // Skip cache if condition met
    if (skipCache && skipCache(req)) {
      return handler(req);
    }

    const cacheKey = keyGenerator(req);
    const cached = cache.get<Response>(cacheKey);

    if (cached) {
      // Return cached response with updated headers
      const response = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...Object.fromEntries(cached.headers.entries()),
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
      return response;
    }

    // Execute handler
    const response = await handler(req);

    // Clone response to cache body (Response body can only be read once)
    const responseClone = response.clone();
    const body = await response.text();
    const responseToCache = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Cache successful responses only
    if (response.status === 200) {
      cache.set(cacheKey, responseToCache, ttl);
    }

    // Return original response with cache miss header
    response.headers.set('X-Cache', 'MISS');
    return response;
  };
}

/**
 * Cache keys for different API endpoints
 */
export const CACHE_KEYS = {
  PERFORMANCE_MONITOR: 'performance-monitor',
  AI_HEALTH: 'ai-health',
  REVIEWS: 'reviews',
  WEBSITE: 'website',
  ONBOARDING_ANALYZE: 'onboarding-analyze',
  VISIBILITY_AEO: 'visibility-aeo',
  VISIBILITY_GEO: 'visibility-geo',
  VISIBILITY_SEO: 'visibility-seo',
};

/**
 * Cache TTL values in seconds
 */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  VERY_LONG: 86400, // 24 hours
};
