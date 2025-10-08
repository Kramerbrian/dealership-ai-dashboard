import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { geo_signals, geo_composite_scores, external_sources } from '@/db/schema/sources'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params
    
    // Get latest GEO signals for the tenant
    const latestSignals = await db.geo_signals.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' },
      include: {
        source: {
          select: {
            provider: true,
            url: true,
            title: true,
            fetchedAt: true
          }
        }
      }
    })
    
    // Get latest composite scores
    const latestComposite = await db.geo_composite_scores.findFirst({
      where: { tenantId },
      orderBy: { computedAt: 'desc' }
    })
    
    // Get historical trend (last 4 weeks)
    const historicalSignals = await db.geo_signals.findMany({
      where: { 
        tenantId,
        computedAt: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { computedAt: 'desc' },
      take: 4
    })
    
    if (!latestSignals) {
      return NextResponse.json({
        error: 'No GEO signals found for this tenant',
        signals: null,
        composite: null,
        trend: []
      })
    }
    
    // Calculate trend indicators
    const trend = historicalSignals.map(signal => ({
      date: signal.computedAt,
      geoChecklistScore: signal.geoChecklistScore,
      aioExposurePct: signal.aioExposurePct,
      aivGeoScore: latestComposite?.aivGeoScore || 0
    }))
    
    // Calculate stability metrics
    const scoreChanges = trend.slice(0, -1).map((current, index) => 
      Math.abs(current.geoChecklistScore - trend[index + 1]?.geoChecklistScore || 0)
    )
    
    const maxChange = Math.max(...scoreChanges, 0)
    const isStable = maxChange <= 15
    
    const response = {
      signals: {
        id: latestSignals.id,
        geoChecklistScore: latestSignals.geoChecklistScore,
        aioExposurePct: latestSignals.aioExposurePct,
        topicalDepthScore: latestSignals.topicalDepthScore,
        kgPresent: latestSignals.kgPresent,
        kgCompleteness: latestSignals.kgCompleteness,
        mentionVelocity4w: latestSignals.mentionVelocity4w,
        extractabilityScore: latestSignals.extractabilityScore,
        computedAt: latestSignals.computedAt,
        source: latestSignals.source
      },
      composite: latestComposite ? {
        aivGeoScore: latestComposite.aivGeoScore,
        rarAdjustmentFactor: latestComposite.rarAdjustmentFactor,
        weeklyChange: latestComposite.weeklyChange,
        isStable: latestComposite.isStable
      } : null,
      trend,
      stability: {
        isStable,
        maxWeeklyChange: maxChange,
        trendDirection: trend.length > 1 ? 
          (trend[0].geoChecklistScore > trend[1].geoChecklistScore ? 'up' : 'down') : 'stable'
      },
      recommendations: generateRecommendations(latestSignals, latestComposite)
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching GEO signals:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GEO signals',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Generate actionable recommendations based on GEO signals
 */
function generateRecommendations(signals: any, composite: any) {
  const recommendations = []
  
  if (signals.geoChecklistScore < 70) {
    recommendations.push({
      type: 'geo_checklist',
      priority: 'high',
      message: 'Improve technical SEO fundamentals',
      action: 'Focus on crawlability, speed, and structure optimization'
    })
  }
  
  if (signals.aioExposurePct < 50) {
    recommendations.push({
      type: 'aio_exposure',
      priority: 'medium',
      message: 'Increase AI Overview exposure potential',
      action: 'Optimize content for AI-friendly formats and keywords'
    })
  }
  
  if (!signals.kgPresent) {
    recommendations.push({
      type: 'knowledge_graph',
      priority: 'high',
      message: 'Establish knowledge graph presence',
      action: 'Create structured data and entity relationships'
    })
  }
  
  if (signals.mentionVelocity4w < 5) {
    recommendations.push({
      type: 'mention_velocity',
      priority: 'medium',
      message: 'Increase brand mention velocity',
      action: 'Focus on PR, partnerships, and content marketing'
    })
  }
  
  if (signals.extractabilityScore < 60) {
    recommendations.push({
      type: 'extractability',
      priority: 'low',
      message: 'Improve content structure',
      action: 'Add more headings, lists, and structured formatting'
    })
  }
  
  if (composite && !composite.isStable) {
    recommendations.push({
      type: 'stability',
      priority: 'high',
      message: 'GEO signals are unstable',
      action: 'Review recent changes and ensure consistent optimization'
    })
  }
  
  return recommendations
}
