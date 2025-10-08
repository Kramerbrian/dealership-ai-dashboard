import { db } from '@/lib/db'
import { external_sources, geo_signals, geo_composite_scores } from '@/db/schema/sources'
import { createHash } from 'crypto'

interface GeoArticleMeta {
  title?: string
  url: string
  provider?: string
}

interface GeoSignals {
  geoChecklistScore: number
  aioExposurePct: number
  topicalDepthScore: number
  kgPresent: boolean
  kgCompleteness: number
  mentionVelocity4w: number
  extractabilityScore: number
}

/**
 * Ingest GEO article and compute derived signals
 * Only stores metadata and computed features, not full text
 */
export async function ingestGeoArticle(
  tenantId: string, 
  url: string, 
  meta: GeoArticleMeta
): Promise<void> {
  try {
    const fetchedAt = new Date()
    const provider = meta.provider || "seopowersuite:blog"
    
    // Create content hash (placeholder - hash normalized text if you parse it)
    const contentHash = createHash('sha256')
      .update(url + (meta.title || ""))
      .digest('hex')

    // Insert external source record
    const source = await db.external_sources.insert({
      tenant_id: tenantId,
      provider,
      url,
      title: meta.title,
      fetched_at: fetchedAt,
      content_hash: contentHash
    })

    // Compute derived signals from existing audits
    const signals = await computeSignalsFromAudits(tenantId, url)
    
    // Insert GEO signals
    await db.geo_signals.insert({
      tenant_id: tenantId,
      source_id: source.id,
      geo_checklist_score: signals.geoChecklistScore,
      aio_exposure_pct: signals.aioExposurePct,
      topical_depth_score: signals.topicalDepthScore,
      kg_present: signals.kgPresent,
      kg_completeness: signals.kgCompleteness,
      mention_velocity_4w: signals.mentionVelocity4w,
      extractability_score: signals.extractabilityScore
    })

    // Update composite scores for AIV integration
    await upsertToCompositeScores(tenantId, signals)

    console.log(`GEO article ingested for tenant ${tenantId}: ${url}`)
  } catch (error) {
    console.error('Error ingesting GEO article:', error)
    throw error
  }
}

/**
 * Compute GEO signals from existing technical, content, and citation audits
 * Maps your current audit data to the 7 GEO features
 */
async function computeSignalsFromAudits(tenantId: string, url: string): Promise<GeoSignals> {
  // Get existing audit data for this tenant
  const [dealershipData, scoreHistory, auditLogs] = await Promise.all([
    db.dealershipData.findMany({ where: { tenant_id: tenantId } }),
    db.scoreHistory.findMany({ 
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 10
    }),
    db.auditLog.findMany({
      where: { 
        tenant_id: tenantId,
        created_at: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } // Last 4 weeks
      }
    })
  ])

  // 1. GEO Readiness Checklist Score (0-100)
  const geoChecklistScore = computeGeoChecklistScore(dealershipData, scoreHistory)
  
  // 2. AIO Exposure Percentage (0-100)
  const aioExposurePct = computeAIOExposurePct(scoreHistory, auditLogs)
  
  // 3. Topical Authority Depth (0-100)
  const topicalDepthScore = computeTopicalDepthScore(dealershipData, auditLogs)
  
  // 4. Knowledge Graph Presence
  const { kgPresent, kgCompleteness } = computeKGPresence(dealershipData, auditLogs)
  
  // 5. Mention Velocity (4-week count)
  const mentionVelocity4w = computeMentionVelocity(auditLogs)
  
  // 6. Formatting Extractability (0-100)
  const extractabilityScore = computeExtractabilityScore(dealershipData, auditLogs)

  return {
    geoChecklistScore,
    aioExposurePct,
    topicalDepthScore,
    kgPresent,
    kgCompleteness,
    mentionVelocity4w,
    extractabilityScore
  }
}

/**
 * Compute GEO readiness checklist score from existing audits
 */
function computeGeoChecklistScore(dealershipData: any[], scoreHistory: any[]): number {
  if (scoreHistory.length === 0) return 0
  
  const latestScore = scoreHistory[0]
  const factors = [
    latestScore.crawlability_score || 0,
    latestScore.speed_score || 0,
    latestScore.structure_score || 0,
    latestScore.schema_score || 0,
    latestScore.freshness_score || 0,
    latestScore.links_score || 0
  ]
  
  return Math.round(factors.reduce((sum, score) => sum + score, 0) / factors.length)
}

/**
 * Compute AIO exposure percentage from AI-related scores
 */
function computeAIOExposurePct(scoreHistory: any[], auditLogs: any[]): number {
  if (scoreHistory.length === 0) return 0
  
  const latestScore = scoreHistory[0]
  const aioFactors = [
    latestScore.aeo_score || 0, // AI Engine Optimization
    latestScore.geo_score || 0, // Google Engine Optimization
    latestScore.ai_visibility_score || 0
  ]
  
  const avgAIO = aioFactors.reduce((sum, score) => sum + score, 0) / aioFactors.length
  
  // Check for AI-related audit logs
  const aiAudits = auditLogs.filter(log => 
    log.action.includes('ai') || 
    log.action.includes('chatgpt') || 
    log.action.includes('claude')
  ).length
  
  // Boost score if AI audits are present
  const boost = Math.min(aiAudits * 5, 20) // Max 20 point boost
  
  return Math.min(100, Math.round(avgAIO + boost))
}

/**
 * Compute topical authority depth from content audits
 */
function computeTopicalDepthScore(dealershipData: any[], auditLogs: any[]): number {
  const contentAudits = auditLogs.filter(log => 
    log.action.includes('content') || 
    log.action.includes('topic') ||
    log.action.includes('cluster')
  )
  
  // Count complete topic clusters vs orphan pages
  const clusterCount = contentAudits.filter(log => 
    log.details?.includes('cluster') || log.details?.includes('complete')
  ).length
  
  const orphanCount = contentAudits.filter(log => 
    log.details?.includes('orphan') || log.details?.includes('isolated')
  ).length
  
  const total = clusterCount + orphanCount
  if (total === 0) return 0
  
  return Math.round((clusterCount / total) * 100)
}

/**
 * Compute knowledge graph presence and completeness
 */
function computeKGPresence(dealershipData: any[], auditLogs: any[]): { kgPresent: boolean, kgCompleteness: number } {
  const kgAudits = auditLogs.filter(log => 
    log.action.includes('knowledge') || 
    log.action.includes('entity') ||
    log.action.includes('wikidata')
  )
  
  const kgPresent = kgAudits.length > 0
  
  // Calculate completeness based on entity coverage
  const entityAudits = kgAudits.filter(log => 
    log.details?.includes('entity') || log.details?.includes('complete')
  )
  
  const kgCompleteness = kgPresent ? 
    Math.min(100, Math.round((entityAudits.length / Math.max(kgAudits.length, 1)) * 100)) : 0
  
  return { kgPresent, kgCompleteness }
}

/**
 * Compute mention velocity over 4 weeks
 */
function computeMentionVelocity(auditLogs: any[]): number {
  const mentionAudits = auditLogs.filter(log => 
    log.action.includes('mention') || 
    log.action.includes('citation') ||
    log.action.includes('backlink')
  )
  
  return mentionAudits.length
}

/**
 * Compute formatting extractability score
 */
function computeExtractabilityScore(dealershipData: any[], auditLogs: any[]): number {
  const structureAudits = auditLogs.filter(log => 
    log.action.includes('structure') || 
    log.action.includes('heading') ||
    log.action.includes('formatting')
  )
  
  // Calculate density ratio of structured content
  const structuredCount = structureAudits.filter(log => 
    log.details?.includes('heading') || 
    log.details?.includes('list') ||
    log.details?.includes('table')
  ).length
  
  const totalStructure = structureAudits.length
  if (totalStructure === 0) return 0
  
  return Math.round((structuredCount / totalStructure) * 100)
}

/**
 * Update composite scores for AIV integration
 */
async function upsertToCompositeScores(tenantId: string, signals: GeoSignals): Promise<void> {
  // Calculate AIV GEO sub-factor
  const aivGeoScore = Math.round(
    0.6 * signals.geoChecklistScore +
    0.2 * signals.topicalDepthScore +
    0.1 * signals.extractabilityScore +
    0.1 * (signals.kgPresent ? signals.kgCompleteness : 0)
  )
  
  // Calculate RaR adjustment factor
  const rarAdjustmentFactor = signals.aioExposurePct > 70 && signals.mentionVelocity4w > 10 ? 
    0.9 : // Reduce expected leakage when AIO exposure is high
    1.0   // Normal factor
  
  // Get previous score for change tracking
  const previousScore = await db.geo_composite_scores.findFirst({
    where: { tenantId },
    orderBy: { computedAt: 'desc' }
  })
  
  const weeklyChange = previousScore ? 
    aivGeoScore - (previousScore.aiv_geo_score || 0) : 0
  
  // Check stability (flag if >15 point swing in <2 weeks)
  const isStable = Math.abs(weeklyChange) <= 15
  
  await db.geo_composite_scores.insert({
    tenant_id: tenantId,
    aiv_geo_score: aivGeoScore,
    rar_adjustment_factor: rarAdjustmentFactor,
    weekly_change: weeklyChange,
    is_stable: isStable
  })
}
