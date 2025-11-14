// Session tracking and tier limits management

import { redis, cacheKeys } from './redis'
import { prisma } from './database'

export type SessionAction = 
  | 'qai_calculation'
  | 'competitor_analysis' 
  | 'mystery_shop'
  | 'ai_platform_query'
  | 'review_analysis'

interface SessionLimit {
  FREE: number
  PRO: number
  ENTERPRISE: number
}

const SESSION_LIMITS: Record<SessionAction, SessionLimit> = {
  qai_calculation: { FREE: 5, PRO: 50, ENTERPRISE: 200 },
  competitor_analysis: { FREE: 0, PRO: 10, ENTERPRISE: 50 },
  mystery_shop: { FREE: 0, PRO: 0, ENTERPRISE: 5 },
  ai_platform_query: { FREE: 0, PRO: 20, ENTERPRISE: 100 },
  review_analysis: { FREE: 0, PRO: 25, ENTERPRISE: 100 }
}

export async function trackSession(
  dealershipId: string,
  action: SessionAction,
  userId: string
): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  try {
    // Get user's current tier
    const user = await (prisma.user.findUnique as any)({
      where: { clerk_id: userId },
      select: { tier: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const tier = (user as any).tier as keyof SessionLimit
    const limit = SESSION_LIMITS[action][tier]

    // Check if user has access to this action
    if (limit === 0) {
      return {
        allowed: false,
        remaining: 0,
        tier
      }
    }

    // Get current usage for this month
    const cacheKey = `user:${userId}:sessions:${action}`
    const currentUsage = await redis.get<number>(cacheKey) || 0

    // Check if limit exceeded
    if (currentUsage >= limit) {
      return {
        allowed: false,
        remaining: 0,
        tier
      }
    }

    // Increment usage
    const newUsage = currentUsage + 1
    await redis.setex(cacheKey, 86400 * 30, newUsage) // 30 days TTL

    // Log session in database (mock implementation - no session table)
    console.log(`Session tracked: ${dealershipId}, ${userId}, ${action}`)

    return {
      allowed: true,
      remaining: limit - newUsage,
      tier
    }
  } catch (error) {
    console.error('Session tracking error:', error)
    throw new Error('Failed to track session')
  }
}

export async function getSessionUsage(userId: string): Promise<{
  tier: string
  limits: Record<SessionAction, number>
  usage: Record<SessionAction, number>
  remaining: Record<SessionAction, number>
}> {
  try {
    const user = await (prisma.user.findUnique as any)({
      where: { clerk_id: userId },
      select: { tier: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const tier = (user as any).tier as keyof SessionLimit
    const limits: Record<SessionAction, number> = {} as any
    const usage: Record<SessionAction, number> = {} as any
    const remaining: Record<SessionAction, number> = {} as any

    // Get limits and usage for each action
    for (const action of Object.keys(SESSION_LIMITS) as SessionAction[]) {
      limits[action] = SESSION_LIMITS[action][tier]

      const cacheKey = `user:${userId}:sessions:${action}`
      const currentUsage = await redis.get<number>(cacheKey) || 0
      usage[action] = currentUsage
      remaining[action] = Math.max(0, limits[action] - currentUsage)
    }

    return {
      tier,
      limits,
      usage,
      remaining
    }
  } catch (error) {
    console.error('Get session usage error:', error)
    throw new Error('Failed to get session usage')
  }
}

export async function resetSessionUsage(userId: string): Promise<void> {
  try {
    // Reset all session types for the user
    for (const action of Object.keys(SESSION_LIMITS) as SessionAction[]) {
      const cacheKey = `user:${userId}:sessions:${action}`
      await redis.del(cacheKey)
    }
    console.log(`Reset session usage for user: ${userId}`)
  } catch (error) {
    console.error('Reset session usage error:', error)
    throw new Error('Failed to reset session usage')
  }
}
