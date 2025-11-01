/**
 * Orchestrator Diagnostics Library
 *
 * Provides unified diagnostics combining MSRP sync monitoring,
 * AI score summaries, and orchestrator health metrics.
 */

import type {
  AppraiseSDKResponse,
  MsrpSyncDiagnostics,
  AiScoreSummary,
  MetaData,
  PulseData,
  MsrpSyncData,
  GraphData
} from '@/src/types/pulse';

export interface DiagnosticsOptions {
  tenantId?: string;
  includeAiScores?: boolean;
  includePulse?: boolean;
  includeGraph?: boolean;
}

interface MsrpStats {
  lastRun: string | null;
  count: number;
  avgDeltaPct?: number;
  pulseLatencyMs?: number;
}

/**
 * Fetches AI scores summary from the API
 */
export async function getAiScoresSummary(origin: string): Promise<AiScoreSummary | null> {
  try {
    const response = await fetch(`/api/ai-scores?origin=${encodeURIComponent(origin)}`);

    if (!response.ok) {
      console.error(`Failed to fetch AI scores: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Map the API response to AiScoreSummary format
    return {
      avgAvi: data.agentic_conversion_rate || 0,
      avgAti: data.trust_pass_rate || 0,
      avgCis: data.zero_click_coverage || 0,
      totalVins: 0 // This would need to be provided by the API
    };
  } catch (error) {
    console.error('Error fetching AI scores summary:', error);
    return null;
  }
}

/**
 * Gets MSRP sync statistics from the database
 */
async function getMsrpSyncStats(tenantId?: string): Promise<MsrpStats> {
  // TODO: Implement actual database query
  // For now, return stub data

  return {
    lastRun: new Date().toISOString(),
    count: 0,
    avgDeltaPct: 0,
    pulseLatencyMs: 0
  };
}

/**
 * Calculates diagnostic status based on metrics
 */
function calculateStatus(stats: MsrpStats): MsrpSyncDiagnostics['status'] {
  if (!stats.lastRun) {
    return 'unknown';
  }

  const latency = stats.pulseLatencyMs || 0;

  if (latency > 5000) {
    return 'critical';
  }

  if (latency > 1000 || stats.count === 0) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Calculates freshness score (0-100) based on last run time
 *
 * - 100%: Data < 1 hour old
 * - 50%: Data ~24 hours old
 * - 0%: Data > 7 days old
 */
export function calculateFreshnessScore(diagnostics: MsrpSyncDiagnostics): number {
  const now = Date.now();
  const lastRun = new Date(diagnostics.lastRun).getTime();
  const ageMs = now - lastRun;

  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  // Perfect score for data less than 1 hour old
  if (ageMs < ONE_HOUR) {
    return 100;
  }

  // Zero score for data older than 1 week
  if (ageMs > ONE_WEEK) {
    return 0;
  }

  // Linear decay between 1 hour and 1 week
  const decay = (ageMs / ONE_WEEK) * 100;
  return Math.max(0, 100 - decay);
}

/**
 * Gets comprehensive diagnostics data
 */
export async function getDiagnostics(
  options: DiagnosticsOptions = {}
): Promise<AppraiseSDKResponse> {
  const {
    tenantId,
    includeAiScores = true,
    includePulse = false,
    includeGraph = false
  } = options;

  // Get MSRP sync stats
  const msrpStats = await getMsrpSyncStats(tenantId);

  // Get AI scores if requested
  let aiScoresSummary: AiScoreSummary | undefined;
  if (includeAiScores && tenantId) {
    const scores = await getAiScoresSummary(tenantId);
    if (scores) {
      aiScoresSummary = scores;
    }
  }

  // Build diagnostics object
  const diagnostics: MsrpSyncDiagnostics = {
    lastRun: msrpStats.lastRun || new Date().toISOString(),
    count: msrpStats.count || 0,
    avgDeltaPct: msrpStats.avgDeltaPct,
    pulseLatencyMs: msrpStats.pulseLatencyMs,
    aiScoresSummary,
    status: calculateStatus(msrpStats),
    message: getStatusMessage(calculateStatus(msrpStats))
  };

  // Calculate freshness score
  const freshnessScore = calculateFreshnessScore(diagnostics);

  // Build metadata
  const meta: MetaData = {
    timestamp: new Date().toISOString(),
    version: '2025.11.03',
    requestId: crypto.randomUUID()
  };

  // Build response
  const response: AppraiseSDKResponse = {
    freshnessScore,
    businessIdentityMatch: 100, // TODO: Implement actual calculation
    diagnostics,
    meta
  };

  // Add optional data
  if (includePulse) {
    response.pulse = await getPulseData(tenantId);
  }

  if (includeGraph) {
    response.graph = await getGraphData(tenantId);
  }

  return response;
}

/**
 * Gets pulse data (stub)
 */
async function getPulseData(tenantId?: string): Promise<PulseData> {
  // TODO: Implement actual pulse data retrieval
  return {
    trends: [],
    signals: {}
  };
}

/**
 * Gets graph data (stub)
 */
async function getGraphData(tenantId?: string): Promise<GraphData> {
  // TODO: Implement actual graph data retrieval
  return {
    nodes: [],
    edges: []
  };
}

/**
 * Gets human-readable status message
 */
function getStatusMessage(status: MsrpSyncDiagnostics['status']): string {
  switch (status) {
    case 'healthy':
      return 'All systems operational';
    case 'degraded':
      return 'Performance issues detected';
    case 'critical':
      return 'Service outage or severe issues';
    case 'unknown':
    default:
      return 'Unable to determine status';
  }
}

/**
 * Type-safe API client for diagnostics endpoints
 */
export const DiagnosticsAPI = {
  /**
   * Gets MSRP sync diagnostics
   */
  async getMsrpSync(params: { tenantId?: string; includeAiScores?: boolean } = {}) {
    return getDiagnostics({
      tenantId: params.tenantId,
      includeAiScores: params.includeAiScores ?? true,
      includePulse: true,
      includeGraph: false
    });
  },

  /**
   * Gets AI scores for a dealer
   */
  async getAiScores(origin: string, forceRefresh: boolean = false) {
    const url = `/api/ai-scores?origin=${encodeURIComponent(origin)}&force_refresh=${forceRefresh}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch AI scores: ${response.status}`);
    }

    return response.json();
  }
};
