// QAI Algorithm Types and Interfaces

export interface QAICalculationInput {
  domain: string
  dealershipName: string
  location: string
  useGeographicPooling?: boolean
}

export interface QAIScore {
  qai_star_score: number
  piqr_score: number
  hrp_score: number
  vai_score: number
  oci_score: number
  breakdown: {
    aiVisibility: number
    zeroClickShield: number
    ugcHealth: number
    geoTrust: number
    sgpIntegrity: number
  }
  geographic_pooling_applied?: boolean
  timestamp: Date
}

export interface PIQRInput {
  domain: string
  contentQuality: number
  structuredData: number
  pageSpeed: number
  mobileOptimization: number
  schemaMarkup: number
}

export interface HRPInput {
  domain: string
  readabilityScore: number
  contentLength: number
  headingStructure: number
  imageOptimization: number
  userExperience: number
}

export interface VAIInput {
  domain: string
  voiceSearchOptimization: number
  localSEO: number
  conversationalContent: number
  faqStructure: number
  naturalLanguage: number
}

export interface OCIInput {
  domain: string
  citationConsistency: number
  reviewQuality: number
  socialSignals: number
  brandMentions: number
  trustSignals: number
}

export interface AIPlatformData {
  platform: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini' | 'Copilot'
  mentions: number
  sentiment: 'positive' | 'neutral' | 'negative'
  visibility: number
  score: number
}

export interface CompetitorData {
  name: string
  domain: string
  qai_score: number
  gap: number
  strengths: string[]
  weaknesses: string[]
}

export interface RecommendationData {
  id: string
  title: string
  description: string
  impact: number
  effort: 'easy' | 'medium' | 'hard'
  priority: 'critical' | 'high' | 'medium' | 'low'
  revenue: number
  time: number
  automated: boolean
}