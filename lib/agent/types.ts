export type QuoteItem = { quote: string; source: string; context_tag: string };

export type AgentConfig = {
  project_name: string;
  version: string;
  guardrails: {
    profanity_limit: 'PG';
    topic_avoidance: string[];
    scarcity_level: 'MAXIMUM_EASTER_EGG';
  };
  persona_profile: { style: string; wit_blend: string[]; directorial_inspiration: string[] };
  movie_references: string[];
  dAI_agent_engine_plan: {
    component_name: string;
    tier_gating_logic: Record<string, { max_rating: 'PG'; style: string }>;
    selection_logic: {
      mechanism: string;
      scarcity_control: string; // human-readable rule
      fields_used: string[];
      formula_concept: string;
    };
  };
  tier_1_pg_quotes_baseline: QuoteItem[];
};

export type QuoteTelemetry = {
  quote: string;
  source: string;
  last_used: number;   // ms epoch
  usage_count: number; // int
  subtlety_index: number; // 0..1 (higher = more subtle)
};

