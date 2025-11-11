/**
 * Edge Runtime Cache with SWR
 * DealershipAI - High-Performance Caching Layer
 */

import { NextRequest, NextResponse } from 'next/server'

export interface CacheConfig {
  ttl: number // Time to live in seconds
  staleWhileRevalidate: number // SWR window in seconds
  tags?: string[] // Cache tags for invalidation
  revalidate?: boolean // Force revalidation
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  etag: string
  tags: string[]
}

export class EdgeCache {
  private static instance: EdgeCache
  private cache = new Map<string, CacheEntry>()

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000) // Cleanup every minute
  }

  static getInstance(): EdgeCache {
    if (!EdgeCache.instance) {
      EdgeCache.instance = new EdgeCache()
    }
    return EdgeCache.instance
  }

  async get<T>(key: string, config: CacheConfig): Promise<{
    data: T | null
    cached: boolean
    stale: boolean
    etag: string | null
  }> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return { data: null, cached: false, stale: false, etag: null }
    }

    const now = Date.now()
    const age = now - entry.timestamp
    const isExpired = age > entry.ttl * 1000
    const isStale = age > (entry.ttl - config.staleWhileRevalidate) * 1000

    if (isExpired) {
      this.cache.delete(key)
      return { data: null, cached: false, stale: false, etag: null }
    }

    return {
      data: entry.data as T,
      cached: true,
      stale: isStale,
      etag: entry.etag
    }
  }

  async set<T>(key: string, data: T, config: CacheConfig): Promise<string> {
    const etag = this.generateETag(data)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      etag,
      tags: config.tags || []
    }

    this.cache.set(key, entry)
    return etag
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key)
        invalidated++
      }
    }

    return invalidated
  }

  private generateETag(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data)
    const hash = this.simpleHash(content)
    return `"${hash}"`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Edge cache cleanup: removed ${cleaned} expired entries`)
    }
  }
}

// Edge runtime API route helper
export function withEdgeCache<T>(
  handler: (req: NextRequest) => Promise<T>,
  config: CacheConfig = { ttl: 30, staleWhileRevalidate: 60 }
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    const cache = EdgeCache.getInstance()
    const url = new URL(req.url)
    const cacheKey = `${url.pathname}${url.search}`
    
    // Check cache first
    const cached = await cache.get<T>(cacheKey, config)
    
    if (cached.cached && !cached.stale) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`,
          'ETag': cached.etag || ''
        }
      })
    }

    // Execute handler
    const data = await handler(req)
    const etag = await cache.set(cacheKey, data, config)

    const headers: Record<string, string> = {
      'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`,
      'ETag': etag
    }

    if (cached.stale) {
      headers['X-Cache'] = 'STALE'
    } else {
      headers['X-Cache'] = 'MISS'
    }

    return NextResponse.json(data, { headers })
  }
}

// SWR configuration for client-side
export const swrConfig = {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // 10 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000
}

// Cache key generators
export const cacheKeys = {
  aiScores: (tenantId: string) => `ai-scores:${tenantId}`,
  aviReports: (tenantId: string) => `avi-reports:${tenantId}`,
  offerIntegrity: (tenantId: string) => `offer-integrity:${tenantId}`,
  sentinelEvents: (tenantId: string) => `sentinel-events:${tenantId}`,
  trends: (tenantId: string, location: string) => `trends:${tenantId}:${location}`,
  listings: (tenantId: string) => `listings:${tenantId}`
}

// Rate limiting helper
export class RateLimiter {
  private requests = new Map<string, number[]>()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart)
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const requests = this.requests.get(identifier) || []
    const recentRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - recentRequests.length)
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(60000, 100) // 100 requests per minute

// Middleware helper for rate limiting
export function withRateLimit(identifier: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      if (!rateLimiter.isAllowed(identifier)) {
        throw new Error('Rate limit exceeded')
      }
      return originalMethod.apply(this, args)
    }
  }
}
