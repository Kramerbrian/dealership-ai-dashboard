/**
 * DealershipAI Ultimate - Core Types
 * Complete type definitions for the QAI system
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface QAIScore {
  // Top-level Index
  qai_star_score: number; // 0-100
  authority_velocity: number; // ±percentage
  oci_value: number; // monthly $ loss
  
  // Risk-Adjusted Visibility
  vai_penalized: number; // Visibility After PIQR penalty
  piqr_score: number; // 1.0 = optimal
  hrp_score: number; // 0.0 = optimal
  
  // 5 Pillars
  ai_visibility: number; // SEO + AEO + GEO combined
  zero_click_shield: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
  
  // SEO/AEO/GEO Breakdown
  seo_score: number;
  aeo_score: number;
  geo_score: number;
}

export interface EEATScore {
  experience: number;
  expertise: number;
  authoritativeness: number;
  trustworthiness: number;
  
  // Sub-components
  ppi: number; // Page Performance Index
  sdi: number; // Structured Discoverability Index
  lsi: number; // Local Surface Index
  tas: number; // Trust Authority Score
  ans: number; // Answer Share
  ais: number; // Audience Integrity Score
}

export interface AIPlatformScore {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot' | 'grok';
  visibility_score: number;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  rank: number;
  market_share: number;
}

export interface VCOPrediction {
  vdp_id: string;
  conversion_probability: number; // 0-100
  shap_values: Record<string, number>;
  recommended_actions: RecommendedAction[];
}

export interface RecommendedAction {
  feature: string;
  current_value: any;
  optimal_value: any;
  shap_gain: number;
  estimated_probability_increase: number;
  estimated_revenue_gain: number;
  cost: number;
  net_profit: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// DATABASE ENTITIES
// ============================================================================

export interface Dealership {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  sessions_used: number;
  sessions_limit: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  dealership_id: string;
  role: 'user' | 'admin' | 'enterprise_admin';
  created_at: string;
}

export interface Competitor {
  id: string;
  dealership_id: string;
  name: string;
  domain: string;
  city: string;
  rank: number;
  qai_score: number;
  score_change: number;
  gap: number;
  weaknesses: string[];
  updated_at: string;
}

export interface QuickWin {
  id: string;
  dealership_id: string;
  title: string;
  description: string;
  category: 'schema' | 'reviews' | 'citations' | 'content' | 'seo' | 'aeo' | 'geo';
  impact_points: number;
  revenue_monthly: number;
  effort: 'easy' | 'medium' | 'hard';
  time_to_fix: string;
  status: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface MysteryShop {
  id: string;
  dealership_id: string;
  shop_type: 'email' | 'chat' | 'phone' | 'form';
  query_text: string;
  response_text: string;
  response_time_score: number;
  personalization_score: number;
  transparency_score: number;
  followup_score: number;
  professionalism_score: number;
  overall_score: number;
  conducted_at: string;
}

// ============================================================================
// ALGORITHM INPUTS
// ============================================================================

export interface PIQRInput {
  compliance_fails: ComplianceFail[];
  warning_signals: WarningSignal[];
}

export interface ComplianceFail {
  type: 'vin_missing' | 'price_mismatch' | 'no_photos' | 'invalid_schema';
  weight: number; // Default 0.25
}

export interface WarningSignal {
  type: 'deceptive_pricing' | 'inventory_dilution' | 'content_duplication';
  severity: number; // 0-1
  multiplier: number; // 1.0 + (severity * 0.5)
}

export interface HRPInput {
  total_mentions: number;
  verifiable_mentions: number;
  severity_multiplier: number; // 1.0-3.0 based on risk
}

export interface VAIInput {
  platform_scores: Record<string, number>;
  platform_weights: Record<string, number>;
  piqr: number;
}

export interface SEOScore {
  organic_traffic: number; // Google Analytics
  keyword_rankings: number; // Average position top 10 keywords
  local_pack_share: number; // % of local pack appearances
  branded_ctr: number; // Branded keyword CTR
}

export interface AEOScore {
  featured_snippets: number; // Count of owned snippets
  paa_capture_rate: number; // % of PAA boxes owned
  ai_overview_citations: number; // Times cited in AI Overviews
  voice_search_traffic: number; // Voice search engagement
}

export interface GEOScore {
  llm_mentions: number; // Frequency in LLM responses
  llm_sentiment: number; // -1 to +1
  authority_links: number; // Backlinks from AI-cited content
}

export interface EEATInput {
  // Experience signals
  time_on_site: number;
  bounce_rate: number;
  pages_per_session: number;
  
  // Expertise signals
  content_depth: number; // Avg words per page
  authorship_completeness: number; // % pages with author
  technical_accuracy: number; // Manual review score
  
  // Authoritativeness signals
  domain_authority: number;
  backlink_quality: number;
  brand_mentions: number;
  
  // Trustworthiness signals
  ssl_cert: boolean;
  privacy_policy: boolean;
  contact_info_complete: boolean;
  review_rating: number; // 0-5 stars
  review_count: number;
  review_response_rate: number;
}

export interface QAICalculationInput {
  // SEO/AEO/GEO components
  seo: SEOScore;
  aeo: AEOScore;
  geo: GEOScore;
  
  // Risk factors
  piqr: PIQRInput;
  hrp: HRPInput;
  
  // AI platform scores
  platform_scores: Record<string, number>;
  
  // Previous score for velocity
  previous_score?: number;
  
  // Segment weights (dynamic)
  segment_weights?: Record<string, number>;
}

export interface OCIInput {
  current_score: number;
  target_score: number;
  avg_gross_profit: number;
  monthly_lead_volume: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  sessions_remaining?: number;
}

export interface QAIResponse {
  dealership_id: string;
  calculated_at: string;
  qai: QAIScore;
  eeat: EEATScore;
  platforms: AIPlatformScore[];
  sessions_remaining: number;
}

export interface CompetitorResponse {
  market_position: {
    your_rank: number;
    total_competitors: number;
    market_share: {
      ai_mentions: number;
      reviews: number;
      visibility: number;
    };
  };
  competitors: Competitor[];
  gap_analysis: {
    radar_data: Record<string, [number, number]>; // [you, leader]
    exploitable_weaknesses: Array<{
      competitor: string;
      weakness: string;
      their_score: number;
      your_score: number;
      opportunity: string;
    }>;
  };
}

export interface QuickWinsResponse {
  summary: {
    total_revenue_opportunity: number;
    potential_score_gain: number;
    critical_issues: number;
    quick_wins_count: number;
  };
  recommendations: QuickWin[];
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export type SessionAction = 
  | 'score_refresh'
  | 'competitor_analysis'
  | 'report_export'
  | 'ai_chat_query'
  | 'schema_generate'
  | 'review_draft'
  | 'mystery_shop';

export interface SessionLimit {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  monthlyLimit: number;
  actions: SessionAction[];
}

export interface SessionCheck {
  allowed: boolean;
  remaining: number;
  action_cost: number;
}

// ============================================================================
// TIER SYSTEM
// ============================================================================

export interface TierFeatures {
  sessions_per_month: number;
  score_updates: 'cached_14d' | 'weekly' | 'daily';
  qai_dashboard: boolean;
  five_pillars: 'basic' | 'full' | 'full_plus_trends';
  seo_aeo_geo: boolean;
  eeat_scoring: boolean;
  ai_platforms: number; // 3, 6, or 6+
  competitors: number; // 3, unlimited, unlimited
  quick_wins: number; // 3, all, all
  code_snippets: boolean;
  review_drafts: boolean;
  schema_fixes: boolean;
  nap_citations: boolean;
  export_reports: boolean;
  api_access: 'none' | 'read_only' | 'full_crud';
  mystery_shops: boolean;
  multi_location: boolean;
  white_label: boolean;
  support: 'email' | 'email' | 'phone_slack';
}

export const TIER_FEATURES: Record<'FREE' | 'PRO' | 'ENTERPRISE', TierFeatures> = {
  FREE: {
    sessions_per_month: 0,
    score_updates: 'cached_14d',
    qai_dashboard: true,
    five_pillars: 'basic',
    seo_aeo_geo: false,
    eeat_scoring: false,
    ai_platforms: 3,
    competitors: 3,
    quick_wins: 3,
    code_snippets: false,
    review_drafts: false,
    schema_fixes: false,
    nap_citations: false,
    export_reports: false,
    api_access: 'none',
    mystery_shops: false,
    multi_location: false,
    white_label: false,
    support: 'email',
  },
  PRO: {
    sessions_per_month: 50,
    score_updates: 'weekly',
    qai_dashboard: true,
    five_pillars: 'full',
    seo_aeo_geo: true,
    eeat_scoring: true,
    ai_platforms: 6,
    competitors: -1, // unlimited
    quick_wins: -1, // all
    code_snippets: true,
    review_drafts: true,
    schema_fixes: true,
    nap_citations: true,
    export_reports: true,
    api_access: 'read_only',
    mystery_shops: false,
    multi_location: false,
    white_label: false,
    support: 'email',
  },
  ENTERPRISE: {
    sessions_per_month: 200,
    score_updates: 'daily',
    qai_dashboard: true,
    five_pillars: 'full_plus_trends',
    seo_aeo_geo: true,
    eeat_scoring: true,
    ai_platforms: 6,
    competitors: -1, // unlimited
    quick_wins: -1, // all
    code_snippets: true,
    review_drafts: true,
    schema_fixes: true,
    nap_citations: true,
    export_reports: true,
    api_access: 'full_crud',
    mystery_shops: true,
    multi_location: true,
    white_label: true,
    support: 'phone_slack',
  },
};

// ============================================================================
// GEOGRAPHIC POOLING
// ============================================================================

export interface GeoPool {
  city: string;
  state: string;
  pooled_scores: QAIScore;
  dealer_count: number;
  expires_at: Date;
}

// ============================================================================
// COST STRUCTURE
// ============================================================================

export interface CostBreakdown {
  infrastructure: number;
  ai_queries: number;
  api_calls: number;
  mystery_shops: number;
  total: number;
}

export const COST_BY_TIER: Record<'FREE' | 'PRO' | 'ENTERPRISE', CostBreakdown> = {
  FREE: {
    infrastructure: 0.10,
    ai_queries: 0.00,
    api_calls: 0.00,
    mystery_shops: 0.00,
    total: 0.10,
  },
  PRO: {
    infrastructure: 0.10,
    ai_queries: 0.02, // 2 queries × $0.01
    api_calls: 0.03, // Google APIs, etc.
    mystery_shops: 0.00,
    total: 0.15,
  },
  ENTERPRISE: {
    infrastructure: 0.10,
    ai_queries: 0.08, // 8 queries × $0.01
    api_calls: 0.03,
    mystery_shops: 1.50, // 6 shops × $0.25
    total: 2.00,
  },
};

// ============================================================================
// THEME & UI
// ============================================================================

export interface Theme {
  colors: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    purple: string;
    gray: Record<number, string>;
  };
  platformColors: Record<string, string>;
  scoreRanges: Record<string, { min: number; color: string }>;
}

export const THEME: Theme = {
  colors: {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#eab308',
    error: '#ef4444',
    purple: '#8b5cf6',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  platformColors: {
    chatgpt: '#10a37f',
    claude: '#cc785c',
    perplexity: '#00a1e0',
    gemini: '#4285f4',
    copilot: '#0078d4',
    grok: '#1da1f2',
  },
  scoreRanges: {
    excellent: { min: 90, color: '#10b981' },
    good: { min: 70, color: '#3b82f6' },
    fair: { min: 50, color: '#eab308' },
    poor: { min: 0, color: '#ef4444' },
  },
};
