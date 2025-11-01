import { NextResponse } from 'next/server';
import { rarQueue } from '@/lib/queues/rarQueue';

/**
 * POST /api/pulse/hooks/rar
 * 
 * Optional: Forward OEM/incentive/AI snippet pulse deltas
 * to adjust recoverableShare / ctrDropWhenAI heuristics
 * and trigger RaR recomputation
 */
export async function POST(req: Request) {
  try {
    const { dealerId, month } = await req.json();

    if (!dealerId || !month) {
      return NextResponse.json(
        { error: 'dealerId and month are required' },
        { status: 400 }
      );
    }

    // Enqueue recomputation
    await rarQueue.add(
      'computeMonthly',
      { dealerId, month },
      { jobId: `${dealerId}:${month}` }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Pulse RaR hook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
