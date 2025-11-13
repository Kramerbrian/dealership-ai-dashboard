/**
 * POST /api/v1/orchestrator/start
 *
 * Start Orchestrator 3.0 for autonomous project completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDealershipAIOrchestrator } from '@/lib/agent/orchestrator3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] Starting Orchestrator 3.0...');

    // Create orchestrator instance
    const orchestrator = createDealershipAIOrchestrator();

    // Initialize (generates task plan)
    await orchestrator.initialize();

    // Get initial state
    const state = orchestrator.getState();

    // Start autonomous execution in background
    // Note: In production, this should be a queue/worker pattern
    orchestrator.start().catch(error => {
      console.error('[Orchestrator 3.0] Execution error:', error);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Orchestrator 3.0 started successfully',
        state: {
          goal: state.goal.objective,
          totalTasks: state.totalTasks,
          currentPhase: state.currentPhase,
          isAutonomous: state.isAutonomous,
          confidence: state.confidence,
        },
        tasks: state.tasks.map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          estimatedMinutes: t.estimatedMinutes,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Orchestrator start failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start orchestrator',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      name: 'Orchestrator 3.0',
      version: '3.0.0',
      status: 'ready',
      description: 'Autonomous OpenAI agent for project completion',
      endpoints: {
        start: 'POST /api/v1/orchestrator/start',
        status: 'GET /api/v1/orchestrator/status',
      },
    },
    { status: 200 }
  );
}
