import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { verifyPrediction } from '@/lib/delegates/gnnDelegate';
import { recordGNNVerification } from '@/lib/gnn/metrics';

export async function POST(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dealerId, intent, fix, verified, confidence } = body;

    if (!dealerId || !intent || !fix) {
      return NextResponse.json(
        { error: 'dealerId, intent, and fix are required' },
        { status: 400 }
      );
    }

    await verifyPrediction(dealerId, intent, fix, verified ?? true, confidence ?? 0.85);

    // Record metrics if verified
    if (verified ?? true) {
      const body = await req.json();
      const arrGain = body.arrGainUsd || 0; // Default to 0 if not provided
      
      await recordGNNVerification({
        dealerId,
        intent,
        fix,
        confidence: confidence ?? 0.85,
        arrGainUsd: arrGain,
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Verification recorded',
    });
  } catch (error: any) {
    console.error('GNN verification API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'GNN verification failed',
        ok: false,
      },
      { status: 500 }
    );
  }
}

