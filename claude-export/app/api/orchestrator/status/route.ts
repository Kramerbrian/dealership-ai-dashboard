/**
 * Orchestrator Status API
 * Returns current AI CSO state for a dealer
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json({ error: 'dealerId required' }, { status: 400 });
    }

    // Get or create orchestrator state
    let state = await prisma.orchestratorState.findUnique({
      where: { dealerId },
    });

    if (!state) {
      // Create default state
      state = await prisma.orchestratorState.create({
        data: {
          dealerId,
          confidence: 0.92,
          autonomyEnabled: true,
          currentMode: 'AI_CSO',
          activeAgents: [],
        },
      });
    }

    return NextResponse.json({
      confidence: state.confidence,
      autonomyEnabled: state.autonomyEnabled,
      activeAgents: state.activeAgents,
      lastOrchestration: state.lastOrchestration?.toISOString() || null,
      orchestrationCount: state.orchestrationCount,
      currentMode: state.currentMode,
      lastScan: state.lastScan?.toISOString() || null,
    });
  } catch (error: any) {
    console.error('Orchestrator status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

