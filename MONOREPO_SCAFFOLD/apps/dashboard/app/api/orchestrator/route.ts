import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { callOrchestrator, type OrchestratorRequest } from '@dealershipai/orchestrator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, dealerId, domain, context, parameters } = body

    if (!action || !dealerId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, dealerId' },
        { status: 400 }
      )
    }

    const validActions = [
      'analyze_visibility',
      'compute_qai',
      'calculate_oci',
      'generate_asr',
      'analyze_ugc',
    ]

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await callOrchestrator({
      action,
      dealerId,
      domain,
      context,
      parameters,
    } as OrchestratorRequest)

    const response = NextResponse.json(result)
    response.headers.set('X-Orchestrator-Role', 'AI_CSO')
    if (result.traceId) {
      response.headers.set('X-Trace-Id', result.traceId)
    }

    return response
  } catch (error) {
    console.error('Orchestrator API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

    // Return orchestrator status
    return NextResponse.json({
      status: 'operational',
      version: '3.0',
      availableActions: [
        'analyze_visibility',
        'compute_qai',
        'calculate_oci',
        'generate_asr',
        'analyze_ugc',
      ],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

