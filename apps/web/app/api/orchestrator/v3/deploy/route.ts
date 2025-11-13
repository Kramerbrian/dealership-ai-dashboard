/**
 * Orchestrator 3.0 Deployment API
 * Deploy autonomous agent to api.dealershipai.com
 */

import { NextResponse } from 'next/server';
import { createDealershipAIOrchestrator, Orchestrator3 } from '@/lib/agent/orchestrator3';

// Store active orchestrator instance
let activeOrchestrator: Orchestrator3 | null = null;

export const runtime = 'nodejs'; // Need nodejs for longer execution time

/**
 * POST /api/orchestrator/v3/deploy
 * Deploy and start Orchestrator 3.0
 */
export async function POST(req: Request) {
  try {
    const { action = 'start', autoStart = true } = await req.json();

    if (action === 'stop' && activeOrchestrator) {
      activeOrchestrator.stop();
      activeOrchestrator = null;
      return NextResponse.json({
        success: true,
        message: 'Orchestrator 3.0 stopped',
        status: 'stopped',
      });
    }

    if (action === 'pause' && activeOrchestrator) {
      activeOrchestrator.pause();
      return NextResponse.json({
        success: true,
        message: 'Orchestrator 3.0 paused',
        status: 'paused',
        state: activeOrchestrator.getState(),
      });
    }

    if (action === 'resume' && activeOrchestrator) {
      activeOrchestrator.resume();
      return NextResponse.json({
        success: true,
        message: 'Orchestrator 3.0 resumed',
        status: 'running',
        state: activeOrchestrator.getState(),
      });
    }

    // Create new orchestrator instance
    if (activeOrchestrator) {
      return NextResponse.json({
        success: false,
        error: 'Orchestrator already running. Stop it first.',
        state: activeOrchestrator.getState(),
      }, { status: 409 });
    }

    activeOrchestrator = createDealershipAIOrchestrator();

    // Initialize and generate task plan
    await activeOrchestrator.initialize();

    const initialState = activeOrchestrator.getState();

    // Start autonomous execution if requested
    if (autoStart) {
      // Run in background (don't await)
      activeOrchestrator.start().catch(error => {
        console.error('Orchestrator execution error:', error);
      });

      return NextResponse.json({
        success: true,
        message: 'Orchestrator 3.0 deployed and started',
        status: 'running',
        state: initialState,
        apiEndpoints: {
          status: '/api/orchestrator/v3/status',
          pause: '/api/orchestrator/v3/deploy (POST with action=pause)',
          resume: '/api/orchestrator/v3/deploy (POST with action=resume)',
          stop: '/api/orchestrator/v3/deploy (POST with action=stop)',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Orchestrator 3.0 deployed (not started)',
      status: 'ready',
      state: initialState,
    });

  } catch (error: any) {
    console.error('Orchestrator deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to deploy orchestrator',
    }, { status: 500 });
  }
}

/**
 * GET /api/orchestrator/v3/deploy
 * Get deployment info
 */
export async function GET() {
  return NextResponse.json({
    service: 'Orchestrator 3.0 Deployment API',
    version: '3.0.0',
    status: activeOrchestrator ? 'deployed' : 'not_deployed',
    capabilities: [
      'Autonomous task execution',
      'Self-healing error recovery',
      'Priority-based task scheduling',
      'Dependency management',
      'Real-time progress tracking',
      'OpenAI-powered planning',
    ],
    endpoints: {
      deploy: 'POST /api/orchestrator/v3/deploy',
      status: 'GET /api/orchestrator/v3/status',
      tasks: 'GET /api/orchestrator/v3/tasks',
    },
  });
}
