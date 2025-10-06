export interface DashboardState {
  riskScore: number
  monthlyLossRisk: number
  aiVisibilityScore: number
  invisiblePercentage: number
  marketPosition: number
  totalCompetitors: number
  sovPercentage: number
  threats: Threat[]
  aiPlatformScores: Record<AIPlatformKey, number>
}

export interface Threat {
  category: "AI Search" | "Zero-Click" | "UGC/Reviews" | "Local SEO"
  severity: "Critical" | "High" | "Medium" | "Low"
  impact: string
  description: string
}

export interface Recommendation {
  priority: "P0" | "P1" | "P2" | "P3"
  category: string
  task: string
  impact: "High" | "Medium" | "Low"
  effort: string
  roiScore: number
}

export type AIPlatformKey = "chatgpt" | "claude" | "gemini" | "perplexity" | "copilot" | "grok"

export interface AnalysisResult {
  dealership: string
  location: string
  visibility_reports: VisibilityReport[]
  competitor_reports: CompetitorReport[]
  review_data: ReviewData
  auto_responses?: AutoResponses
}

export interface VisibilityReport {
  query: string
  visibility_score: number
  platforms_mentioned: string[]
  revenue_at_risk: number
}

export interface CompetitorReport {
  query: string
  competitors: [string, number][]
}

export interface ReviewData {
  overall_rating: number
  overall_sentiment: number
  ratings: Record<string, number>
  review_counts: Record<string, number>
  response_rates: Record<string, number>
}

export interface AutoResponses {
  suggestions: Record<string, string>
}

export interface User {
  id: string
  email: string
  name?: string
  role: "USER" | "ADMIN"
}

export interface Dealership {
  id: string
  name: string
  location: string
  website?: string
  phone?: string
  userId: string
}