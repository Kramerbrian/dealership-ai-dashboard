/**
 * DealershipAI - Consolidated Core Types
 * Three-pillar scoring system with E-E-A-T integration
 */

export interface Dealer {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  established_date: Date;
  tier: 1 | 2 | 3;
}

export interface PillarScore {
  score: number;
  components: Record<string, number>;
  confidence: number;
  last_updated: Date;
}

export interface ThreePillarScores {
  seo: PillarScore;
  aeo: PillarScore & { mentions: number; queries: number; mention_rate: string };
  geo: PillarScore & { sge_appearance_rate: string };
  eeat: { experience: number; expertise: number; authoritativeness: number; trustworthiness: number; overall: number };
  overall: number;
}

export interface APIConfig {
  endpoint: string;
  key: string;
  model?: string;
  cost_per_query: number;
}

export interface MarketQueries {
  [market: string]: string[];
}