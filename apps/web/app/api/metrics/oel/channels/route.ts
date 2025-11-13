import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ChannelRow = {
  name: string
  adSpend: number
  adWastePct: number // 0..1
  visitors: number
  visibilityLossPct: number // 0..1
  leadConvPct: number // 0..1
  leadValue: number
  recovered: number
  wastedSpend: number
  lostLeadsValue: number
  oel: number
  efficiencyScore: number // 0..100
}

function synthesizeChannel(name: string, base: number): ChannelRow {
  // Fake-but-plausible per-channel stats
  const adSpend = Math.round(base * (0.6 + Math.random() * 0.8))
  const adWastePct = 0.25 + Math.random() * 0.4 // 25–65%
  const visitors = Math.round(400 + Math.random() * 2000)
  const visibilityLossPct = 0.15 + Math.random() * 0.35 // 15–50%
  const leadConvPct = 0.03 + Math.random() * 0.05 // 3–8%
  const leadValue = 300 + Math.random() * 800
  const recovered = Math.round(adSpend * (0.05 + Math.random() * 0.15))

  // Calculate OEL components
  const wastedSpend = adSpend * adWastePct
  const lostLeadsValue = visitors * visibilityLossPct * leadConvPct * leadValue
  const oel = wastedSpend + lostLeadsValue - recovered

  // Efficiency score (higher is better, 0-100)
  const baselineOEL = adSpend * 0.5 // Industry baseline
  const efficiencyScore = Math.max(0, Math.min(100, 100 - (oel / baselineOEL) * 100))

  return {
    name,
    adSpend,
    adWastePct,
    visitors,
    visibilityLossPct,
    leadConvPct,
    leadValue,
    recovered,
    wastedSpend,
    lostLeadsValue,
    oel,
    efficiencyScore: Math.round(efficiencyScore),
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const domain = url.searchParams.get('domain') || 'example.com'
    const channelsParam = url.searchParams.get('channels') || 'Google Ads,Meta,Display,Organic'
    const channels = channelsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const base = 8000 + Math.random() * 8000
    const rows = channels.map((c, i) => synthesizeChannel(c, base * (0.6 + i * 0.2)))

    // Calculate totals
    const totals = {
      adSpend: rows.reduce((sum, r) => sum + r.adSpend, 0),
      wastedSpend: rows.reduce((sum, r) => sum + r.wastedSpend, 0),
      lostLeadsValue: rows.reduce((sum, r) => sum + r.lostLeadsValue, 0),
      recovered: rows.reduce((sum, r) => sum + r.recovered, 0),
      oel: rows.reduce((sum, r) => sum + r.oel, 0),
      visitors: rows.reduce((sum, r) => sum + r.visitors, 0),
    }

    const avgEfficiencyScore =
      rows.reduce((sum, r) => sum + r.efficiencyScore, 0) / rows.length

    return NextResponse.json({
      success: true,
      domain,
      channels: rows,
      totals,
      avgEfficiencyScore: Math.round(avgEfficiencyScore),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate OEL by channel',
      },
      { status: 500 }
    )
  }
}
