/**
 * POST /api/pulse/debug/seed
 * 
 * Fires the two test PulseEvents from the browser (no cURL needed)
 * 
 * This endpoint:
 * 1. Fires the Toyota OEM program change event
 * 2. Fires the AI visibility drop event
 * 3. Returns the results
 * 
 * Use this to test the pulse ingestion flow without needing cURL.
 */

import { NextRequest, NextResponse } from 'next/server';

const TOYOTA_LEASE_EVENT = {
  id: 'pulse_evt_toyota_camry_lease_2025_11_15_SET',
  ts: '2025-11-13T03:05:00Z',
  dealer_id: 'crm_naples_toyota',
  brand: 'Toyota',
  level: 'critical',
  kind: 'market_signal',
  source: 'aim_vindex_suite',
  tags: [
    'oem_program_change',
    'toyota',
    'camry',
    'lease',
    'incentive',
    'SET_region',
  ],
  summary: 'New SET Toyota Camry lease subvention announced for Naples DMA.',
  details: {
    program_type: 'lease',
    region: 'SET',
    effective_from: '2025-11-15',
    effective_to: '2026-01-02',
    msrp_cap: 36500,
    rebate_delta: 750,
    mf_delta_bps: -35,
    residual_delta_pct: 1.0,
    headline: '2025 Camry LE lease $299/mo for 36 months, $2,999 due at signing',
  },
  metrics: {
    estimated_used_price_impact_pct: -2.7,
    near_new_gap_target_ratio: 0.87,
  },
  dedupe_key: 'toyota_camry_lease_SET_2025-11-15',
  thread_ref: {
    type: 'market',
    key: 'oem_toyota_camry_lease',
  },
};

const AIV_DROP_EVENT = {
  id: 'pulse_evt_aiv_drop_2025_11_13_naples_toyota',
  ts: '2025-11-13T10:15:00Z',
  dealer_id: 'crm_naples_toyota',
  brand: 'Toyota',
  level: 'high',
  kind: 'kpi_delta',
  source: 'aim_visibility_monitor',
  tags: [
    'ai_visibility_drop',
    'chatgpt',
    'perplexity',
    'zero_click',
  ],
  summary: 'AI Visibility Score dropped 7 points vs last 7 days.',
  details: {
    aiv_prev: 78,
    aiv_current: 71,
    window: '7d',
    platforms: {
      chatgpt: { prev: 0.42, current: 0.34 },
      perplexity: { prev: 0.39, current: 0.31 },
      gemini: { prev: 0.47, current: 0.45 },
    },
  },
  metrics: {
    aiv_delta: -7,
    zero_click_coverage_delta: -6,
  },
  dedupe_key: 'aiv_drop_7pt_2025-11-13_naples_toyota',
  thread_ref: {
    type: 'kpi',
    key: 'ai_visibility',
  },
};

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (request.headers.get('origin') || 'http://localhost:3000');
    
    const ingestUrl = `${baseUrl}/api/pulse/ingest`;
    
    const results = {
      events: [] as Array<{ event: string; success: boolean; response?: any; error?: string }>,
      timestamp: new Date().toISOString(),
    };

    // Fire Toyota lease event
    try {
      const response1 = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(TOYOTA_LEASE_EVENT),
      });

      const data1 = await response1.json();
      results.events.push({
        event: 'Toyota Camry Lease Subvention',
        success: response1.ok,
        response: data1,
        error: response1.ok ? undefined : `HTTP ${response1.status}`,
      });
    } catch (error: any) {
      results.events.push({
        event: 'Toyota Camry Lease Subvention',
        success: false,
        error: error.message || String(error),
      });
    }

    // Fire AI visibility drop event
    try {
      const response2 = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(AIV_DROP_EVENT),
      });

      const data2 = await response2.json();
      results.events.push({
        event: 'AI Visibility Score Drop',
        success: response2.ok,
        response: data2,
        error: response2.ok ? undefined : `HTTP ${response2.status}`,
      });
    } catch (error: any) {
      results.events.push({
        event: 'AI Visibility Score Drop',
        success: false,
        error: error.message || String(error),
      });
    }

    const allSuccess = results.events.every(e => e.success);

    return NextResponse.json(results, {
      status: allSuccess ? 200 : 207, // 207 = Multi-Status
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fire test events',
        message: error.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pulse/debug/seed
 * 
 * Returns the event payloads for inspection (doesn't fire them)
 */
export async function GET() {
  return NextResponse.json({
    events: {
      toyota_lease: TOYOTA_LEASE_EVENT,
      aiv_drop: AIV_DROP_EVENT,
    },
    usage: {
      fire_events: 'POST /api/pulse/debug/seed',
      inspect_events: 'GET /api/pulse/debug/seed',
    },
  });
}

