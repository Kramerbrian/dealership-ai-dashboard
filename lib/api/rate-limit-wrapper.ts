/**
 * Rate Limiting Wrapper for API Routes
 * Provides consistent rate limiting across all endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiErrors } from './error-handler'

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  identifier?: (req: NextRequest) => string
}

const defaultIdentifier = (req: NextRequest): string => {
  // Use IP address or user ID
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return ip
}

/**
 * Create a rate-limited route handler
 */
export function withRateLimit<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  const {
    maxRequests = 100,
    windowMs = 60000, // 1 minute default
    identifier = defaultIdentifier,
  } = config

  return async (req: NextRequest, ...args: T[]): Promise<NextResponse> => {
    const id = identifier(req)
    const now = Date.now()
    const key = `${id}:${Math.floor(now / windowMs)}`

    // Get current count
    const current = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs }

    // Check if limit exceeded
    if (current.count >= maxRequests) {
      return apiErrors.rateLimit(
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`
      )
    }

    // Increment count
    current.count++
    rateLimitStore.set(key, current)

    // Clean up old entries (keep last 10 windows)
    if (rateLimitStore.size > 1000) {
      const cutoff = now - windowMs * 10
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetAt < cutoff) {
          rateLimitStore.delete(k)
        }
      }
    }

    // Add rate limit headers
    const response = await handler(req, ...args)
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(current.resetAt).toISOString())

    return response
  }
}

/**
 * Pre-configured rate limiters for different endpoint types
 */
export const rateLimiters = {
  // Strict rate limiting for expensive operations
  strict: (handler: any) =>
    withRateLimit(handler, { maxRequests: 10, windowMs: 60000 }),

  // Standard rate limiting for most endpoints
  standard: (handler: any) =>
    withRateLimit(handler, { maxRequests: 100, windowMs: 60000 }),

  // Lenient rate limiting for public endpoints
  lenient: (handler: any) =>
    withRateLimit(handler, { maxRequests: 1000, windowMs: 60000 }),

  // Custom rate limiting
  custom: (maxRequests: number, windowMs: number) => (handler: any) =>
    withRateLimit(handler, { maxRequests, windowMs }),
}

