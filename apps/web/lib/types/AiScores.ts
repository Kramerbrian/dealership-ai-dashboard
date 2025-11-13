/**
 * AI Scores TypeScript Types
 * Response types for AI visibility scoring API
 */

export type PlatformScore = {
  platform: string;
  score: number;
  confidence?: string;
};

export type AiScoresResponse = {
  timestamp: string;
  dealerId: string;
  model_version: string;
  kpi_scoreboard: {
    QAI_star: number;
    VAI_Penalized: number;
    PIQR: number;
    HRP: number;
    OCI: number;
  };
  platform_breakdown: PlatformScore[];
  zero_click_inclusion_rate: number;
  ugc_health_score?: number;
  evidence?: Record<string, any>;
};
