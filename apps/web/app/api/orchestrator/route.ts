/**
 * Orchestrator API Route
 * Main endpoint for Orchestrator 3.0 integration
 * Powers command center modals, HAL chat, and agentic calculations
 */

import { NextRequest, NextResponse } from 'next/server';
import { callOrchestrator, type OrchestratorRequest } from '@/lib/orchestrator/gpt-bridge';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, dealerId, domain, context, parameters } = body;

    if (!action || !dealerId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, dealerId' },
        { status: 400 }
      );
    }

    const validActions = [
      'analyze_visibility',
      'compute_qai',
      'calculate_oci',
      'generate_asr',
      'analyze_ugc'
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Call orchestrator
    const result = await callOrchestrator({
      action,
      dealerId,
      domain,
      context,
      parameters
    } as OrchestratorRequest);

    // Add orchestrator identity header
    const response = NextResponse.json(result);
    response.headers.set('X-Orchestrator-Role', 'AI_CSO');
    if (result.traceId) {
      response.headers.set('X-Trace-Id', result.traceId);
    }

    return response;
  } catch (error) {
    console.error('Orchestrator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Status endpoint
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing dealerId parameter' },
        { status: 400 }
      );
    }

    // Return orchestrator status
    return NextResponse.json({
      status: 'active',
      dealerId,
      confidence: 0.92,
      lastSync: new Date().toISOString(),
      agentsRunning: 4,
      platformMode: process.env.PLATFORM_MODE || 'CognitiveOps',
      orchestratorRole: process.env.ORCHESTRATOR_ROLE || 'AI_CSO'
    });
  } catch (error) {
    console.error('Orchestrator status error:', error);
    return NextResponse.json(
      { error: 'Failed to get orchestrator status' },
      { status: 500 }
    );
  }
}

