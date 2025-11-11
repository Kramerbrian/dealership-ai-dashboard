/**
 * Toggle Autonomy API
 * Enable/disable HAL autonomy with logging
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { dealerId, enabled } = await req.json();

    if (!dealerId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'dealerId and enabled required' }, { status: 400 });
    }

    const state = await prisma.orchestratorState.upsert({
      where: { dealerId },
      update: {
        autonomyEnabled: enabled,
        updatedAt: new Date(),
      },
      create: {
        dealerId,
        autonomyEnabled: enabled,
        confidence: 0.92,
        currentMode: 'AI_CSO',
        activeAgents: [],
      },
    });

    // TODO: Log autonomy change to audit log
    // This should include:
    // - User who made change
    // - Reason (if provided)
    // - Timestamp

    return NextResponse.json({
      success: true,
      autonomyEnabled: state.autonomyEnabled,
      message: enabled
        ? 'Autonomy enabled. HAL will execute improvements autonomously.'
        : 'Autonomy paused. Manual approval required for changes.',
    });
  } catch (error: any) {
    console.error('Autonomy toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle autonomy' }, { status: 500 });
  }
}

