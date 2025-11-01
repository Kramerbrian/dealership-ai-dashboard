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

    const verifiedStatus = verified ?? true;
    await verifyPrediction(dealerId, intent, fix, verifiedStatus, confidence ?? 0.85);

    // Record metrics if verified
    if (verifiedStatus) {
      const { arrGainUsd = 0 } = body; // Get arrGainUsd from already-parsed body
      
      await recordGNNVerification({
        dealerId,
        intent,
        fix,
        confidence: confidence ?? 0.85,
        arrGainUsd,
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

