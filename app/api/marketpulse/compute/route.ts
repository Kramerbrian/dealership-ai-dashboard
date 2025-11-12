import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

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
 *   ?dealer=naplesautogroup.com
 * Optional:
 *   ?mock=true (forces randomized sample)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const dealer = url.searchParams.get('dealer')?.toLowerCase() || 'unknown-dealer'
    const mock = url.searchParams.get('mock') === 'true'

    // 🚀 OPTION: Live call to orchestrator service (uncomment when ready)
    // if (!mock && process.env.ORCHESTRATOR_API && process.env.ORCHESTRATOR_TOKEN) {
    //   try {
    //     const res = await fetch(`${process.env.ORCHESTRATOR_API}/compute`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${process.env.ORCHESTRATOR_TOKEN}`,
    //       },
    //       body: JSON.stringify({ dealer }),
    //     })
    //     if (res.ok) {
    //       const liveData = await res.json()
    //       return NextResponse.json(liveData, { status: 200 })
    //     }
    //   } catch (error) {
    //     console.error('Orchestrator API error:', error)
    //     // Fall through to mock data
    //   }
    // }

    // Simulated base metrics (tweak ranges for realism)
    const base = {
      aiv: randomBetween(0.78, 0.93),
      ati: randomBetween(0.75, 0.9),
      schemaCoverage: randomBetween(0.7, 0.9),
      trustScore: randomBetween(0.8, 0.95),
      cwv: randomBetween(0.85, 0.98),
      ugcHealth: randomBetween(0.7, 0.92),
      geoIntegrity: randomBetween(0.76, 0.91),
      zeroClick: randomBetween(0.35, 0.6),
    }

    // AI insight synthesis (human-readable context)
    const summary = getInsightSummary(base)

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
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error: any) {
    console.error('[marketpulse/compute] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function round(v: number, dec = 2): number {
  return Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)
}

function getInsightSummary(base: Record<string, number>): string {
  const signals: string[] = []

  if (base.schemaCoverage < 0.75) {
    signals.push('Schema coverage gaps may limit AI discoverability')
  }
  if (base.trustScore < 0.8) {
    signals.push('Trust signals are below cohort average — check GBP or UGC')
  }
  if (base.geoIntegrity < 0.8) {
    signals.push('GEO data inconsistencies detected in structured markup')
  }
  if (base.zeroClick > 0.5) {
    signals.push(
      'High zero-click coverage — AI results may already be summarizing your site'
    )
  }
  if (signals.length === 0) {
    signals.push('All systems nominal. Visibility and trust trending positive.')
  }

  return signals.join(' • ')
}
