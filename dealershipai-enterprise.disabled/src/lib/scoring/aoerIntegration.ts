import { db } from '@/lib/db'
import { generateAOERRollup, type QueryCheck } from '@/lib/metrics/aoer'

/**
 * Integrate AOER metrics into AIV (Algorithmic Visibility Index)
 */
export async function calculateAIVWithAOER(tenantId: string, baseAIV: number): Promise<number> {
  try {
    // Get recent AOER data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const queryChecks = await db.queryChecks.findMany({
      where: {
        tenantId,
        checkDate: { gte: thirtyDaysAgo }
      },
      include: {
        query: {
          select: {
            query: true,
            intent: true
          }
        }
      }
    })
    
    if (queryChecks.length === 0) {
      return baseAIV
    }
    
    // Transform to QueryCheck format
    const queries: QueryCheck[] = queryChecks.map(check => ({
      query: check.query.query,
      intent: check.query.intent as any,
      volume: check.volume,
      serpPosition: check.serpPosition,
      aiPresent: check.aiOverviewPresent,
      aiPosition: check.aiOverviewPosition as any,
      hasOurCitation: check.hasOurCitation,
      aiTokens: check.aiOverviewTokens,
      aiLinksCount: check.aiLinksCount,
      paaPresent: check.paaPresent,
      mapPackPresent: check.mapPackPresent,
      shoppingPresent: check.shoppingPresent
    }))
    
    const rollup = generateAOERRollup(queries)
    
    // AOER negatively impacts AIV (higher AOER = lower visibility)
    // Use prominence-weighted AOER as the main factor
    const aoerImpact = rollup.aoer.aoerPositionalWeighted * 0.2 // 20% weight
    
    // Citation share positively impacts AIV
    const citationImpact = rollup.citationShare * 0.1 // 10% weight
    
    // Calculate adjusted AIV
    const adjustedAIV = baseAIV * (1 - aoerImpact + citationImpact)
    
    return Math.min(100, Math.max(0, adjustedAIV))
  } catch (error) {
    console.error('Error calculating AIV with AOER:', error)
    return baseAIV
  }
}

/**
 * Integrate AOER metrics into ATR (Algorithmic Trust Index)
 */
export async function calculateATRWithAOER(tenantId: string, baseATR: number): Promise<number> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const queryChecks = await db.queryChecks.findMany({
      where: {
        tenantId,
        checkDate: { gte: thirtyDaysAgo }
      },
      include: {
        query: {
          select: {
            query: true,
            intent: true
          }
        }
      }
    })
    
    if (queryChecks.length === 0) {
      return baseATR
    }
    
    const queries: QueryCheck[] = queryChecks.map(check => ({
      query: check.query.query,
      intent: check.query.intent as any,
      volume: check.volume,
      serpPosition: check.serpPosition,
      aiPresent: check.aiOverviewPresent,
      aiPosition: check.aiOverviewPosition as any,
      hasOurCitation: check.hasOurCitation,
      aiTokens: check.aiOverviewTokens,
      aiLinksCount: check.aiLinksCount,
      paaPresent: check.paaPresent,
      mapPackPresent: check.mapPackPresent,
      shoppingPresent: check.shoppingPresent
    }))
    
    const rollup = generateAOERRollup(queries)
    
    // Citation share is a strong trust signal
    const citationTrustBoost = rollup.citationShare * 0.25 // 25% weight
    
    // Lower AI Claim Score indicates better trust (less at-risk)
    const claimScoreTrustBoost = (1 - rollup.avgAiClaimScore / 100) * 0.15 // 15% weight
    
    // Calculate adjusted ATR
    const adjustedATR = baseATR + (citationTrustBoost + claimScoreTrustBoost) * 100
    
    return Math.min(100, Math.max(0, adjustedATR))
  } catch (error) {
    console.error('Error calculating ATR with AOER:', error)
    return baseATR
  }
}

/**
 * Calculate Composite Reputation Score with AOER integration
 */
export async function calculateCompositeReputationWithAOER(
  tenantId: string, 
  aiv: number, 
  atr: number, 
  ugcResonance: number
): Promise<{
  score: number
  breakdown: {
    aiv: number
    atr: number
    ugc: number
    aoerImpact: number
  }
  clickLossImpact: number
}> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const queryChecks = await db.queryChecks.findMany({
      where: {
        tenantId,
        checkDate: { gte: thirtyDaysAgo }
      },
      include: {
        query: {
          select: {
            query: true,
            intent: true
          }
        }
      }
    })
    
    if (queryChecks.length === 0) {
      return {
        score: (aiv + atr + ugcResonance) / 3,
        breakdown: {
          aiv,
          atr,
          ugc: ugcResonance,
          aoerImpact: 0
        },
        clickLossImpact: 0
      }
    }
    
    const queries: QueryCheck[] = queryChecks.map(check => ({
      query: check.query.query,
      intent: check.query.intent as any,
      volume: check.volume,
      serpPosition: check.serpPosition,
      aiPresent: check.aiOverviewPresent,
      aiPosition: check.aiOverviewPosition as any,
      hasOurCitation: check.hasOurCitation,
      aiTokens: check.aiOverviewTokens,
      aiLinksCount: check.aiLinksCount,
      paaPresent: check.paaPresent,
      mapPackPresent: check.mapPackPresent,
      shoppingPresent: check.shoppingPresent
    }))
    
    const rollup = generateAOERRollup(queries)
    
    // Calculate AOER-adjusted scores
    const aivAdjusted = await calculateAIVWithAOER(tenantId, aiv)
    const atrAdjusted = await calculateATRWithAOER(tenantId, atr)
    
    // AOER impact on overall score
    const aoerImpact = rollup.aoer.aoerPositionalWeighted * -0.1 + // Negative impact from high AOER
                      rollup.citationShare * 0.05 // Positive impact from citations
    
    // Calculate composite score
    const compositeScore = (aivAdjusted + atrAdjusted + ugcResonance) / 3 + aoerImpact * 100
    
    return {
      score: Math.min(100, Math.max(0, compositeScore)),
      breakdown: {
        aiv: aivAdjusted,
        atr: atrAdjusted,
        ugc: ugcResonance,
        aoerImpact: aoerImpact * 100
      },
      clickLossImpact: rollup.estimatedMonthlyClickLoss
    }
  } catch (error) {
    console.error('Error calculating composite reputation with AOER:', error)
    return {
      score: (aiv + atr + ugcResonance) / 3,
      breakdown: {
        aiv,
        atr,
        ugc: ugcResonance,
        aoerImpact: 0
      },
      clickLossImpact: 0
    }
  }
}

/**
 * Generate AOER-based optimization recommendations
 */
export async function generateAOEROptimizationRecommendations(tenantId: string): Promise<Array<{
  type: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  expectedImpact: string
  queries: string[]
}>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const queryChecks = await db.queryChecks.findMany({
      where: {
        tenantId,
        checkDate: { gte: thirtyDaysAgo }
      },
      include: {
        query: {
          select: {
            query: true,
            intent: true
          }
        }
      }
    })
    
    if (queryChecks.length === 0) {
      return []
    }
    
    const queries: QueryCheck[] = queryChecks.map(check => ({
      query: check.query.query,
      intent: check.query.intent as any,
      volume: check.volume,
      serpPosition: check.serpPosition,
      aiPresent: check.aiOverviewPresent,
      aiPosition: check.aiOverviewPosition as any,
      hasOurCitation: check.hasOurCitation,
      aiTokens: check.aiOverviewTokens,
      aiLinksCount: check.aiLinksCount,
      paaPresent: check.paaPresent,
      mapPackPresent: check.mapPackPresent,
      shoppingPresent: check.shoppingPresent
    }))
    
    const rollup = generateAOERRollup(queries)
    const recommendations = []
    
    // High AOER recommendations
    if (rollup.aoer.aoerPositionalWeighted > 0.6) {
      const highAOERQueries = rollup.topPriorityQueries
        .filter(q => q.aiClaimScore > 70)
        .slice(0, 5)
        .map(q => q.query)
      
      recommendations.push({
        type: 'high_aoer',
        priority: 'high' as const,
        title: 'Optimize for AI-Friendly Content',
        description: 'High AI Overview exposure detected. Focus on content that AI can easily understand and cite.',
        action: 'Add FAQ blocks, structured data, and clear answer formats',
        expectedImpact: 'Reduce AI claim scores and improve citation rates',
        queries: highAOERQueries
      })
    }
    
    // Low citation share recommendations
    if (rollup.citationShare < 0.3) {
      const uncitedQueries = rollup.topPriorityQueries
        .filter(q => q.aiClaimScore > 60)
        .slice(0, 5)
        .map(q => q.query)
      
      recommendations.push({
        type: 'low_citations',
        priority: 'high' as const,
        title: 'Improve Citation Capture',
        description: 'Low citation share in AI Overviews. Enhance content authority and trust signals.',
        action: 'Add authoritative sources, improve E-E-A-T signals, and optimize for featured snippets',
        expectedImpact: 'Increase AI citation rate and improve trust scores',
        queries: uncitedQueries
      })
    }
    
    // High click loss recommendations
    if (rollup.estimatedMonthlyClickLoss > 500) {
      const highLossQueries = rollup.topPriorityQueries
        .filter(q => q.clickLoss > 50)
        .slice(0, 5)
        .map(q => q.query)
      
      recommendations.push({
        type: 'high_click_loss',
        priority: 'medium' as const,
        title: 'Recover Lost Traffic',
        description: 'Significant estimated click loss from AI Overviews. Focus on traffic recovery strategies.',
        action: 'Optimize for featured snippets, improve SERP visibility, and create AI-resistant content',
        expectedImpact: 'Recover lost traffic and improve overall visibility',
        queries: highLossQueries
      })
    }
    
    return recommendations
  } catch (error) {
    console.error('Error generating AOER optimization recommendations:', error)
    return []
  }
}
