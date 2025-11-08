import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import type { Mission } from '@dealershipai/shared'

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

    // TODO: Fetch missions from database
    const missions: Mission[] = [
      {
        id: '1',
        dealerId,
        agentId: 'schema-king',
        status: 'active',
        confidence: 0.87,
        startedAt: new Date(),
        category: 'quick_win',
        evidence: [],
      },
      {
        id: '2',
        dealerId,
        agentId: 'mystery-shop',
        status: 'queued',
        confidence: 0.75,
        startedAt: new Date(),
        category: 'strategic',
        evidence: [],
      },
    ]

    return NextResponse.json({
      success: true,
      missions,
    })
  } catch (error) {
    console.error('Missions API error:', error)
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
    const { dealerId, agentId, category } = body

    if (!dealerId || !agentId) {
      return NextResponse.json(
        { error: 'dealerId and agentId are required' },
        { status: 400 }
      )
    }

    // TODO: Create mission in database
    const mission: Mission = {
      id: `mission_${Date.now()}`,
      dealerId,
      agentId,
      status: 'queued',
      confidence: 0.75,
      startedAt: new Date(),
      category: category || 'strategic',
      evidence: [],
    }

    return NextResponse.json({
      success: true,
      mission,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

