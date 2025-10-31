/**
 * API Rate Limiter
 * Provides rate limiting functionality for API endpoints
 */

import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();
  private requests: Map<string, number[]> = new Map();
  
  constructor(private config: RateLimitConfig) {}

  static getInstance(key: string, config: RateLimitConfig): RateLimiter {
    if (!RateLimiter.instances.has(key)) {
      RateLimiter.instances.set(key, new RateLimiter(config));
    }
    return RateLimiter.instances.get(key)!;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create request history for this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const requestHistory = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = requestHistory.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, validRequests);
    
    const currentCount = validRequests.length;
    const remaining = Math.max(0, this.config.maxRequests - currentCount);
    const resetTime = now + this.config.windowMs;
    
    if (currentCount >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(this.config.windowMs / 1000)
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: remaining - 1,
      resetTime
    };
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Default rate limiter configurations
export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later.'
};

export const strictRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Rate limit exceeded. Please slow down your requests.'
};

export const permissiveRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000,
  message: 'Rate limit exceeded.'
};

// Helper function to get client identifier from request
export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

// Helper function to create rate limiter middleware
export function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const identifier = getClientIdentifier(req);
    const rateLimiter = RateLimiter.getInstance('api', config);
    return rateLimiter.check(identifier);
  };
}

// Health check function for rate limiter
export async function checkRateLimitHealth(): Promise<boolean> {
  try {
    // Test rate limiter functionality
    const testLimiter = new RateLimiter({
      windowMs: 1000,
      maxRequests: 10
    });
    
    const result = testLimiter.check('health-check');
    return result.success;
  } catch (error) {
    console.error('Rate limiter health check failed:', error);
    return false;
  }
}