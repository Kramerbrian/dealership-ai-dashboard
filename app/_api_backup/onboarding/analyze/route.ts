/**
 * Onboarding Analysis API Route
 * Analyzes dealership domain and returns personalized insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { personalizationEngine } from '@/lib/onboarding/personalization-engine'
import { CacheManager } from '@/lib/cache'
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json()
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Normalize domain
    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const cleanDomain = `www.${normalizedDomain}`

    // Check cache first
    const cache = new CacheManager() as any
    const cacheKey = `${(CACHE_KEYS as any).ONBOARDING_ANALYSIS}:${cleanDomain}`
    const cached = await cache.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
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
    await cache.set(cacheKey, insights, (CACHE_TTL as any).ONBOARDING_ANALYSIS)

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error analyzing domain:', error)
    return NextResponse.json(
      { error: 'Failed to analyze domain' },
      { status: 500 }
    )
  }
}

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
