import { db } from '@/lib/db'
import { geo_composite_scores } from '@/db/schema/sources'

/**
 * Integrate GEO readiness scores into AIV calculation
 */
export async function calculateAIVWithGeo(tenantId: string, baseAIV: number): Promise<number> {
  try {
    // Get latest GEO composite score
    const geoComposite = await db.geo_composite_scores.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' }
    })

    if (!geoComposite) {
      // No GEO data available, return base AIV
      return baseAIV
    }

    // AIV_GEO = 0.6*geoChecklist + 0.2*topicalDepth + 0.1*extractability + 0.1*kgPresence
    const geoWeight = 0.15 // 15% weight for GEO factors in overall AIV
    const geoContribution = (geoComposite.aivGeoScore / 100) * geoWeight
    
    // Adjust base AIV with GEO contribution
    const adjustedAIV = baseAIV + (geoContribution * 100)
    
    return Math.min(100, Math.max(0, adjustedAIV))
  } catch (error) {
    console.error('Error calculating AIV with GEO:', error)
    return baseAIV
  }
}

/**
 * Adjust RaR (Risk and Return) based on GEO signals
 */
export async function calculateRaRWithGeo(tenantId: string, baseRaR: number): Promise<number> {
  try {
    const geoComposite = await db.geo_composite_scores.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' }
    })

    if (!geoComposite) {
      return baseRaR
    }

    // Apply RaR adjustment factor
    // Reduces expected leakage when AIO exposure is high and mention velocity is strong
    const adjustedRaR = baseRaR * geoComposite.rarAdjustmentFactor
    
    return Math.max(0, adjustedRaR)
  } catch (error) {
    console.error('Error calculating RaR with GEO:', error)
    return baseRaR
  }
}

/**
 * Calculate elasticity improvement with GEO signals
 */
export async function calculateElasticityWithGeo(tenantId: string, baseElasticity: number): Promise<{
  elasticity: number
  improvement: number
  confidence: number
}> {
  try {
    const geoComposite = await db.geo_composite_scores.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' }
    })

    if (!geoComposite) {
      return {
        elasticity: baseElasticity,
        improvement: 0,
        confidence: 0.5
      }
    }

    // Higher GEO scores improve elasticity (lower $ per +1% AIV)
    const geoImprovement = (geoComposite.aivGeoScore / 100) * 0.2 // Max 20% improvement
    const improvedElasticity = baseElasticity * (1 - geoImprovement)
    
    // Calculate confidence based on stability
    const confidence = geoComposite.isStable ? 0.9 : 0.6
    
    return {
      elasticity: improvedElasticity,
      improvement: geoImprovement,
      confidence
    }
  } catch (error) {
    console.error('Error calculating elasticity with GEO:', error)
    return {
      elasticity: baseElasticity,
      improvement: 0,
      confidence: 0.5
    }
  }
}

/**
 * Weekly GEO signals recomputation for elasticity model
 */
export async function recomputeGeoSignalsForElasticity(tenantId: string): Promise<void> {
  try {
    // Get all GEO signals from the last week
    const weeklySignals = await db.geo_signals.findMany({
      where: {
        tenantId,
        computedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { computedAt: 'desc' }
    })

    if (weeklySignals.length === 0) {
      console.log(`No GEO signals found for tenant ${tenantId} in the last week`)
      return
    }

    // Calculate weekly average
    const avgGeoChecklist = weeklySignals.reduce((sum, signal) => 
      sum + signal.geoChecklistScore, 0) / weeklySignals.length
    
    const avgAIOExposure = weeklySignals.reduce((sum, signal) => 
      sum + signal.aioExposurePct, 0) / weeklySignals.length
    
    const avgMentionVelocity = weeklySignals.reduce((sum, signal) => 
      sum + signal.mentionVelocity4w, 0) / weeklySignals.length

    // Update composite scores
    const aivGeoScore = Math.round(
      0.6 * avgGeoChecklist +
      0.2 * weeklySignals[0].topicalDepthScore +
      0.1 * weeklySignals[0].extractabilityScore +
      0.1 * (weeklySignals[0].kgPresent ? weeklySignals[0].kgCompleteness : 0)
    )

    const rarAdjustmentFactor = avgAIOExposure > 70 && avgMentionVelocity > 10 ? 0.9 : 1.0

    // Get previous score for change tracking
    const previousScore = await db.geo_composite_scores.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' }
    })

    const weeklyChange = previousScore ? aivGeoScore - (previousScore.aivGeoScore || 0) : 0
    const isStable = Math.abs(weeklyChange) <= 15

    await db.insert(geo_composite_scores).values({
      tenantId,
      aivGeoScore,
      rarAdjustmentFactor,
      weeklyChange,
      isStable
    })

    console.log(`GEO signals recomputed for tenant ${tenantId}: AIV=${aivGeoScore}, RaR=${rarAdjustmentFactor}`)
  } catch (error) {
    console.error('Error recomputing GEO signals:', error)
    throw error
  }
}

/**
 * Flag instability if GEO checklist score swings >15 points in <2 weeks
 */
export async function checkGeoStability(tenantId: string): Promise<{
  isStable: boolean
  maxChange: number
  recommendation: string
}> {
  try {
    const recentSignals = await db.geo_signals.findMany({
      where: {
        tenantId,
        computedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } // Last 2 weeks
      },
      orderBy: { computedAt: 'desc' },
      take: 4
    })

    if (recentSignals.length < 2) {
      return {
        isStable: true,
        maxChange: 0,
        recommendation: 'Insufficient data for stability analysis'
      }
    }

    // Calculate maximum change between consecutive signals
    const changes = recentSignals.slice(0, -1).map((current, index) => 
      Math.abs(current.geoChecklistScore - recentSignals[index + 1]?.geoChecklistScore || 0)
    )

    const maxChange = Math.max(...changes)
    const isStable = maxChange <= 15

    let recommendation = ''
    if (!isStable) {
      recommendation = 'GEO signals are unstable. Review recent optimization changes and ensure consistent implementation.'
    } else if (maxChange > 10) {
      recommendation = 'GEO signals show moderate volatility. Monitor optimization consistency.'
    } else {
      recommendation = 'GEO signals are stable. Continue current optimization strategy.'
    }

    return {
      isStable,
      maxChange,
      recommendation
    }
  } catch (error) {
    console.error('Error checking GEO stability:', error)
    return {
      isStable: false,
      maxChange: 0,
      recommendation: 'Error analyzing stability'
    }
  }
}
