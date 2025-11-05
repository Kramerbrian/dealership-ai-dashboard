/**
 * Helper functions for building orchestrator snapshot data
 */

import { db } from '@/lib/db';

/**
 * Build diagnostics payload
 */
export async function buildDiagnosticsPayload() {
  try {
    // Get MSRP sync status
    const msrpSync = await getMsrpState();
    
    // Get AI score refresh status
    const aiScores = {
      aivRefreshed: 0,
      atiRefreshed: 0,
      cisRefreshed: 0,
      refreshDurationMs: 0,
    };

    // Calculate freshness score (0-1)
    const now = Date.now();
    const lastMsrpRun = msrpSync.lastRun ? new Date(msrpSync.lastRun).getTime() : 0;
    const msrpAgeMs = now - lastMsrpRun;
    const msrpFreshness = Math.max(0, 1 - msrpAgeMs / (24 * 60 * 60 * 1000)); // Decay over 24h
    
    const freshnessScore = (msrpFreshness * 0.7 + 0.3); // Weighted average with base freshness
    
    // Business identity match (simulated - would come from actual matching service)
    const businessIdentityMatch = 0.99;

    return {
      freshnessScore,
      businessIdentityMatch,
      msrpSync,
      aiScores,
      status: msrpSync.status === 'ok' ? 'ok' : msrpSync.status === 'warning' ? 'warning' : 'error',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[snapshot] Error building diagnostics:', error);
    return {
      freshnessScore: 0.5,
      businessIdentityMatch: 0.95,
      msrpSync: {
        lastRun: null,
        count: 0,
        avgDeltaPct: 0,
        pulseLatencyMs: 0,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      aiScores: {
        aivRefreshed: 0,
        atiRefreshed: 0,
        cisRefreshed: 0,
        refreshDurationMs: 0,
      },
      status: 'error',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get MSRP sync state
 */
export async function getMsrpState() {
  try {
    // Check for recent MSRP sync job
    // In production, this would query your job queue or database
    const lastRun = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // Simulate 2h ago
    
    // Get price changes from last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // In production, query actual price changes from database
    const count = 0;
    const avgDeltaPct = 0;
    const pulseLatencyMs = 150;

    // Determine status
    const ageMs = Date.now() - new Date(lastRun).getTime();
    const ageHours = ageMs / (60 * 60 * 1000);
    
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message = 'MSRP sync operational';
    
    if (ageHours > 48) {
      status = 'error';
      message = 'MSRP sync overdue (>48h)';
    } else if (ageHours > 24) {
      status = 'warning';
      message = 'MSRP sync delayed (>24h)';
    }

    return {
      lastRun,
      count,
      avgDeltaPct,
      delta: avgDeltaPct,
      pulseLatencyMs,
      status,
      message,
      source: 'orchestrator',
    };
  } catch (error) {
    return {
      lastRun: null,
      count: 0,
      avgDeltaPct: 0,
      delta: 0,
      pulseLatencyMs: 0,
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Unknown error',
      source: 'orchestrator',
    };
  }
}

/**
 * Fetch Pulse data
 */
export async function fetchPulse(options: { window?: string } = {}) {
  try {
    const window = options.window || '7d';
    
    // In production, this would fetch from your Pulse service
    // For now, return mock data structure
    return {
      version: '2025.11.04',
      window,
      actions: [],
      radar: {
        dealers: 0,
        intents: 0,
        fixes: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[snapshot] Error fetching Pulse:', error);
    return {
      version: '2025.11.04',
      window: options.window || '7d',
      actions: [],
      radar: {
        dealers: 0,
        intents: 0,
        fixes: 0,
      },
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

