/**
 * Onboarding Analysis API Route
 * Analyzes dealership domain and returns personalized insights
 * 
 * ✅ Migrated to new security middleware:
 * - Input validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiRoute } from '@/lib/api-wrapper'
import { analyzeDomainSchema, validateRequestBody } from '@/lib/validation/schemas'
import { personalizationEngine } from '@/lib/onboarding/personalization-engine'
import { CacheManager } from '@/lib/cache'
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { errorResponse, cachedResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { CACHE_TAGS } from '@/lib/cache-tags'

export const POST = createApiRoute(
  {
    endpoint: '/api/onboarding/analyze',
    requireAuth: false, // Public endpoint for onboarding flow
    validateBody: analyzeDomainSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown'
    
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, analyzeDomainSchema)
      if (!bodyValidation.success) {
        return bodyValidation.response
      }

      const { domain } = bodyValidation.data

      await logger.info('Onboarding analysis requested', {
        requestId,
        domain,
        userId: auth?.userId,
      })

      // Normalize domain
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '')
      const cleanDomain = `www.${normalizedDomain}`

      // Check cache first
      const cache = new CacheManager()
      const cacheKey = `${CACHE_KEYS.ONBOARDING_ANALYSIS}:${cleanDomain}`
      const cached = await cache.get(cacheKey)
      
      if (cached) {
        await logger.info('Onboarding analysis cache hit', {
          requestId,
          domain: cleanDomain,
        })
        
        return cachedResponse(
          cached,
          60, // 1 min cache
          300, // 5 min stale
          [CACHE_TAGS.ONBOARDING_ANALYSIS]
        )
      }

      // Initialize profile with personalization engine
      const profile = await personalizationEngine.initializeProfile(cleanDomain)
      
      // Generate additional insights
      const insights = {
        profile,
        recommendations: generateRecommendations(profile),
        competitiveAnalysis: generateCompetitiveAnalysis(profile),
        marketOpportunity: calculateMarketOpportunity(profile),
        nextSteps: generateNextSteps(profile),
      }

      // Cache the results
      await cache.set(cacheKey, insights, CACHE_TTL.ONBOARDING_ANALYSIS)

      await logger.info('Onboarding analysis completed', {
        requestId,
        domain: cleanDomain,
      })

      return cachedResponse(
        insights,
        60, // 1 min cache
        300, // 5 min stale
        [CACHE_TAGS.ONBOARDING_ANALYSIS]
      )
    } catch (error) {
      await logger.error('Error analyzing domain', {
        requestId,
        domain,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/onboarding/analyze',
        userId: auth?.userId,
      })
    }
  }
)

function generateRecommendations(profile: any): string[] {
  const recommendations = []
  
  if (profile.aiVisibility < 30) {
    recommendations.push('Implement comprehensive schema markup for better AI understanding')
    recommendations.push('Create FAQ content targeting common customer questions')
    recommendations.push('Optimize Google Business Profile with detailed information')
  }
  
  if (profile.revenueAtRisk > 50000) {
    recommendations.push('Prioritize high-impact AI visibility improvements')
    recommendations.push('Set up automated monitoring for AI mentions')
    recommendations.push('Implement review response automation')
  }
  
  if (profile.competitors.length > 3) {
    recommendations.push('Focus on competitive differentiation in AI responses')
    recommendations.push('Monitor competitor AI visibility strategies')
    recommendations.push('Develop unique value propositions for AI platforms')
  }
  
  return recommendations
}

function generateCompetitiveAnalysis(profile: any): any {
  return {
    marketPosition: calculateMarketPosition(profile),
    competitiveAdvantages: [
      'AI-optimized content structure',
      'Comprehensive local SEO signals',
      'Automated review management',
    ],
    threats: [
      'Competitors with higher AI visibility',
      'Market saturation in local area',
      'Changing AI algorithm preferences',
    ],
    opportunities: [
      'First-mover advantage in AI optimization',
      'Untapped local market segments',
      'Cross-platform AI visibility expansion',
    ],
  }
}

function calculateMarketPosition(profile: any): string {
  if (profile.aiVisibility > 70) return 'Leader'
  if (profile.aiVisibility > 50) return 'Strong'
  if (profile.aiVisibility > 30) return 'Average'
  return 'Behind'
}

function calculateMarketOpportunity(profile: any): any {
  const potentialRevenue = profile.revenueAtRisk * 0.8 // 80% recovery potential
  const timeToRecovery = profile.aiVisibility < 30 ? '3-6 months' : '1-3 months'
  
  return {
    potentialRevenue,
    timeToRecovery,
    confidence: profile.aiVisibility < 30 ? 'High' : 'Medium',
    keyDrivers: [
      'AI visibility improvement',
      'Local search optimization',
      'Review management automation',
    ],
  }
}

function generateNextSteps(profile: any): string[] {
  const steps = [
    'Connect your Google Analytics and Search Console accounts',
    'Set up automated AI visibility monitoring',
    'Implement schema markup for key pages',
  ]
  
  if (profile.aiVisibility < 30) {
    steps.unshift('Create comprehensive FAQ content')
    steps.unshift('Optimize Google Business Profile')
  }
  
  if (profile.revenueAtRisk > 75000) {
    steps.push('Set up advanced review response automation')
    steps.push('Implement competitive monitoring')
  }
  
  return steps
}
