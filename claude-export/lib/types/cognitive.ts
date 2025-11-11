export type CognitiveMode = 'drive' | 'autopilot' | 'insights';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export type MetricTrend = 'up' | 'down' | 'stable';

export interface ClarityMetrics {
  score: number;
  delta: number;
  trend: MetricTrend;
  components: {
    aiv: number; // AI Visibility Index
    oel: number; // Opportunity Efficiency Loss
    trust: number; // Trust Score
    freshness: number;
  };
}

export interface ActionItem {
  id: string;
  urgency: Urgency;
  title: string;
  impact: string; // "$4.7K" or "+8 AIV"
  effort: string; // "5 min"
  category: string;
  autoFixAvailable: boolean;
  handler?: () => Promise<void>;
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
    data?: unknown;
  };
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
