/**
 * DealershipAI Agent Type Definitions
 * Canonical TypeScript types for agentic commerce intelligence
 */

// ===== Core Agent Types =====

export interface DAIAgent {
  id: string;
  name: string;
  type: 'autonomous' | 'supervised' | 'hybrid';
  model: string;
  temperature: number;
  max_tokens: number;
  confidence_threshold: number;
}

export interface AgentCapability {
  name: string;
  description: string;
  tools: string[];
  expertise: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ===== Scoring Framework =====

export interface ClarityScore {
  value: number; // 0-100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: {
    geo: number;
    schema: number;
    ugc: number;
    cwv: number;
    freshness: number;
  };
}

export interface QAIScore {
  value: number; // 0-100
  components: {
    expertise: number;
    authority: number;
    trustworthiness: number;
    experience: number;
  };
  level: 'high_trust' | 'medium_trust' | 'low_trust';
}

export interface OCICalculation {
  monthly_at_risk: number;
  annual_at_risk: number;
  roi_vs_subscription: number;
  issues: OCIIssue[];
}

export interface OCIIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact_monthly: number;
  fix_effort: string;
  autoFixAvailable: boolean;
}

// ===== Platform Targets =====

export interface PlatformScores {
  chatgpt: number;
  claude: number;
  perplexity: number;
  gemini: number;
  copilot: number;
}

export interface PlatformTarget {
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  visibility_weight: number;
}

// ===== Commerce Orchestrator =====

export interface CommerceOrchestrator {
  name: string;
  tagline: string;
  mode: 'hybrid' | 'autonomous' | 'supervised';
  optimization_target: 'profit_margin' | 'volume' | 'quality';
}

export interface EconomicsConfig {
  target_profit_margin: number;
  cost_per_real_query: number;
  subscription_arpu: number;
  blending_strategy: {
    real_percentage: number;
    synthetic_percentage: number;
    real_query_rate: number;
  };
}

export interface IntelligenceSource {
  provider: string;
  cost: number;
  refresh_interval: number;
  reliability: number;
}

// ===== Caching Strategy =====

export interface CacheLayer {
  name: string;
  ttl: number; // seconds
  hit_rate_target: number; // 0-1
  storage: 'redis' | 'memory' | 'disk';
  key_pattern: string;
  variance_range?: [number, number];
}

export interface CachingStrategy {
  layers: CacheLayer[];
  invalidation: {
    on_demand: boolean;
    force_refresh_param: string;
  };
}

// ===== Analysis Pipeline =====

export interface PipelineStep {
  name: string;
  priority: number;
  expected_hit_rate?: number;
  execution_rate?: number;
  cost: number;
  parallel?: boolean;
  sources?: string[];
  fallback?: string;
  weights?: Record<string, number>;
}

export interface AnalysisPipeline {
  steps: PipelineStep[];
}

// ===== Revenue Intelligence =====

export interface IssueCategory {
  id: string;
  avg_impact_monthly: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  auto_fix_available: boolean;
}

export interface ROICalculation {
  formula: string;
  target_roi: number;
  confidence_threshold: number;
}

export interface RevenueIntelligence {
  oci_calculation: {
    formula: string;
    issue_categories: IssueCategory[];
  };
  roi_calculation: ROICalculation;
}

// ===== Commerce Funnel =====

export interface FunnelStage {
  name: string;
  conversion_target: number; // 0-1
  tools?: string[];
  lead_capture?: boolean;
  sequence?: string[];
  automation?: string;
  duration_days?: number;
  features?: string[];
  arpu?: number;
  churn_target?: number;
}

export interface FunnelMetrics {
  cac_target: number;
  ltv_target: number;
  ltv_cac_ratio: number;
}

export interface CommerceFunnel {
  stages: FunnelStage[];
  metrics: FunnelMetrics;
}

// ===== Autonomous Features =====

export interface SelfHealing {
  enabled: boolean;
  max_retries: number;
  healing_methods: string[];
}

export interface TaskManagement {
  dependency_resolution: 'automatic' | 'manual';
  priority_sorting: string[];
  progress_tracking: boolean;
}

export interface ErrorHandling {
  graceful_degradation: boolean;
  fallback_chain: string[];
}

export interface AutonomousFeatures {
  self_healing: SelfHealing;
  task_management: TaskManagement;
  error_handling: ErrorHandling;
}

// ===== Monitoring =====

export interface Monitoring {
  business_metrics: string[];
  technical_metrics: string[];
  alerts: Record<string, number>;
}

// ===== Top-Level Configurations =====

export interface DAIAgentConfig {
  $schema: string;
  id: string;
  version: string;
  name: string;
  description: string;
  agent: DAIAgent;
  capabilities: AgentCapability[];
  scoring_framework: {
    clarity_score: any;
    qai_score: any;
    oci_calculation: any;
  };
  data_strategy: {
    caching: any;
    pooling: any;
    blending: any;
    free_sources: string[];
  };
  orchestration: any;
  platform_targets: Record<string, PlatformTarget>;
  integration: any;
  monitoring: Monitoring;
  metadata: {
    created: string;
    updated: string;
    author: string;
    version_notes: string;
  };
}

export interface DAICommerceConfig {
  $schema: string;
  id: string;
  version: string;
  name: string;
  description: string;
  orchestrator: CommerceOrchestrator;
  economics: EconomicsConfig;
  intelligence_sources: {
    real_ai: any;
    free_data: Record<string, IntelligenceSource>;
  };
  caching_strategy: CachingStrategy;
  analysis_pipeline: AnalysisPipeline;
  revenue_intelligence: RevenueIntelligence;
  commerce_funnel: CommerceFunnel;
  autonomous_features: AutonomousFeatures;
  monitoring: Monitoring;
  compliance: any;
  metadata: {
    created: string;
    updated: string;
    author: string;
    version_notes: string;
  };
}

// ===== Runtime Types =====

export interface DAIRuntimeConfig {
  mode: 'autonomous' | 'supervised' | 'hybrid';
  profitMarginTarget: number;
  realQueryRate: number;
  confidenceThreshold: number;
  cachingEnabled: boolean;
  selfHealingEnabled: boolean;
}

export interface AnalysisRequest {
  domain: string;
  source?: 'chatgpt_gpt' | 'landing_page' | 'dashboard';
  options?: {
    forceRefresh?: boolean;
    includeCompetitors?: boolean;
  };
}

export interface AnalysisResponse {
  success: boolean;
  clarityScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  platformScores: PlatformScores;
  pillarScores: {
    geo: number;
    schema: number;
    ugc: number;
    cwv: number;
    freshness: number;
  };
  issues: OCIIssue[];
  revenueImpact: OCICalculation;
  metadata: {
    cached: boolean;
    pooled: boolean;
    real: boolean;
    costUSD: number;
    timestamp: string;
  };
}
