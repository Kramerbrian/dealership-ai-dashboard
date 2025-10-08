import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  generateAOERRollup, 
  computeAOERByIntent, 
  calculateAOERTrends,
  generateAOERRecommendations,
  type QueryCheck 
} from '@/lib/metrics/aoer'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params
    
    // Get query checks from the last 30 days
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
      },
      orderBy: { checkDate: 'desc' }
    })
    
    if (queryChecks.length === 0) {
      return NextResponse.json({
        error: 'No query data found for this tenant',
        rollup: null,
        intentBreakdown: {},
        trends: null,
        recommendations: []
      })
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
    
    // Generate comprehensive rollup
    const rollup = generateAOERRollup(queries)
    
    // Calculate intent breakdown
    const intentBreakdown = computeAOERByIntent(queries)
    
    // Calculate trends (compare last 15 days vs previous 15 days)
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    const currentQueries = queries.filter(q => 
      queryChecks.find(c => c.query.query === q.query)?.checkDate >= fifteenDaysAgo
    )
    const previousQueries = queries.filter(q => 
      queryChecks.find(c => c.query.query === q.query)?.checkDate < fifteenDaysAgo
    )
    
    const trends = previousQueries.length > 0 ? 
      calculateAOERTrends(currentQueries, previousQueries) : null
    
    // Generate recommendations
    const recommendations = generateAOERRecommendations(rollup)
    
    const response = {
      rollup: {
        aoer: {
          unweighted: rollup.aoer.aoer,
          volumeWeighted: rollup.aoer.aoerWeighted,
          positional: rollup.aoer.aoerPositional,
          positionalWeighted: rollup.aoer.aoerPositionalWeighted
        },
        avgAiClaimScore: rollup.avgAiClaimScore,
        citationShare: rollup.citationShare,
        estimatedMonthlyClickLoss: rollup.estimatedMonthlyClickLoss,
        totalQueries: rollup.totalQueries,
        queriesWithAI: rollup.queriesWithAI,
        topPriorityQueries: rollup.topPriorityQueries
      },
      intentBreakdown: Object.entries(intentBreakdown).map(([intent, metrics]) => ({
        intent,
        aoer: metrics.aoer,
        aoerWeighted: metrics.aoerWeighted,
        queryCount: queries.filter(q => q.intent === intent).length
      })),
      trends,
      recommendations,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching AOER data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch AOER data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params
    const body = await request.json()
    
    // Validate required fields
    const { query, intent, volume, serpPosition, aiPresent, aiPosition, hasOurCitation } = body
    
    if (!query || !intent || !volume || typeof aiPresent !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Find or create query
    let queryRecord = await db.queries.findFirst({
      where: {
        tenantId,
        query
      }
    })
    
    if (!queryRecord) {
      queryRecord = await db.queries.insert({
        tenant_id: tenantId,
        query,
        intent,
        locality: body.locality
      })
    }
    
    // Create query check
    const checkRecord = await db.queryChecks.insert({
      query_id: queryRecord.id,
      tenant_id: tenantId,
      check_date: new Date(),
      volume,
      serp_position: serpPosition,
      ai_overview_present: aiPresent,
      ai_overview_position: aiPosition || 'none',
      has_our_citation: hasOurCitation || false,
      ai_overview_tokens: body.aiTokens || 0,
      ai_links_count: body.aiLinksCount || 0,
      paa_present: body.paaPresent || false,
      map_pack_present: body.mapPackPresent || false,
      shopping_present: body.shoppingPresent || false
    })
    
    // Calculate and store metrics
    const queryCheck: QueryCheck = {
      query,
      intent,
      volume,
      serpPosition,
      aiPresent,
      aiPosition: aiPosition || 'none',
      hasOurCitation: hasOurCitation || false,
      aiTokens: body.aiTokens,
      aiLinksCount: body.aiLinksCount,
      paaPresent: body.paaPresent,
      mapPackPresent: body.mapPackPresent,
      shoppingPresent: body.shoppingPresent
    }
    
    const { aiClaimScore, clickLoss, priorityScore, ctrBase, ctrWithAI, clicksNoAI, clicksWithAI } = 
      await import('@/lib/metrics/aoer').then(m => {
        const metrics = m.priorityScores([queryCheck])[0]
        return {
          aiClaimScore: metrics.aiClaimScore,
          clickLoss: metrics.clickLoss,
          priorityScore: metrics.priorityScore,
          ctrBase: metrics.ctrBase,
          ctrWithAI: metrics.ctrWithAI,
          clicksNoAI: metrics.clicksNoAI,
          clicksWithAI: metrics.clicksWithAI
        }
      })
    
    await db.queryMetrics.insert({
      check_id: checkRecord.id,
      query_id: queryRecord.id,
      tenant_id: tenantId,
      ai_claim_score: aiClaimScore,
      click_loss: clickLoss,
      priority_score: priorityScore,
      ctr_base: ctrBase,
      ctr_with_ai: ctrWithAI,
      clicks_no_ai: clicksNoAI,
      clicks_with_ai: clicksWithAI
    })
    
    return NextResponse.json({
      success: true,
      checkId: checkRecord.id,
      metrics: {
        aiClaimScore,
        clickLoss,
        priorityScore
      }
    })
  } catch (error) {
    console.error('Error creating AOER check:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create AOER check',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
