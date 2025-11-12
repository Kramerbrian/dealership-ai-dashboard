import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface FixPackROI {
  fixPackId: string
  dealerId: string
  appliedAt: Date
  oelBefore: number
  oelAfter: number
  oelReduction: number
  realizedDollars: number
  confidence: number
  status: 'active' | 'completed' | 'failed'
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const dealerId = searchParams.get('dealerId')
    const fixPackId = searchParams.get('fixPackId')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from database
    // For now, return synthetic data
    const fixPacks: FixPackROI[] = [
      {
        fixPackId: fixPackId || 'fixpack-1',
        dealerId,
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        oelBefore: 24000,
        oelAfter: 18000,
        oelReduction: 6000,
        realizedDollars: 6000,
        confidence: 0.87,
        status: 'active',
      },
      {
        fixPackId: 'fixpack-2',
        dealerId,
        appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        oelBefore: 30000,
        oelAfter: 22000,
        oelReduction: 8000,
        realizedDollars: 8000,
        confidence: 0.92,
        status: 'completed',
      },
    ]

    const filtered = fixPackId
      ? fixPacks.filter((fp) => fp.fixPackId === fixPackId)
      : fixPacks

    const totalRealized = filtered.reduce((sum, fp) => sum + fp.realizedDollars, 0)
    const totalReduction = filtered.reduce((sum, fp) => sum + fp.oelReduction, 0)

    return NextResponse.json({
      success: true,
      fixPacks: filtered,
      summary: {
        totalFixPacks: filtered.length,
        totalRealized,
        totalReduction,
        avgConfidence:
          filtered.reduce((sum, fp) => sum + fp.confidence, 0) / filtered.length,
      },
    })
  } catch (error) {
    console.error('Fix Pack ROI error:', error)
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
    const { dealerId, fixPackId, oelBefore, oelAfter } = body

    if (!dealerId || !fixPackId || oelBefore === undefined || oelAfter === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, fixPackId, oelBefore, oelAfter' },
        { status: 400 }
      )
    }

    const oelReduction = oelBefore - oelAfter
    const realizedDollars = Math.max(0, oelReduction) // Only positive reductions count

    // TODO: Save to database
    const fixPack: FixPackROI = {
      fixPackId,
      dealerId,
      appliedAt: new Date(),
      oelBefore,
      oelAfter,
      oelReduction,
      realizedDollars,
      confidence: 0.85,
      status: 'active',
    }

    return NextResponse.json({
      success: true,
      fixPack,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

