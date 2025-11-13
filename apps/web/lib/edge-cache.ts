/**
 * Edge Caching System
 * DealershipAI - High-Performance Caching with ETag Support
 * 
 * This module provides edge caching with ETag support and Redis fallback
 * for optimal performance and cache consistency.
 */

import crypto from 'crypto'

export interface CacheEntry<T = any> {
  data: T
  etag: string
  timestamp: number
  ttl: number
  version: string
  metadata: CacheMetadata
}

export interface CacheMetadata {
  tenantId?: string
  userId?: string
  source: string
  tags: string[]
  size: number
  compressed: boolean
}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  compress?: boolean // Enable compression
  version?: string // Cache version for invalidation
  tenantId?: string
  userId?: string
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
  totalSize: number
  entries: number
}

export class EdgeCache {
  private static instance: EdgeCache
  private cache = new Map<string, CacheEntry>()
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  }

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

  /**
   * Generate ETag for data
   */
  generateETag(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data)
    return `"${crypto.createHash('md5').update(content).digest('hex')}"`
  }

  /**
   * Get cached data with ETag support
   */
  async get<T>(key: string, ifNoneMatch?: string): Promise<{
    data: T | null
    etag: string | null
    cached: boolean
  }> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return { data: null, etag: null, cached: false }
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      this.stats.misses++
      return { data: null, etag: null, cached: false }
    }

    // Check ETag match
    if (ifNoneMatch && ifNoneMatch === entry.etag) {
      this.stats.hits++
      return { data: null, etag: entry.etag, cached: true }
    }

    this.stats.hits++
    return { 
      data: entry.data as T, 
      etag: entry.etag, 
      cached: true 
    }
  }

  /**
   * Set cached data with ETag
   */
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<string> {
    const {
      ttl = 3600, // 1 hour default
      tags = [],
      compress = false,
      version = '1.0',
      tenantId,
      userId
    } = options

    const etag = this.generateETag(data)
    const serializedData = typeof data === 'string' ? data : JSON.stringify(data)
    
    const entry: CacheEntry<T> = {
      data,
      etag,
      timestamp: Date.now(),
      ttl,
      version,
      metadata: {
        tenantId,
        userId,
        source: 'edge-cache',
        tags,
        size: serializedData.length,
        compressed: compress
      }
    }

    this.cache.set(key, entry)
    this.stats.sets++

    return etag
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
    }
    return deleted
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.metadata.tags.includes(tag))) {
        this.cache.delete(key)
        invalidated++
      }
    }

    return invalidated
  }

  /**
   * Invalidate cache by tenant
   */
  async invalidateByTenant(tenantId: string): Promise<number> {
    let invalidated = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.tenantId === tenantId) {
        this.cache.delete(key)
        invalidated++
      }
    }

    return invalidated
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.metadata.size
    }

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize,
      entries: this.cache.size
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 }
  }

  /**
   * Cleanup expired entries
   */
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

  /**
   * Get cache keys matching pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys())
    
    if (!pattern) return keys
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return keys.filter(key => regex.test(key))
  }

  /**
   * Get cache entry metadata
   */
  getMetadata(key: string): CacheMetadata | null {
    const entry = this.cache.get(key)
    return entry ? entry.metadata : null
  }
}

// Redis fallback implementation
export class RedisCache {
  private redis: any // Redis client
  private prefix: string

  constructor(redisClient: any, prefix = 'dealershipai:') {
    this.redis = redisClient
    this.prefix = prefix
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const data = await this.redis.get(`${this.prefix}${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis cache get error:', error)
      return null
    }
  }

  async set<T>(key: string, entry: CacheEntry<T>, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(entry)
      if (ttl) {
        await this.redis.setex(`${this.prefix}${key}`, ttl, serialized)
      } else {
        await this.redis.set(`${this.prefix}${key}`, serialized)
      }
    } catch (error) {
      console.error('Redis cache set error:', error)
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(`${this.prefix}${key}`)
      return result > 0
    } catch (error) {
      console.error('Redis cache delete error:', error)
      return false
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.prefix}${pattern}`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return keys.length
    } catch (error) {
      console.error('Redis cache invalidate error:', error)
      return 0
    }
  }
}

// Hybrid cache with edge + Redis fallback
export class HybridCache {
  private edgeCache: EdgeCache
  private redisCache?: RedisCache

  constructor(redisClient?: any) {
    this.edgeCache = EdgeCache.getInstance()
    if (redisClient) {
      this.redisCache = new RedisCache(redisClient)
    }
  }

  async get<T>(key: string, ifNoneMatch?: string): Promise<{
    data: T | null
    etag: string | null
    cached: boolean
    source: 'edge' | 'redis' | 'miss'
  }> {
    // Try edge cache first
    const edgeResult = await this.edgeCache.get<T>(key, ifNoneMatch)
    if (edgeResult.cached) {
      return { ...edgeResult, source: 'edge' }
    }

    // Fallback to Redis if available
    if (this.redisCache) {
      const redisEntry = await this.redisCache.get<T>(key)
      if (redisEntry) {
        // Check if expired
        if (Date.now() - redisEntry.timestamp <= redisEntry.ttl * 1000) {
          // Check ETag match
          if (ifNoneMatch && ifNoneMatch === redisEntry.etag) {
            return { data: null, etag: redisEntry.etag, cached: true, source: 'redis' }
          }
          
          // Promote to edge cache
          await this.edgeCache.set(key, redisEntry.data, {
            ttl: Math.floor((redisEntry.timestamp + redisEntry.ttl * 1000 - Date.now()) / 1000),
            tags: redisEntry.metadata.tags,
            tenantId: redisEntry.metadata.tenantId
          })
          
          return { 
            data: redisEntry.data, 
            etag: redisEntry.etag, 
            cached: true, 
            source: 'redis' 
          }
        }
      }
    }

    return { data: null, etag: null, cached: false, source: 'miss' }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<string> {
    const etag = await this.edgeCache.set(key, data, options)
    
    // Also set in Redis if available
    if (this.redisCache) {
      const entry: CacheEntry<T> = {
        data,
        etag,
        timestamp: Date.now(),
        ttl: options.ttl || 3600,
        version: options.version || '1.0',
        metadata: {
          tenantId: options.tenantId,
          source: 'hybrid-cache',
          tags: options.tags || [],
          size: JSON.stringify(data).length,
          compressed: options.compress || false
        }
      }
      
      await this.redisCache.set(key, entry, options.ttl)
    }

    return etag
  }

  async delete(key: string): Promise<boolean> {
    const edgeDeleted = await this.edgeCache.delete(key)
    let redisDeleted = false
    
    if (this.redisCache) {
      redisDeleted = await this.redisCache.delete(key)
    }

    return edgeDeleted || redisDeleted
  }

  getStats() {
    return this.edgeCache.getStats()
  }
}

// Export singleton instance
export const cache = new HybridCache()
