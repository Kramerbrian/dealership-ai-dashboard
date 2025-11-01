/**
 * This file was auto-generated from openapi/pulse.yaml
 * Do not make direct changes to this file.
 */

export interface AppraiseSDKResponse {
  freshnessScore: number;
  businessIdentityMatch: number;
  pulse?: PulseData;
  msrpSync?: MsrpSyncData;
  graph?: GraphData;
  scenario?: ScenarioData;
  diagnostics: MsrpSyncDiagnostics;
  meta: MetaData;
}

export interface MsrpSyncDiagnostics {
  /** ISO 8601 timestamp of last sync run */
  lastRun: string;
  /** Number of records synchronized */
  count: number;
  /** Average MSRP delta percentage */
  avgDeltaPct?: number;
  /** Pulse integration latency in milliseconds */
  pulseLatencyMs?: number;
  aiScores?: AiScoreStats;
  aiScoresSummary?: AiScoreSummary;
  /** Overall diagnostic status */
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  /** Human-readable status message */
  message?: string;
}

export interface AiScoreStats {
  /** Number of AVI scores refreshed */
  aivRefreshed?: number;
  /** Number of ATI scores refreshed */
  atiRefreshed?: number;
  /** Number of CIS scores refreshed */
  cisRefreshed?: number;
  /** Total refresh duration in milliseconds */
  refreshDurationMs?: number;
}

export interface AiScoreSummary {
  /** Average AI Visibility Index score */
  avgAvi: number;
  /** Average AI Trust Index score */
  avgAti: number;
  /** Average Competitive Intelligence Score */
  avgCis: number;
  /** Total number of VINs analyzed */
  totalVins: number;
}

export interface AiScoresResponse {
  analysis?: Record<string, any>;
  presentation?: Record<string, any>;
  agentic_conversion_rate?: number | null;
  zero_click_coverage?: number | null;
  trust_pass_rate?: number | null;
  vin_to_intent_latency_ms?: number | null;
  usage?: {
    remaining: number;
    tier: string;
  };
}

export interface PulseData {
  trends?: Array<Record<string, any>>;
  signals?: Record<string, any>;
}

export interface MsrpSyncData {
  lastSync?: string;
  records?: Array<Record<string, any>>;
}

export interface GraphData {
  nodes?: Array<Record<string, any>>;
  edges?: Array<Record<string, any>>;
}

export interface ScenarioData {
  scenarios?: Array<Record<string, any>>;
}

export interface MetaData {
  timestamp: string;
  version: string;
  requestId?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// API Request/Response type helpers
export namespace MsrpSyncAPI {
  export interface GetRequest {
    tenantId?: string;
    includeAiScores?: boolean;
  }

  export type GetResponse = AppraiseSDKResponse;
}

export namespace AiScoresAPI {
  export interface GetRequest {
    origin: string;
    force_refresh?: boolean;
  }

  export type GetResponse = AiScoresResponse;
}

// Utility types for type-safe API calls
export type DiagnosticsStatus = MsrpSyncDiagnostics['status'];
export type ApiError = ErrorResponse;
