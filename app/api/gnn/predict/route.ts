import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { runGNNPrediction, forwardPredictionsToOrchestrator } from '@/lib/delegates/gnnDelegate';

import { recordGNNPrediction } from '@/lib/gnn/metrics';

export async function POST(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dealerId, threshold = 0.85, maxPredictions = 50, autoExecute = false } = body;

    // Get predictions from GNN engine
    const predictions = await runGNNPrediction(dealerId, threshold, maxPredictions);

    // Record metrics for each prediction
    for (const prediction of predictions) {
      await recordGNNPrediction({
        dealerId: dealerId || 'unknown',
        intent: prediction.intent_name,
        fix: prediction.fix_name,
        confidence: prediction.confidence,
      });
    }

    // Optionally forward to orchestrator for automatic execution
    if (autoExecute && dealerId) {
      await forwardPredictionsToOrchestrator(predictions, dealerId);
    }

    return NextResponse.json({
      ok: true,
      predictions,
      total: predictions.length,
      threshold,
    });
  } catch (error: any) {
    console.error('GNN prediction API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'GNN prediction failed',
        ok: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');
    const threshold = parseFloat(searchParams.get('threshold') || '0.85');
    const maxPredictions = parseInt(searchParams.get('maxPredictions') || '50');

    const predictions = await runGNNPrediction(dealerId || undefined, threshold, maxPredictions);

    return NextResponse.json({
      ok: true,
      predictions,
      total: predictions.length,
    });
  } catch (error: any) {
    console.error('GNN prediction API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'GNN prediction failed',
        ok: false,
      },
      { status: 500 }
    );
  }
}

