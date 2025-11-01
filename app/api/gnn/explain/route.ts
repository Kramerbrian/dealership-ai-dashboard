import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getPredictionExplanation } from '@/lib/delegates/gnnDelegate';

export async function GET(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const predictionId = searchParams.get('prediction_id');
    const dealerId = searchParams.get('dealer_id');

    if (!predictionId) {
      return NextResponse.json(
        { error: 'prediction_id is required' },
        { status: 400 }
      );
    }

    const explanation = await getPredictionExplanation(
      predictionId,
      dealerId || 'all'
    );

    if (!explanation) {
      return NextResponse.json(
        { error: 'Explanation not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      explanation,
    });
  } catch (error: any) {
    console.error('GNN explanation API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'GNN explanation failed',
        ok: false,
      },
      { status: 500 }
    );
  }
}

