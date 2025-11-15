import { NextRequest, NextResponse } from 'next/server';
import {
  scoreAIVisibility,
  getMetricAlert,
  type EngineCoverage,
} from '@/lib/scoring';

/**
 * /api/marketpulse/compute
 * --------------------------------------------------------------------------
 * Returns mock (or live, if wired to backend) KPI data for a dealership.
 * This is used by:
 *   • Landing Orb (AI Visibility / ATI)
 *   • Onboarding Scan (KPI calibration)
 *   • Dashboard auto-refresh / Pulse
 *
 * Query params:
 *   ?domain=naplesautogroup.com (preferred)
 *   ?dealer=naplesautogroup.com (deprecated, but still supported for backward compatibility)
 * Optional:
 *   ?mock=true (forces randomized sample)
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // Support both 'domain' and 'dealer' params for backward compatibility
  const dealer = (url.searchParams.get('domain') || url.searchParams.get('dealer') || 'unknown-dealer').toLowerCase();
  const mock = url.searchParams.get('mock') === 'true';

  // Simulated base metrics (tweak ranges for realism)
  // TODO: Replace with actual data from database/APIs
  const engineCoverage: EngineCoverage = {
    perplexity: randomBetween(70, 90),
    chatgpt: randomBetween(75, 95),
    gemini: randomBetween(70, 90),
  };

  // Calculate AI Visibility using new scoring formula
  const aivRaw = scoreAIVisibility(engineCoverage);
  const aiv = aivRaw / 100; // Convert to 0-1 scale for backward compatibility

  const base = {
    aiv,
    ati: randomBetween(0.75, 0.9),
    schemaCoverage: randomBetween(0.7, 0.9),
    trustScore: randomBetween(0.8, 0.95),
    cwv: randomBetween(0.85, 0.98),
    ugcHealth: randomBetween(0.7, 0.92),
    geoIntegrity: randomBetween(0.76, 0.91),
    zeroClick: randomBetween(0.35, 0.6),
    // Add alert band for AI Visibility
    aivAlert: getMetricAlert('aiVisibility', aivRaw),
  };

  // AI insight synthesis (human-readable context)
  const summary = getInsightSummary(base);

  // Future: live call to orchestrator service
  // const live = await fetch(`${process.env.ORCHESTRATOR_URL}/compute`, {...})

  const response = {
    dealer,
    timestamp: new Date().toISOString(),
    aiv: round(base.aiv, 2),
    ati: round(base.ati, 2),
    metrics: {
      schemaCoverage: round(base.schemaCoverage, 2),
      trustScore: round(base.trustScore, 2),
      cwv: round(base.cwv, 2),
      ugcHealth: round(base.ugcHealth, 2),
      geoIntegrity: round(base.geoIntegrity, 2),
      zeroClick: round(base.zeroClick, 2),
    },
    summary,
    confidence: round(randomBetween(0.78, 0.94), 2),
  };

  return NextResponse.json(response, { status: 200 });
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round(v: number, dec = 2) {
  return Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec);
}

function getInsightSummary(base: Record<string, number>) {
  const signals: string[] = [];
  if (base.schemaCoverage < 0.75) signals.push('Schema coverage gaps may limit AI discoverability');
  if (base.trustScore < 0.8) signals.push('Trust signals are below cohort average — check GBP or UGC');
  if (base.geoIntegrity < 0.8) signals.push('GEO data inconsistencies detected in structured markup');
  if (base.zeroClick > 0.5) signals.push('High zero-click coverage — AI results may already be summarizing your site');
  if (signals.length === 0) signals.push('All systems nominal. Visibility and trust trending positive.');

  return signals.join(' • ');
}

