export type LoopStage = 'sense' | 'predict' | 'act' | 'learn' | 'reveal' | 'dissolve';

export interface LoopSignal {
  id: string;
  stage: LoopStage;
  kpi?: string;
  delta?: number;
  urgency?: 'critical'|'high'|'medium'|'low';
  payload?: Record<string, unknown>;
  ts: string;
}

export interface Governance {
  clarity_protocol: 'strict' | 'advisory';
  zero_fracture: boolean;
  identity_domains: string[]; // CRM, DMS, GBP, Ads, Reviews
}

export interface MeshNode {
  id: string;
  region: string;
  weights: { trust: number; visibility: number; ops: number };
}

export interface InevitabilitySpec {
  governance: Governance;
  mesh: MeshNode[];
  self_healing: {
    schema_autofix: boolean;
    latency_reroute_ms: number;
    threshold_adaptivity: 'auto'|'manual';
  };
  market_consciousness: {
    map_enabled: boolean;
    forecast_hours: number;
  };
}

export const DEFAULT_SPEC: InevitabilitySpec = {
  governance: {
    clarity_protocol: 'strict',
    zero_fracture: true,
    identity_domains: ['CRM', 'DMS', 'Inventory', 'GBP', 'Ads', 'Reviews']
  },
  mesh: [
    { id: 'naples-fl', region: 'FL-South', weights: { trust: 0.82, visibility: 0.76, ops: 0.71 } },
    { id: 'fort-myers', region: 'FL-South', weights: { trust: 0.79, visibility: 0.73, ops: 0.69 } }
  ],
  self_healing: {
    schema_autofix: true,
    latency_reroute_ms: 120,
    threshold_adaptivity: 'auto'
  },
  market_consciousness: {
    map_enabled: true,
    forecast_hours: 48
  }
};

/**
 * Deployment Phases for Inevitability Rollout
 */
export interface DeploymentPhase {
  name: string;
  focus: string;
  outcome: string;
  milestones: string[];
  duration_weeks: number;
}

export const DEPLOYMENT_ROADMAP: DeploymentPhase[] = [
  {
    name: 'Alpha',
    focus: 'Pilot store neural twin',
    outcome: 'Self-healing baseline validated',
    milestones: [
      'Single-store cognition mesh deployed',
      'Schema autofix validated (100 repairs)',
      'Latency reroute tested (<120ms)',
      'Baseline KPI deltas captured'
    ],
    duration_weeks: 4
  },
  {
    name: 'Beta',
    focus: '5-store cognition mesh',
    outcome: 'Federated learning proven',
    milestones: [
      'Cross-store learning verified',
      'Anomaly detection 48h ahead',
      'Market consciousness map live',
      'Zero-fracture identity validated'
    ],
    duration_weeks: 8
  },
  {
    name: 'Gamma',
    focus: 'National deployment',
    outcome: 'Collective intelligence achieved',
    milestones: [
      'Network-wide mesh active',
      'Predictive accuracy >85%',
      'Cultural integration confirmed',
      'Inevitability metrics met'
    ],
    duration_weeks: 12
  }
];

/**
 * Cultural Integration Metrics
 */
export interface CultureMetric {
  principle: string;
  measurement: string;
  target_threshold: number;
  current_score?: number;
}

export const CULTURE_METRICS: CultureMetric[] = [
  {
    principle: 'Replace belief with math',
    measurement: 'Decisions backed by data %',
    target_threshold: 90,
    current_score: 73
  },
  {
    principle: 'Clarity = how well you are seen',
    measurement: 'Schema coverage %',
    target_threshold: 95,
    current_score: 82
  },
  {
    principle: 'Trust = how much system believes you',
    measurement: 'E-E-A-T score',
    target_threshold: 85,
    current_score: 78
  },
  {
    principle: 'Best End User wins',
    measurement: 'Customer satisfaction delta',
    target_threshold: 15,
    current_score: 11
  }
];
