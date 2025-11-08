import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkGuardrails, executeAutoFix } from '@dealershipai/agents'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fixType, target, parameters, preview = true } = body

    // Check execution guardrails
    const guardrailCheck = await checkGuardrails({
      fixType,
      impact: parameters.estimatedImpact || 0,
      confidence: parameters.confidence || 0,
      userId,
    })

    if (!guardrailCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: guardrailCheck.reason,
          requiresApproval: guardrailCheck.requiresApproval,
        },
        { status: 403 }
      )
    }

    if (preview) {
      // Return preview without executing
      return NextResponse.json({
        success: true,
        preview: true,
        fix: await generatePreview({ fixType, target, parameters }),
        guardrailCheck,
      })
    }

    // Execute the fix
    const result = await executeAutoFix({
      fixType,
      target,
      parameters,
      userId,
    })

    return NextResponse.json({
      success: true,
      result,
      executedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Auto-fix error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function generatePreview(params: any) {
  // TODO: Generate preview of fix without executing
  return { ...params, preview: true }
}

