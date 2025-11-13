export type CognitiveMode = 'drive' | 'autopilot' | 'insights' | 'pulse';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export type MetricTrend = 'up' | 'down' | 'stable';

export type FixTier = 'tier1_diy' | 'tier2_guided' | 'tier3_dfy';

export interface ClarityMetrics {
  score: number;
  delta: number;
  trend: MetricTrend;
  components: {
    aiv: number;       // AI Visibility Index
    oel: number;       // Opportunity Efficiency Loss ($)
    trust: number;     // Algorithmic Trust Index
    freshness: number; // Content freshness
  };
}

export interface ActionItem {
  id: string;
  urgency: Urgency;
  title: string;
  impact: string;  // "$4.7K" or "+8 AIV"
  effort: string;  // "5 min"
  category: string;
  autoFixAvailable: boolean;
  handler: () => Promise<void>;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  metric: string;
  delta: number;
  timeframe: string;
  proof?: {
    type: 'chart' | 'screenshot';
    data?: any;
  };
}

export interface Incident {
  id: string;
  urgency: Urgency;
  impact_points: number;   // normalized: AIV delta or $RAR points
  time_to_fix_min: number; // ETA to fix
  title: string;
  reason: string;          // "Why this matters"
  receipts?: Array<{ label: string; kpi?: string; before?: any; after?: any }>;
  category: 'schema'|'ugc'|'geo'|'cwv'|'pricing'|'ai_visibility'|'ops';
  autofix: boolean;
  fix_tiers: FixTier[];    // DIY / Guided / DFY
}

export interface PulseEvent {
  id: string;
  ts: string;   // ISO
  level: Urgency;
  title: string;
  detail: string;
  kpi?: string;
  delta?: number | string;
}

export interface VehicleStatus {
  mode: CognitiveMode;
  clarity: ClarityMetrics;
  actions: ActionItem[];
  insights: Insight[];
  voice: {
    enabled: boolean;
    state: VoiceState;
  };
}
