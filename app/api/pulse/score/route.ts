/**
 * GET /api/pulse/score - Current pulse score endpoint
 * Returns the current pulse score and all related signals for a dealer
 */

import { NextRequest, NextResponse } from 'next/server';
import { PulseEngine } from '@/lib/pulse/engine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dealerId = searchParams.get('dealerId') || undefined;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId parameter is required' },
        { status: 400 }
      );
    }

    // Create pulse engine instance
    const engine = new PulseEngine(dealerId);

    // Get current pulse score
    // In production, this would fetch real signals from database
    const pulseScore = await engine.getCurrentScore();

    return NextResponse.json({
      success: true,
      data: pulseScore,
      meta: {
        dealerId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Pulse score endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate pulse score',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
