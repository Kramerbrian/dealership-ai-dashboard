/**
 * API Rate Limiter
 * Protects API endpoints from abuse
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs?: number;  // Time window in milliseconds
  maxRequests?: number;  // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;  // Function to generate rate limit key
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;  // Don't count failed requests
  message?: string;  // Error message when rate limited
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

class InMemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }
  
  increment(key: string, windowMs: number): number {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = this.store.get(key);
    
    if (!existing || existing.resetTime < now) {
      this.store.set(key, { count: 1, resetTime });
      return 1;
    }
    
    existing.count++;
    return existing.count;
  }
  
  getCount(key: string): number {
    const now = Date.now();
    const existing = this.store.get(key);
    
    if (!existing || existing.resetTime < now) {
      return 0;
    }
    
    return existing.count;
  }
  
  getReset(key: string, windowMs: number): Date {
    const existing = this.store.get(key);
    
    if (existing && existing.resetTime > Date.now()) {
      return new Date(existing.resetTime);
    }
    
    return new Date(Date.now() + windowMs);
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
  
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: InMemoryStore;
  
  constructor(config: RateLimitConfig = {}) {
    this.config = {
      windowMs: config.windowMs || 60000, // 1 minute default
      maxRequests: config.maxRequests || 10, // 10 requests per minute default
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      message: config.message || 'Too many requests, please try again later.',
    };
    
    this.store = new InMemoryStore();
  }
  
  /**
   * Check if request should be rate limited
   */
  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(request);
    const count = this.store.increment(key, this.config.windowMs);
    const remaining = Math.max(0, this.config.maxRequests - count);
    const reset = this.store.getReset(key, this.config.windowMs);
    
    if (count > this.config.maxRequests) {
      const retryAfter = Math.ceil((reset.getTime() - Date.now()) / 1000);
      
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset,
        retryAfter,
      };
    }
    
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining,
      reset,
    };
  }
  
  /**
   * Get current count for a request
   */
  getCount(request: NextRequest): number {
    const key = this.config.keyGenerator(request);
    return this.store.getCount(key);
  }
  
  /**
   * Default key generator using IP address
   */
  private defaultKeyGenerator(request: NextRequest): string {
    // Try to get IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = request.ip;
    
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    if (ip) {
      return ip;
    }
    
    // Fallback to a generic key if no IP found
    return 'anonymous';
  }
  
  /**
   * Create rate limit headers
   */
  createHeaders(result: RateLimitResult): HeadersInit {
    const headers: HeadersInit = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toISOString(),
    };
    
    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }
    
    return headers;
  }
  
  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy() {
    this.store.destroy();
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Strict: 5 requests per minute
  strict: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
  }),
  
  // Standard: 10 requests per minute
  standard: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
  
  // Relaxed: 30 requests per minute
  relaxed: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
  }),
  
  // API: 100 requests per minute
  api: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),
  
  // Auth: 5 requests per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),
};

// Helper function for easy use in API routes
export async function rateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = config ? new RateLimiter(config) : rateLimiters.standard;
  return limiter.checkLimit(request);
}