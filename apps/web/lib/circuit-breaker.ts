/**
 * Circuit Breaker System
 * DealershipAI - Resilient Crawl and Engine Operations
 * 
 * This module provides circuit breaker functionality for external API calls,
 * crawls, and engine operations with exponential backoff and retry logic.
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  recoveryTimeout: number // Time in ms before attempting recovery
  monitoringPeriod: number // Time window for failure counting
  maxRetries: number // Maximum retry attempts
  retryDelay: number // Initial retry delay in ms
  maxRetryDelay: number // Maximum retry delay in ms
  backoffMultiplier: number // Exponential backoff multiplier
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: number
  nextAttemptTime: number
  successCount: number
  totalRequests: number
  totalFailures: number
}

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  maxRetryDelay?: number
  backoffMultiplier?: number
  retryCondition?: (error: any) => boolean
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private name: string

  constructor(
    name: string, 
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.name = name
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      maxRetryDelay: 30000, // 30 seconds
      backoffMultiplier: 2,
      ...config
    }

    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0,
      totalFailures: 0
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    this.state.totalRequests++

    // Check if circuit is open
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error(`Circuit breaker ${this.name} is OPEN. Next attempt at ${new Date(this.state.nextAttemptTime).toISOString()}`)
      }
      this.state.state = 'HALF_OPEN'
    }

    try {
      const result = await this.executeWithRetry(operation, retryOptions)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const {
      maxRetries = this.config.maxRetries,
      retryDelay = this.config.retryDelay,
      maxRetryDelay = this.config.maxRetryDelay,
      backoffMultiplier = this.config.backoffMultiplier,
      retryCondition = () => true
    } = options

    let lastError: any
    let currentDelay = retryDelay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // Check if we should retry
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error
        }

        // Wait before retry with exponential backoff
        await this.delay(currentDelay)
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxRetryDelay)
      }
    }

    throw lastError
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.state.successCount++
    this.state.failureCount = 0

    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'CLOSED'
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.state.failureCount++
    this.state.totalFailures++
    this.state.lastFailureTime = Date.now()

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'OPEN'
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return { ...this.state }
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): {
    name: string
    state: string
    failureRate: number
    successRate: number
    totalRequests: number
    totalFailures: number
    failureCount: number
    nextAttemptTime?: Date
  } {
    const failureRate = this.state.totalRequests > 0 ? 
      (this.state.totalFailures / this.state.totalRequests) * 100 : 0
    const successRate = 100 - failureRate

    return {
      name: this.name,
      state: this.state.state,
      failureRate: Math.round(failureRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      totalRequests: this.state.totalRequests,
      totalFailures: this.state.totalFailures,
      failureCount: this.state.failureCount,
      nextAttemptTime: this.state.nextAttemptTime > 0 ? 
        new Date(this.state.nextAttemptTime) : undefined
    }
  }

  /**
   * Reset circuit breaker state
   */
  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0,
      totalFailures: 0
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Circuit Breaker Manager for multiple services
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>()

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): Array<ReturnType<CircuitBreaker['getStats']>> {
    return Array.from(this.breakers.values()).map(breaker => breaker.getStats())
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset())
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(name: string): void {
    const breaker = this.breakers.get(name)
    if (breaker) {
      breaker.reset()
    }
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager()

// Predefined circuit breakers for common services
export const crawlerBreaker = circuitBreakerManager.getBreaker('crawler', {
  failureThreshold: 3,
  recoveryTimeout: 30000,
  maxRetries: 2,
  retryDelay: 2000
})

export const engineBreaker = circuitBreakerManager.getBreaker('engine', {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  maxRetries: 3,
  retryDelay: 1000
})

export const apiBreaker = circuitBreakerManager.getBreaker('api', {
  failureThreshold: 10,
  recoveryTimeout: 30000,
  maxRetries: 2,
  retryDelay: 500
})

// Utility functions for common retry conditions
export const retryConditions = {
  // Retry on network errors
  networkError: (error: any) => {
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' || 
           error.code === 'ENOTFOUND' ||
           error.message?.includes('timeout') ||
           error.message?.includes('network')
  },

  // Retry on HTTP 5xx errors
  serverError: (error: any) => {
    return error.status >= 500 && error.status < 600
  },

  // Retry on rate limiting
  rateLimit: (error: any) => {
    return error.status === 429 || 
           error.message?.includes('rate limit') ||
           error.message?.includes('too many requests')
  },

  // Retry on temporary failures
  temporary: (error: any) => {
    return retryConditions.networkError(error) || 
           retryConditions.serverError(error) || 
           retryConditions.rateLimit(error)
  }
}

// Decorator for automatic circuit breaker protection
export function withCircuitBreaker(
  breakerName: string,
  config?: Partial<CircuitBreakerConfig>,
  retryOptions?: RetryOptions
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const breaker = circuitBreakerManager.getBreaker(breakerName, config)

    descriptor.value = async function (...args: any[]) {
      return breaker.execute(
        () => method.apply(this, args),
        retryOptions
      )
    }
  }
}

// Example usage:
// @withCircuitBreaker('crawler', { failureThreshold: 3 }, { maxRetries: 2 })
// async crawlPage(url: string) { ... }
