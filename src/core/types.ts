// Core types for DealershipAI three-pillar scoring system

export interface Dealer {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  established_date: Date;
  tier: 1 | 2 | 3;
}

export interface ThreePillarScores {
  seo: SEOScore;
  aeo: AEOScore;
  geo: GEOScore;
  eeat: EEATScores;
  overall: number;
  last_updated: Date;
}

export interface SEOScore {
  score: number;
  components: {
    organic_rankings: number;
    branded_search_volume: number;
    backlink_authority: number;
    content_indexation: number;
    local_pack_presence: number;
  };
  confidence: number;
}

export interface AEOScore {
  score: number;
  components: {
    citation_frequency: number;
    source_authority: number;
    answer_completeness: number;
    multi_platform_presence: number;
    sentiment_quality: number;
  };
  mentions: number;
  queries: number;
  mention_rate: string;
}

export interface GEOScore {
  score: number;
  components: {
    ai_overview_presence: number;
    featured_snippet_rate: number;
    knowledge_panel_complete: number;
    zero_click_dominance: number;
    entity_recognition: number;
  };
  sge_appearance_rate: string;
}

export interface EEATScores {
  experience: number;
  expertise: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
  confidence: number;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    source: string;
    confidence?: number;
  };
}

// Market configuration
export interface MarketConfig {
  queries: string[];
  competitors: string[];
  demographics: {
    population: number;
    median_income: number;
    car_ownership_rate: number;
  };
}

// Scoring context
export interface ScoringContext {
  market: string;
  season: 'peak' | 'off' | 'transition';
  competitor_landscape: 'saturated' | 'moderate' | 'emerging';
  budget_tier: 'premium' | 'mid' | 'value';
}
