/**
 * Orchestrator Deployment Monitoring API
 * POST /api/orchestrator/deploy/monitor
 * Uses AI to analyze and monitor deployment status
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorDeployment } from '@/lib/ai/orchestrator';
import type { AITask } from '@/lib/ai/orchestrator';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const taskType = (body.type || 'verify-deployment') as AITask['type'];
    const input = body.input || 'Verify landing page deployment and provide analysis';

    const task: AITask = {
      type: taskType,
      input,
      priority: 'quality',
    };

    const result = await monitorDeployment(task);

    return NextResponse.json({
      success: true,
      analysis: result.output,
      model: result.model,
      deploymentStatus: result.metadata?.deploymentStatus,
      verificationTime: result.metadata?.verificationTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Deployment monitoring error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

