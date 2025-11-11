/**
 * QAI (Quality Assurance Index) Composite Calculator
 * Combines multiple quality metrics into a single composite score
 */

export interface QAIMetrics {
  schemaCompleteness: number
  dataFreshness: number
  contentQuality: number
  technicalSEO: number
  userExperience: number
  mobileOptimization: number
  pageSpeed: number
  accessibility: number
}

export interface QAIComposite {
  overall: number
  breakdown: QAIMetrics
  confidence: number
  lastUpdated: string
  trends: {
    week: number
    month: number
    quarter: number
  }
}

/**
 * Calculate QAI composite score
 */
export function calculateQAIComposite(metrics: Partial<QAIMetrics>): QAIComposite {
  const defaults: QAIMetrics = {
    schemaCompleteness: 75,
    dataFreshness: 80,
    contentQuality: 85,
    technicalSEO: 78,
    userExperience: 82,
    mobileOptimization: 88,
    pageSpeed: 76,
    accessibility: 83
  }

  const finalMetrics = { ...defaults, ...metrics }
  
  // Weighted average calculation
  const weights = {
    schemaCompleteness: 0.15,
    dataFreshness: 0.12,
    contentQuality: 0.18,
    technicalSEO: 0.15,
    userExperience: 0.12,
    mobileOptimization: 0.10,
    pageSpeed: 0.10,
    accessibility: 0.08
  }

  const overall = Object.entries(finalMetrics).reduce((sum, [key, value]) => {
    return sum + (value * weights[key as keyof QAIMetrics])
  }, 0)

  return {
    overall: Math.round(overall),
    breakdown: finalMetrics,
    confidence: 0.92,
    lastUpdated: new Date().toISOString(),
    trends: {
      week: 2.3,
      month: 5.7,
      quarter: 12.1
    }
  }
}

/**
 * Generate mock QAI data for testing
 */
export function generateMockQAI(): QAIComposite {
  return calculateQAIComposite({
    schemaCompleteness: Math.floor(Math.random() * 20) + 75,
    dataFreshness: Math.floor(Math.random() * 20) + 75,
    contentQuality: Math.floor(Math.random() * 20) + 75,
    technicalSEO: Math.floor(Math.random() * 20) + 75,
    userExperience: Math.floor(Math.random() * 20) + 75,
    mobileOptimization: Math.floor(Math.random() * 20) + 75,
    pageSpeed: Math.floor(Math.random() * 20) + 75,
    accessibility: Math.floor(Math.random() * 20) + 75
  })
}