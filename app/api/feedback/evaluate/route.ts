import { NextRequest, NextResponse } from 'next/server';
import { feedbackLoop } from '@/lib/feedback/loop';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback/evaluate
 * 
 * Evaluate update on golden query set
 */
export async function POST(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { updateId, goldenSetId } = body;

    if (!updateId) {
      return NextResponse.json(
        { error: 'updateId is required' },
        { status: 400 }
      );
    }

    const result = await feedbackLoop.evaluate(updateId, goldenSetId);

    return NextResponse.json({
      success: true,
      evaluation: {
        updateId: result.updateId,
        metrics: result.metrics,
        threshold: result.threshold,
        passed: result.passed,
        evaluatedAt: result.evaluatedAt
      }
    });
  } catch (error: any) {
    console.error('Feedback evaluate error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate update' },
      { status: 500 }
    );
  }
}

