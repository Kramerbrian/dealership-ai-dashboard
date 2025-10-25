/**
 * Rate Limiter for API Protection
 * Implements sliding window rate limiting
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];
    
    // Remove requests outside the window
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (keyRequests.length >= this.config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: Math.min(...keyRequests) + this.config.windowMs
      };
    }
    
    // Add current request
    keyRequests.push(now);
    this.requests.set(key, keyRequests);
    
    return {
      success: true,
      remaining: this.config.maxRequests - keyRequests.length,
      resetTime: now + this.config.windowMs
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => 
        timestamp > now - this.config.windowMs
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Default rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
});

// Health check function
export async function checkRateLimitHealth(): Promise<{ status: string; details?: any }> {
  try {
    // Test rate limiter functionality
    const testKey = 'health-check';
    const result = await apiRateLimiter.checkLimit(testKey);
    
    return {
      status: 'healthy',
      details: {
        testResult: result.success,
        remaining: result.remaining
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// Redis health check (mock implementation)
export async function checkRedisHealth(): Promise<boolean> {
  try {
    // In a real implementation, this would check Redis connectivity
    // For now, we'll simulate a successful check
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Cleanup interval
setInterval(() => {
  apiRateLimiter.cleanup();
  strictRateLimiter.cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes