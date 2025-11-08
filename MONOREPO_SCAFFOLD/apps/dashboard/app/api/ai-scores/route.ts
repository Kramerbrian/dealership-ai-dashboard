import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import type { KPIMetrics } from '@dealershipai/shared'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const dealerId = searchParams.get('dealerId')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch actual metrics from database/Orchestrator
    const metrics: KPIMetrics = {
      aiv: 73, // AI Visibility
      qai: 82, // Quality Authority Index
      piqr: 0.12, // Performance Impact Quality Risk
      oci: 24000, // Opportunity Cost of Inaction (dollars)
      ati: 78, // Algorithmic Trust Index
      asrRoi: 65, // ASR ROI
    }

    return NextResponse.json({
      success: true,
      metrics,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI scores error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { dealerId, domain } = body

    // Trigger score calculation via Orchestrator
    const orchestratorResponse = await fetch(
      `${req.nextUrl.origin}/api/orchestrator`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'compute_qai',
          dealerId,
          domain,
        }),
      }
    )

    const data = await orchestratorResponse.json()

    return NextResponse.json({
      success: data.success,
      metrics: data.result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

