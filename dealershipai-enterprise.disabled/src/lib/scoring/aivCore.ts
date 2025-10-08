/**
 * AIV (Algorithmic Visibility Index) Complete Calculation System
 * 
 * Core Formula: AIV_core = SEO*0.25 + AEO*0.30 + GEO*0.25 + UGC*0.10 + GeoLocal*0.05
 * 
 * Selectivity Formula: AIV_sel = 0.35*SCS + 0.35*SIS + 0.30*SCR
 * 
 * Final Formula: AIV = (AIV_core × AIV_mods) × (1 + 0.25*AIV_sel)
 * 
 * Where:
 * - SEO: Search Engine Optimization score (0-100)
 * - AEO: AI Engine Optimization score (0-100) 
 * - GEO: Google Engine Optimization score (0-100)
 * - UGC: User Generated Content score (0-100)
 * - GeoLocal: Geographic Localization score (0-100)
 * - SCS: Search Click Selectivity (0-100)
 * - SIS: Search Intent Selectivity (0-100)
 * - SCR: Search Conversion Rate (0-100)
 * - AIV_mods: Modifier factors (default 1.0)
 */

export interface AIVComponents {
  seo: number        // 0-100, 25% weight
  aeo: number        // 0-100, 30% weight  
  geo: number        // 0-100, 25% weight
  ugc: number        // 0-100, 10% weight
  geoLocal: number   // 0-100, 5% weight
}

export interface AIVSelectivity {
  scs: number        // Search Click Selectivity, 0-100, 35% weight
  sis: number        // Search Intent Selectivity, 0-100, 35% weight
  scr: number        // Search Conversion Rate, 0-100, 30% weight
}

export interface AIVModifiers {
  aoerImpact?: number    // AOER impact modifier (default 1.0)
  geoReadiness?: number  // GEO readiness modifier (default 1.0)
  citationBoost?: number // Citation boost modifier (default 1.0)
  customModifier?: number // Custom modifier (default 1.0)
}

export interface AIVCalculation {
  core: number
  selectivity: number
  final: number
  components: AIVComponents
  selectivityComponents: AIVSelectivity
  modifiers: AIVModifiers
  breakdown: {
    seoContribution: number
    aeoContribution: number
    geoContribution: number
    ugcContribution: number
    geoLocalContribution: number
    scsContribution: number
    sisContribution: number
    scrContribution: number
    selectivityBoost: number
    modifierImpact: number
  }
  lastUpdated: string
}

// Weight constants
const WEIGHTS = {
  // Core components
  SEO: 0.25,
  AEO: 0.30,
  GEO: 0.25,
  UGC: 0.10,
  GEOLOCAL: 0.05,
  // Selectivity components
  SCS: 0.35,
  SIS: 0.35,
  SCR: 0.30,
  // Final formula
  SELECTIVITY_BOOST: 0.25
} as const

/**
 * Calculate AIV Selectivity score
 */
export function calculateAIVSelectivity(selectivity: AIVSelectivity): number {
  // Validate input ranges
  const validatedSelectivity = {
    scs: Math.max(0, Math.min(100, selectivity.scs)),
    sis: Math.max(0, Math.min(100, selectivity.sis)),
    scr: Math.max(0, Math.min(100, selectivity.scr))
  }

  // Calculate weighted contributions
  const scsContribution = validatedSelectivity.scs * WEIGHTS.SCS
  const sisContribution = validatedSelectivity.sis * WEIGHTS.SIS
  const scrContribution = validatedSelectivity.scr * WEIGHTS.SCR

  // Calculate selectivity AIV
  const selectivityScore = scsContribution + sisContribution + scrContribution

  return Math.round(selectivityScore * 100) / 100
}

/**
 * Calculate complete AIV score
 */
export function calculateAIV(
  components: AIVComponents,
  selectivity: AIVSelectivity,
  modifiers: AIVModifiers = {}
): AIVCalculation {
  // Validate input ranges
  const validatedComponents = {
    seo: Math.max(0, Math.min(100, components.seo)),
    aeo: Math.max(0, Math.min(100, components.aeo)),
    geo: Math.max(0, Math.min(100, components.geo)),
    ugc: Math.max(0, Math.min(100, components.ugc)),
    geoLocal: Math.max(0, Math.min(100, components.geoLocal))
  }

  const validatedSelectivity = {
    scs: Math.max(0, Math.min(100, selectivity.scs)),
    sis: Math.max(0, Math.min(100, selectivity.sis)),
    scr: Math.max(0, Math.min(100, selectivity.scr))
  }

  // Calculate core AIV components
  const seoContribution = validatedComponents.seo * WEIGHTS.SEO
  const aeoContribution = validatedComponents.aeo * WEIGHTS.AEO
  const geoContribution = validatedComponents.geo * WEIGHTS.GEO
  const ugcContribution = validatedComponents.ugc * WEIGHTS.UGC
  const geoLocalContribution = validatedComponents.geoLocal * WEIGHTS.GEOLOCAL

  // Calculate core AIV
  const core = seoContribution + aeoContribution + geoContribution + ugcContribution + geoLocalContribution

  // Calculate selectivity AIV
  const scsContribution = validatedSelectivity.scs * WEIGHTS.SCS
  const sisContribution = validatedSelectivity.sis * WEIGHTS.SIS
  const scrContribution = validatedSelectivity.scr * WEIGHTS.SCR
  const selectivityScore = scsContribution + sisContribution + scrContribution

  // Calculate modifiers
  const modifierValue = 
    (modifiers.aoerImpact || 1.0) *
    (modifiers.geoReadiness || 1.0) *
    (modifiers.citationBoost || 1.0) *
    (modifiers.customModifier || 1.0)

  // Calculate selectivity boost
  const selectivityBoost = selectivityScore * WEIGHTS.SELECTIVITY_BOOST

  // Final AIV calculation: AIV = (AIV_core × AIV_mods) × (1 + 0.25*AIV_sel)
  const final = (core * modifierValue) * (1 + selectivityBoost / 100)

  return {
    core: Math.round(core * 100) / 100,
    selectivity: Math.round(selectivityScore * 100) / 100,
    final: Math.max(0, Math.min(100, Math.round(final * 100) / 100)),
    components: validatedComponents,
    selectivityComponents: validatedSelectivity,
    modifiers,
    breakdown: {
      seoContribution: Math.round(seoContribution * 100) / 100,
      aeoContribution: Math.round(aeoContribution * 100) / 100,
      geoContribution: Math.round(geoContribution * 100) / 100,
      ugcContribution: Math.round(ugcContribution * 100) / 100,
      geoLocalContribution: Math.round(geoLocalContribution * 100) / 100,
      scsContribution: Math.round(scsContribution * 100) / 100,
      sisContribution: Math.round(sisContribution * 100) / 100,
      scrContribution: Math.round(scrContribution * 100) / 100,
      selectivityBoost: Math.round(selectivityBoost * 100) / 100,
      modifierImpact: Math.round((modifierValue - 1) * 100) / 100
    },
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Calculate AIV with AOER integration
 * AOER negatively impacts AIV (higher AOER = lower visibility)
 */
export function calculateAIVWithAOER(
  components: AIVComponents,
  selectivity: AIVSelectivity,
  aoerPositionalWeighted: number,
  citationShare: number,
  modifiers: AIVModifiers = {}
): AIVCalculation {
  // Calculate AOER impact modifiers
  const aoerImpact = 1 - (aoerPositionalWeighted * 0.15) // 15% reduction for high AOER
  const citationBoost = 1 + (citationShare * 0.05) // 5% boost for citations
  
  const aoerModifiers = {
    ...modifiers,
    aoerImpact,
    citationBoost
  }
  
  return calculateAIV(components, selectivity, aoerModifiers)
}

/**
 * Calculate AIV with GEO readiness integration
 * GEO readiness positively impacts AIV
 */
export function calculateAIVWithGEO(
  components: AIVComponents,
  selectivity: AIVSelectivity,
  geoReadinessScore: number,
  modifiers: AIVModifiers = {}
): AIVCalculation {
  // GEO readiness boost: better GEO readiness improves overall visibility
  const geoReadiness = 1 + (geoReadinessScore / 100) * 0.1 // 10% boost
  
  const geoModifiers = {
    ...modifiers,
    geoReadiness
  }
  
  return calculateAIV(components, selectivity, geoModifiers)
}

/**
 * Calculate comprehensive AIV with all integrations
 */
export function calculateAIVComprehensive(
  components: AIVComponents,
  selectivity: AIVSelectivity,
  aoerData?: {
    aoerPositionalWeighted: number
    citationShare: number
  },
  geoData?: {
    geoReadinessScore: number
  },
  customModifiers?: AIVModifiers
): AIVCalculation {
  // Build modifiers from available data
  const modifiers: AIVModifiers = {
    ...customModifiers
  }
  
  // Apply AOER integration if available
  if (aoerData) {
    modifiers.aoerImpact = 1 - (aoerData.aoerPositionalWeighted * 0.15)
    modifiers.citationBoost = 1 + (aoerData.citationShare * 0.05)
  }
  
  // Apply GEO integration if available
  if (geoData) {
    modifiers.geoReadiness = 1 + (geoData.geoReadinessScore / 100) * 0.1
  }
  
  return calculateAIV(components, selectivity, modifiers)
}

/**
 * Get AIV component recommendations based on current scores
 */
export function getAIVRecommendations(
  components: AIVComponents,
  selectivity?: AIVSelectivity
): Array<{
  component: string
  currentScore: number
  weight: number
  priority: 'high' | 'medium' | 'low'
  recommendation: string
  potentialImpact: number
}> {
  const recommendations = []
  
  // Core component recommendations
  // SEO recommendations (25% weight)
  if (components.seo < 70) {
    recommendations.push({
      component: 'seo',
      currentScore: components.seo,
      weight: WEIGHTS.SEO,
      priority: components.seo < 50 ? 'high' : 'medium',
      recommendation: 'Improve technical SEO fundamentals: crawlability, speed, structure, and on-page optimization',
      potentialImpact: (70 - components.seo) * WEIGHTS.SEO
    })
  }
  
  // AEO recommendations (30% weight - highest impact)
  if (components.aeo < 70) {
    recommendations.push({
      component: 'aeo',
      currentScore: components.aeo,
      weight: WEIGHTS.AEO,
      priority: components.aeo < 50 ? 'high' : 'medium',
      recommendation: 'Optimize for AI engines: improve content structure, add FAQ blocks, enhance E-E-A-T signals',
      potentialImpact: (70 - components.aeo) * WEIGHTS.AEO
    })
  }
  
  // GEO recommendations (25% weight)
  if (components.geo < 70) {
    recommendations.push({
      component: 'geo',
      currentScore: components.geo,
      weight: WEIGHTS.GEO,
      priority: components.geo < 50 ? 'high' : 'medium',
      recommendation: 'Enhance Google Engine Optimization: improve schema markup, optimize for featured snippets',
      potentialImpact: (70 - components.geo) * WEIGHTS.GEO
    })
  }
  
  // UGC recommendations (10% weight)
  if (components.ugc < 60) {
    recommendations.push({
      component: 'ugc',
      currentScore: components.ugc,
      weight: WEIGHTS.UGC,
      priority: components.ugc < 40 ? 'medium' : 'low',
      recommendation: 'Increase user-generated content: reviews, testimonials, social proof, community engagement',
      potentialImpact: (60 - components.ugc) * WEIGHTS.UGC
    })
  }
  
  // GeoLocal recommendations (5% weight)
  if (components.geoLocal < 60) {
    recommendations.push({
      component: 'geoLocal',
      currentScore: components.geoLocal,
      weight: WEIGHTS.GEOLOCAL,
      priority: components.geoLocal < 40 ? 'medium' : 'low',
      recommendation: 'Improve local SEO: optimize Google My Business, local citations, location-based content',
      potentialImpact: (60 - components.geoLocal) * WEIGHTS.GEOLOCAL
    })
  }
  
  // Selectivity component recommendations
  if (selectivity) {
    // SCS recommendations (35% weight)
    if (selectivity.scs < 70) {
      recommendations.push({
        component: 'scs',
        currentScore: selectivity.scs,
        weight: WEIGHTS.SCS,
        priority: selectivity.scs < 50 ? 'high' : 'medium',
        recommendation: 'Improve search click selectivity: optimize titles, meta descriptions, and SERP appearance',
        potentialImpact: (70 - selectivity.scs) * WEIGHTS.SCS
      })
    }
    
    // SIS recommendations (35% weight)
    if (selectivity.sis < 70) {
      recommendations.push({
        component: 'sis',
        currentScore: selectivity.sis,
        weight: WEIGHTS.SIS,
        priority: selectivity.sis < 50 ? 'high' : 'medium',
        recommendation: 'Enhance search intent selectivity: better match content to user intent and search context',
        potentialImpact: (70 - selectivity.sis) * WEIGHTS.SIS
      })
    }
    
    // SCR recommendations (30% weight)
    if (selectivity.scr < 60) {
      recommendations.push({
        component: 'scr',
        currentScore: selectivity.scr,
        weight: WEIGHTS.SCR,
        priority: selectivity.scr < 40 ? 'medium' : 'low',
        recommendation: 'Optimize search conversion rate: improve landing page experience and conversion funnels',
        potentialImpact: (60 - selectivity.scr) * WEIGHTS.SCR
      })
    }
  }
  
  // Sort by potential impact (highest first)
  return recommendations.sort((a, b) => b.potentialImpact - a.potentialImpact)
}

/**
 * Calculate AIV trend analysis
 */
export function calculateAIVTrend(
  current: { components: AIVComponents; selectivity: AIVSelectivity },
  previous: { components: AIVComponents; selectivity: AIVSelectivity }
): {
  overallChange: number
  coreChange: number
  selectivityChange: number
  componentChanges: Record<keyof AIVComponents, number>
  selectivityChanges: Record<keyof AIVSelectivity, number>
  trend: 'improving' | 'declining' | 'stable'
  topImprover: string | null
  topDecliner: string | null
} {
  const currentAIV = calculateAIV(current.components, current.selectivity)
  const previousAIV = calculateAIV(previous.components, previous.selectivity)
  
  const overallChange = currentAIV.final - previousAIV.final
  const coreChange = currentAIV.core - previousAIV.core
  const selectivityChange = currentAIV.selectivity - previousAIV.selectivity
  
  const componentChanges = {
    seo: current.components.seo - previous.components.seo,
    aeo: current.components.aeo - previous.components.aeo,
    geo: current.components.geo - previous.components.geo,
    ugc: current.components.ugc - previous.components.ugc,
    geoLocal: current.components.geoLocal - previous.components.geoLocal
  }
  
  const selectivityChanges = {
    scs: current.selectivity.scs - previous.selectivity.scs,
    sis: current.selectivity.sis - previous.selectivity.sis,
    scr: current.selectivity.scr - previous.selectivity.scr
  }
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (overallChange > 2) {
    trend = 'improving'
  } else if (overallChange < -2) {
    trend = 'declining'
  }
  
  // Find top improver and decliner across all components
  const allChanges = [
    ...Object.entries(componentChanges).map(([k, v]) => [k, v] as [string, number]),
    ...Object.entries(selectivityChanges).map(([k, v]) => [k, v] as [string, number])
  ]
  
  const sortedChanges = allChanges.sort((a, b) => b[1] - a[1])
  const topImprover = sortedChanges[0][1] > 0 ? sortedChanges[0][0] : null
  const topDecliner = sortedChanges[sortedChanges.length - 1][1] < 0 ? 
    sortedChanges[sortedChanges.length - 1][0] : null
  
  return {
    overallChange,
    coreChange,
    selectivityChange,
    componentChanges,
    selectivityChanges,
    trend,
    topImprover,
    topDecliner
  }
}
