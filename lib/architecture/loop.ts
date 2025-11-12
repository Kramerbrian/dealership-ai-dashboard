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
