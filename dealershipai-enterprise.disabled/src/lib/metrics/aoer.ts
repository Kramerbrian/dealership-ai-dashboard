/**
 * AOER (AI Overview Exposure Rate) Analytics System
 * Implementation-ready algorithms for AI visibility tracking
 */

// Types
export type Intent = 'local' | 'inventory' | 'finance' | 'trade' | 'info' | 'service' | 'brand'
export type AIPosition = 'top' | 'mid' | 'bottom' | 'none'

export interface QueryCheck {
  query: string
  intent: Intent
  volume: number // monthly search volume
  serpPosition?: number // 1-10, undefined allowed
  aiPresent: boolean
  aiPosition: AIPosition
  hasOurCitation: boolean
  aiTokens?: number // default 0
  aiLinksCount?: number
  paaPresent?: boolean
  mapPackPresent?: boolean
  shoppingPresent?: boolean
}

export interface QueryMetrics {
  query: string
  intent: Intent
  aiClaimScore: number // 0-100
  clickLoss: number // estimated monthly click loss
  priorityScore: number // 0-100, for ranking
  ctrBase: number
  ctrWithAI: number
  clicksNoAI: number
  clicksWithAI: number
}

export interface AOERMetrics {
  aoer: number // unweighted AOER
  aoerWeighted: number // volume-weighted AOER
  aoerPositional: number // prominence-aware AOER
  aoerPositionalWeighted: number // volume + prominence weighted
}

export interface AOERRollup {
  aoer: AOERMetrics
  avgAiClaimScore: number
  citationShare: number
  estimatedMonthlyClickLoss: number
  totalQueries: number
  queriesWithAI: number
  topPriorityQueries: QueryMetrics[]
}

// Constants (tuneable)
const PROM_MAP: Record<AIPosition, number> = { 
  top: 100, 
  mid: 60, 
  bottom: 30, 
  none: 0 
}

const DAMPEN: Record<AIPosition, number> = { 
  top: 0.55, 
  mid: 0.70, 
  bottom: 0.85, 
  none: 1.00 
}

const CTR_BASE: Record<number, number> = {
  1: 0.28,
  2: 0.16,
  3: 0.11,
  4: 0.08,
  5: 0.06
}

// AI Claim Score weights
const W_PRESENT = 45
const W_PROMINENCE = 25
const W_NO_CITE = 20
const W_DEPTH = 10

/**
 * Get baseline CTR for a given rank
 */
export function ctrBase(rank?: number): number {
  if (!rank) return 0.03
  if (rank >= 6) return 0.03
  return CTR_BASE[rank] ?? 0.03
}

/**
 * Calculate AI Claim Score (0-100)
 * Higher score = more at-risk query
 */
export function aiClaimScore(q: QueryCheck): number {
  const present = q.aiPresent ? 100 : 0
  const prominence = PROM_MAP[q.aiPosition]
  const noCitation = q.hasOurCitation ? 0 : 100
  const depth = Math.min(1, (q.aiTokens ?? 0) / 600) * 100
  
  const raw = (
    W_PRESENT * present +
    W_PROMINENCE * prominence +
    W_NO_CITE * noCitation +
    W_DEPTH * depth
  ) / 100
  
  return Math.max(0, Math.min(100, raw))
}

/**
 * Calculate estimated click loss for a query
 */
export function clickLoss(q: QueryCheck): number {
  const base = ctrBase(q.serpPosition)
  const withAI = base * DAMPEN[q.aiPosition]
  const clicksNoAI = q.volume * base
  const clicksWithAI = q.volume * (q.aiPresent ? withAI : base)
  
  return Math.max(0, clicksNoAI - clicksWithAI)
}

/**
 * Calculate CTR metrics for a query
 */
export function ctrMetrics(q: QueryCheck) {
  const base = ctrBase(q.serpPosition)
  const withAI = base * DAMPEN[q.aiPosition]
  const clicksNoAI = q.volume * base
  const clicksWithAI = q.volume * (q.aiPresent ? withAI : base)
  
  return {
    ctrBase: base,
    ctrWithAI: withAI,
    clicksNoAI,
    clicksWithAI
  }
}

/**
 * Compute AOER metrics for a set of queries
 */
export function computeAOER(queries: QueryCheck[]): AOERMetrics {
  const N = queries.length
  const sumVol = queries.reduce((s, x) => s + x.volume, 0)
  
  // Unweighted AOER
  const present = queries.filter(x => x.aiPresent).length
  const aoer = present / N
  
  // Volume-weighted AOER
  const presentVol = queries.filter(x => x.aiPresent).reduce((s, x) => s + x.volume, 0)
  const aoerWeighted = presentVol / sumVol
  
  // Positional AOER (prominence-aware)
  const posSum = queries.reduce((s, x) => {
    if (!x.aiPresent) return s
    const weight = x.aiPosition === 'top' ? 1.0 : 
                   x.aiPosition === 'mid' ? 0.6 : 
                   x.aiPosition === 'bottom' ? 0.3 : 0
    return s + weight
  }, 0)
  const aoerPositional = posSum / N
  
  // Positional + Volume weighted AOER
  const posSumVol = queries.reduce((s, x) => {
    if (!x.aiPresent) return s
    const weight = x.aiPosition === 'top' ? 1.0 : 
                   x.aiPosition === 'mid' ? 0.6 : 
                   x.aiPosition === 'bottom' ? 0.3 : 0
    return s + (weight * x.volume)
  }, 0)
  const aoerPositionalWeighted = posSumVol / sumVol
  
  return {
    aoer,
    aoerWeighted,
    aoerPositional,
    aoerPositionalWeighted
  }
}

/**
 * Calculate priority scores for ranking queries
 */
export function priorityScores(queries: QueryCheck[]): QueryMetrics[] {
  if (queries.length === 0) return []
  
  // Precompute p95s for normalization
  const losses = queries.map(clickLoss).sort((a, b) => a - b)
  const p95Loss = losses[Math.floor(0.95 * (losses.length - 1))] || 1
  
  const volumes = queries.map(q => q.volume).sort((a, b) => a - b)
  const p95Vol = volumes[Math.floor(0.95 * (volumes.length - 1))] || 1
  
  return queries.map(q => {
    const ACS = aiClaimScore(q)
    const loss = clickLoss(q)
    const ctr = ctrMetrics(q)
    
    // Normalize metrics
    const volumeNorm = Math.min(1, q.volume / p95Vol)
    const impactNorm = Math.min(1, loss / p95Loss)
    const riskNorm = ACS / 100
    
    // Calculate priority score
    const priority = 100 * (0.5 * impactNorm + 0.5 * riskNorm) * (0.6 * volumeNorm + 0.4)
    
    return {
      query: q.query,
      intent: q.intent,
      aiClaimScore: ACS,
      clickLoss: loss,
      priorityScore: priority,
      ctrBase: ctr.ctrBase,
      ctrWithAI: ctr.ctrWithAI,
      clicksNoAI: ctr.clicksNoAI,
      clicksWithAI: ctr.clicksWithAI
    }
  }).sort((a, b) => b.priorityScore - a.priorityScore)
}

/**
 * Compute AOER rollups by intent segment
 */
export function computeAOERByIntent(queries: QueryCheck[]): Record<Intent, AOERMetrics> {
  const intents: Intent[] = ['local', 'inventory', 'finance', 'trade', 'info', 'service', 'brand']
  const result: Record<string, AOERMetrics> = {}
  
  intents.forEach(intent => {
    const intentQueries = queries.filter(q => q.intent === intent)
    if (intentQueries.length > 0) {
      result[intent] = computeAOER(intentQueries)
    }
  })
  
  return result as Record<Intent, AOERMetrics>
}

/**
 * Generate comprehensive AOER rollup
 */
export function generateAOERRollup(queries: QueryCheck[]): AOERRollup {
  const aoer = computeAOER(queries)
  const priorityScoresList = priorityScores(queries)
  
  const avgAiClaimScore = priorityScoresList.reduce((sum, q) => sum + q.aiClaimScore, 0) / priorityScoresList.length
  const citationShare = queries.filter(q => q.hasOurCitation).length / queries.length
  const estimatedMonthlyClickLoss = priorityScoresList.reduce((sum, q) => sum + q.clickLoss, 0)
  const totalQueries = queries.length
  const queriesWithAI = queries.filter(q => q.aiPresent).length
  
  return {
    aoer,
    avgAiClaimScore,
    citationShare,
    estimatedMonthlyClickLoss,
    totalQueries,
    queriesWithAI,
    topPriorityQueries: priorityScoresList.slice(0, 10) // Top 10 priority queries
  }
}

/**
 * Calculate trend metrics (comparing two time periods)
 */
export function calculateAOERTrends(current: QueryCheck[], previous: QueryCheck[]): {
  aoerChange: number
  clickLossChange: number
  citationShareChange: number
  trend: 'improving' | 'declining' | 'stable'
} {
  const currentRollup = generateAOERRollup(current)
  const previousRollup = generateAOERRollup(previous)
  
  const aoerChange = currentRollup.aoer.aoerPositionalWeighted - previousRollup.aoer.aoerPositionalWeighted
  const clickLossChange = currentRollup.estimatedMonthlyClickLoss - previousRollup.estimatedMonthlyClickLoss
  const citationShareChange = currentRollup.citationShare - previousRollup.citationShare
  
  // Determine overall trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (aoerChange < -0.05 || citationShareChange > 0.05) {
    trend = 'improving'
  } else if (aoerChange > 0.05 || citationShareChange < -0.05) {
    trend = 'declining'
  }
  
  return {
    aoerChange,
    clickLossChange,
    citationShareChange,
    trend
  }
}

/**
 * Generate actionable recommendations based on AOER analysis
 */
export function generateAOERRecommendations(rollup: AOERRollup): Array<{
  type: string
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
  impact: string
}> {
  const recommendations = []
  
  // High AOER recommendations
  if (rollup.aoer.aoerPositionalWeighted > 0.7) {
    recommendations.push({
      type: 'high_aoer',
      priority: 'high' as const,
      message: 'High AI Overview exposure detected',
      action: 'Focus on AI-friendly content optimization and citation capture',
      impact: 'Reduce click loss and improve AI visibility'
    })
  }
  
  // Low citation share recommendations
  if (rollup.citationShare < 0.3) {
    recommendations.push({
      type: 'low_citations',
      priority: 'high' as const,
      message: 'Low citation share in AI Overviews',
      action: 'Improve content authority and add structured data',
      impact: 'Increase AI citation rate and trust signals'
    })
  }
  
  // High click loss recommendations
  if (rollup.estimatedMonthlyClickLoss > 1000) {
    recommendations.push({
      type: 'high_click_loss',
      priority: 'medium' as const,
      message: 'Significant estimated click loss',
      action: 'Optimize for featured snippets and AI-friendly formats',
      impact: 'Recover lost traffic and improve SERP visibility'
    })
  }
  
  // Priority query recommendations
  const highPriorityQueries = rollup.topPriorityQueries.filter(q => q.priorityScore > 80)
  if (highPriorityQueries.length > 0) {
    recommendations.push({
      type: 'priority_queries',
      priority: 'medium' as const,
      message: `${highPriorityQueries.length} high-priority queries need attention`,
      action: 'Create targeted content and optimization strategies',
      impact: 'Address highest-impact AI-claimed queries first'
    })
  }
  
  return recommendations
}
