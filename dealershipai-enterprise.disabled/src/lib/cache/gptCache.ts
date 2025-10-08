/**
 * GPT Response Caching System
 * Provides intelligent caching for GPT responses with tenant isolation
 */

import { createHash } from 'crypto'

interface CacheEntry {
  response: any
  timestamp: number
  expiry: number
  tenantId: string
  action: string
  parameters: any
  hitCount: number
}

interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  cacheSize: number
  hitRate: number
}

class GPTCache {
  private cache: Map<string, CacheEntry> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    cacheSize: 0,
    hitRate: 0
  }

  /**
   * Generate cache key for GPT request
   */
  private generateCacheKey(tenantId: string, action: string, parameters: any): string {
    const paramString = JSON.stringify(parameters, Object.keys(parameters).sort())
    const hash = createHash('sha256')
      .update(`${tenantId}:${action}:${paramString}`)
      .digest('hex')
      .substring(0, 16)
    
    return `gpt:${tenantId}:${action}:${hash}`
  }

  /**
   * Get cached response
   */
  get(tenantId: string, action: string, parameters: any): any | null {
    this.stats.totalRequests++
    
    const key = this.generateCacheKey(tenantId, action, parameters)
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
    
    // Update hit count
    entry.hitCount++
    this.stats.hits++
    this.updateHitRate()
    
    return entry.response
  }

  /**
   * Set cached response
   */
  set(
    tenantId: string, 
    action: string, 
    parameters: any, 
    response: any, 
    ttlMinutes: number = 60
  ): void {
    const key = this.generateCacheKey(tenantId, action, parameters)
    const now = Date.now()
    
    const entry: CacheEntry = {
      response,
      timestamp: now,
      expiry: now + (ttlMinutes * 60 * 1000),
      tenantId,
      action,
      parameters,
      hitCount: 0
    }
    
    this.cache.set(key, entry)
    this.stats.cacheSize = this.cache.size
  }

  /**
   * Check if response should be cached
   */
  shouldCache(action: string, parameters: any): boolean {
    // Cache certain actions for performance
    const cacheableActions = [
      'analyze_visibility',
      'analyze_competitors',
      'generate_insights',
      'analyze_trends',
      'generate_recommendations'
    ]
    
    // Don't cache real-time or user-specific actions
    const nonCacheableActions = [
      'real_time_analysis',
      'user_specific_content',
      'personalized_recommendations'
    ]
    
    if (nonCacheableActions.includes(action)) {
      return false
    }
    
    if (cacheableActions.includes(action)) {
      return true
    }
    
    // Default to cache for most actions
    return true
  }

  /**
   * Get cache TTL based on action type
   */
  getTTL(action: string): number {
    const ttlMap: Record<string, number> = {
      'analyze_visibility': 120,      // 2 hours
      'analyze_competitors': 240,     // 4 hours
      'generate_insights': 60,        // 1 hour
      'analyze_trends': 180,          // 3 hours
      'generate_recommendations': 90, // 1.5 hours
      'default': 60                   // 1 hour
    }
    
    return ttlMap[action] || ttlMap.default
  }

  /**
   * Clear cache for specific tenant
   */
  clearTenant(tenantId: string): void {
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tenantId === tenantId) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.stats.cacheSize = this.cache.size
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.stats.cacheSize = this.cache.size
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache entries for tenant
   */
  getTenantEntries(tenantId: string): CacheEntry[] {
    const entries: CacheEntry[] = []
    
    for (const entry of this.cache.values()) {
      if (entry.tenantId === tenantId) {
        entries.push(entry)
      }
    }
    
    return entries.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get most popular cache entries
   */
  getPopularEntries(limit: number = 10): Array<CacheEntry & { key: string }> {
    const entries: Array<CacheEntry & { key: string }> = []
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({ ...entry, key })
    }
    
    return entries
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, limit)
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    }
  }

  /**
   * Get cache size in MB (approximate)
   */
  getCacheSizeMB(): number {
    let totalSize = 0
    
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length
    }
    
    return totalSize / (1024 * 1024) // Convert to MB
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      cacheSize: 0,
      hitRate: 0
    }
  }
}

// Create singleton instance
const gptCache = new GPTCache()

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  gptCache.clearExpired()
}, 5 * 60 * 1000)

export { gptCache, type CacheEntry, type CacheStats }
