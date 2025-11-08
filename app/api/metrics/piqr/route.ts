import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface PIQRInput {
  dealerId: string
  domain?: string
  oel?: number
  oelByChannel?: Array<{
    name: string
    oel: number
    efficiencyScore: number
  }>
  aiv?: number
  qai?: number
  schemaCoverage?: number
  geoIntegrity?: number
}

interface PIQRResult {
  piqr: number // 0..1 (lower is better)
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskDrivers: Array<{
    factor: string
    impact: number
    weight: number
  }>
  recommendations: Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    expectedImpact: number
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PIQRInput = await req.json()
    const { dealerId, domain, oel, oelByChannel, aiv, qai, schemaCoverage, geoIntegrity } = body

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // Fetch OEL by channel if not provided
    let channelData = oelByChannel
    if (!channelData && domain) {
      try {
        const oelRes = await fetch(
          `${req.nextUrl.origin}/api/metrics/oel/channels?domain=${encodeURIComponent(domain)}`
        )
        if (oelRes.ok) {
          const oelData = await oelRes.json()
          channelData = oelData.channels?.map((c: any) => ({
            name: c.name,
            oel: c.oel,
            efficiencyScore: c.efficiencyScore,
          }))
        }
      } catch (e) {
        console.warn('Failed to fetch OEL by channel:', e)
      }
    }

    // Calculate PIQR with OEL as a risk driver
    const totalOEL = oel || channelData?.reduce((sum, c) => sum + c.oel, 0) || 0
    const avgEfficiency = channelData
      ? channelData.reduce((sum, c) => sum + c.efficiencyScore, 0) / channelData.length
      : 70

    // Normalize OEL to 0-1 scale (assuming $50K/month is max risk)
    const oelRisk = Math.min(1, totalOEL / 50000)

    // Calculate other risk factors
    const aivRisk = aiv !== undefined ? (100 - aiv) / 100 : 0.3
    const qaiRisk = qai !== undefined ? (100 - qai) / 100 : 0.2
    const schemaRisk = schemaCoverage !== undefined ? (100 - schemaCoverage) / 100 : 0.15
    const geoRisk = geoIntegrity !== undefined ? (100 - geoIntegrity) / 100 : 0.1
    const efficiencyRisk = (100 - avgEfficiency) / 100

    // Weighted PIQR calculation (OEL gets significant weight)
    const piqr =
      oelRisk * 0.35 + // OEL is major risk driver
      aivRisk * 0.20 +
      qaiRisk * 0.15 +
      schemaRisk * 0.10 +
      geoRisk * 0.10 +
      efficiencyRisk * 0.10

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (piqr < 0.2) riskLevel = 'low'
    else if (piqr < 0.4) riskLevel = 'medium'
    else if (piqr < 0.6) riskLevel = 'high'
    else riskLevel = 'critical'

    // Identify risk drivers
    const riskDrivers = [
      { factor: 'OEL', impact: oelRisk, weight: 0.35 },
      { factor: 'AI Visibility', impact: aivRisk, weight: 0.20 },
      { factor: 'Quality Authority', impact: qaiRisk, weight: 0.15 },
      { factor: 'Schema Coverage', impact: schemaRisk, weight: 0.10 },
      { factor: 'GEO Integrity', impact: geoRisk, weight: 0.10 },
      { factor: 'Channel Efficiency', impact: efficiencyRisk, weight: 0.10 },
    ]
      .filter((d) => d.impact > 0)
      .sort((a, b) => b.impact - a.impact)

    // Generate recommendations
    const recommendations: Array<{
      action: string
      priority: 'high' | 'medium' | 'low'
      expectedImpact: number
    }> = []

    if (oelRisk > 0.3) {
      recommendations.push({
        action: 'Reduce OEL through channel optimization',
        priority: 'high',
        expectedImpact: oelRisk * 0.5,
      })
    }

    if (aivRisk > 0.3) {
      recommendations.push({
        action: 'Improve AI Visibility through schema and content optimization',
        priority: 'high',
        expectedImpact: aivRisk * 0.4,
      })
    }

    if (schemaRisk > 0.2) {
      recommendations.push({
        action: 'Add missing schema markup',
        priority: 'medium',
        expectedImpact: schemaRisk * 0.3,
      })
    }

    const result: PIQRResult = {
      piqr: Math.round(piqr * 1000) / 1000, // Round to 3 decimals
      riskLevel,
      riskDrivers,
      recommendations,
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PIQR calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const dealerId = searchParams.get('dealerId')
    const domain = searchParams.get('domain')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // For GET, we'll need to fetch all metrics first
    // This is a simplified version - in production, fetch from database
    return NextResponse.json({
      success: true,
      message: 'Use POST to calculate PIQR with OEL data',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

