/**
 * API Error Handler for DealershipAI
 * Handles rate limits, usage limits, and other API errors gracefully
 */

export interface APIError {
  type: string;
  message: string;
  code?: string;
  retryAfter?: number;
  resetTime?: string;
}

export interface APIErrorResponse {
  success: false;
  error: APIError;
  fallback?: any;
}

export class APIErrorHandler {
  /**
   * Parse API error response and determine appropriate action
   */
  static parseError(error: any): APIError {
    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        return this.parseError(parsed);
      } catch {
        return {
          type: 'unknown',
          message: error
        };
      }
    }

    if (error?.error) {
      return {
        type: error.error.type || 'api_error',
        message: error.error.message || 'API request failed',
        code: error.error.code,
        retryAfter: this.extractRetryAfter(error),
        resetTime: this.extractResetTime(error)
      };
    }

    return {
      type: 'unknown',
      message: error?.message || 'Unknown error occurred'
    };
  }

  /**
   * Check if error is a rate limit or usage limit
   */
  static isRateLimitError(error: APIError): boolean {
    return error.type.includes('rate_limit') || 
           error.type.includes('usage_limit') ||
           error.message.includes('rate limit') ||
           error.message.includes('usage limit') ||
           error.message.includes('quota exceeded');
  }

  /**
   * Check if error is a workspace limit
   */
  static isWorkspaceLimitError(error: APIError): boolean {
    return error.message.includes('workspace') && 
           error.message.includes('usage limits');
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: APIError): string {
    if (this.isWorkspaceLimitError(error)) {
      return "AI service usage limit reached. The system will automatically retry when limits reset.";
    }

    if (this.isRateLimitError(error)) {
      return "API rate limit reached. Please wait a moment and try again.";
    }

    if (error.message.includes('API key')) {
      return "API configuration issue. Please check your API keys.";
    }

    return error.message || "An unexpected error occurred. Please try again.";
  }

  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(error: APIError): number {
    if (error.retryAfter) {
      return error.retryAfter * 1000;
    }

    if (this.isRateLimitError(error)) {
      return 60000; // 1 minute
    }

    if (this.isWorkspaceLimitError(error)) {
      return 3600000; // 1 hour
    }

    return 5000; // 5 seconds default
  }

  /**
   * Extract retry-after header value
   */
  private static extractRetryAfter(error: any): number | undefined {
    if (error.headers?.['retry-after']) {
      return parseInt(error.headers['retry-after']);
    }
    return undefined;
  }

  /**
   * Extract reset time from error message
   */
  private static extractResetTime(error: any): string | undefined {
    const message = error.error?.message || error.message || '';
    const match = message.match(/(\d{4}-\d{2}-\d{2} at \d{2}:\d{2} UTC)/);
    return match ? match[1] : undefined;
  }

  /**
   * Create fallback response for when APIs are unavailable
   */
  static createFallbackResponse(service: string, originalRequest?: any): any {
    const fallbacks = {
      openai: {
        response: "AI service temporarily unavailable. Using cached data.",
        confidence: 0.7,
        cached: true
      },
      anthropic: {
        response: "AI service temporarily unavailable. Using cached data.",
        confidence: 0.7,
        cached: true
      },
      semrush: {
        data: [],
        message: "SEO data service temporarily unavailable."
      },
      yelp: {
        reviews: [],
        message: "Review data service temporarily unavailable."
      },
      pagespeed: {
        score: 75,
        message: "Performance data service temporarily unavailable."
      }
    };

    return fallbacks[service as keyof typeof fallbacks] || {
      message: `${service} service temporarily unavailable.`,
      fallback: true
    };
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryManager {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;

  static async withRetry<T>(
    operation: () => Promise<T>,
    service: string,
    delay: number = 1000
  ): Promise<T> {
    const key = `${service}-${Date.now()}`;
    let attempts = this.retryAttempts.get(key) || 0;

    try {
      const result = await operation();
      this.retryAttempts.delete(key);
      return result;
    } catch (error) {
      attempts++;
      this.retryAttempts.set(key, attempts);

      if (attempts >= this.maxRetries) {
        this.retryAttempts.delete(key);
        throw error;
      }

      const backoffDelay = delay * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      
      return this.withRetry(operation, service, delay);
    }
  }
}

/**
 * API Status Monitor
 */
export class APIStatusMonitor {
  private static status = new Map<string, {
    available: boolean;
    lastError?: APIError;
    retryAfter?: number;
    resetTime?: string;
  }>();

  static updateStatus(service: string, error?: APIError) {
    if (error) {
      this.status.set(service, {
        available: false,
        lastError: error,
        retryAfter: error.retryAfter,
        resetTime: error.resetTime
      });
    } else {
      this.status.set(service, {
        available: true
      });
    }
  }

  static isServiceAvailable(service: string): boolean {
    const status = this.status.get(service);
    if (!status) return true;

    if (!status.available && status.retryAfter) {
      // Check if retry time has passed
      const now = Date.now();
      const retryTime = now + (status.retryAfter * 1000);
      if (now >= retryTime) {
        this.status.set(service, { available: true });
        return true;
      }
    }

    return status.available;
  }

  static getServiceStatus(service: string) {
    return this.status.get(service);
  }

  static getAllStatuses() {
    return Object.fromEntries(this.status);
  }
}
