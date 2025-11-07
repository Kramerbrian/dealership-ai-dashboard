import { NextRequest, NextResponse } from 'next/server';
import { feedbackLoop } from '@/lib/feedback/loop';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback/annotate
 * 
 * Annotate errors and interactions for training
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
    const { queryId, errorType, severity, notes, correctedResponse } = body;

    if (!queryId || !severity || !notes) {
      return NextResponse.json(
        { error: 'queryId, severity, and notes are required' },
        { status: 400 }
      );
    }

    const annotation = {
      queryId,
      annotatorId: body.annotatorId || isolation.tenantId,
      errorType: errorType as 'hallucination' | 'incomplete' | 'irrelevant' | 'format' | 'other' | undefined,
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      notes,
      correctedResponse,
      timestamp: new Date()
    };

    await feedbackLoop.annotateError(queryId, annotation);

    // Check if we should trigger update cycle
    const status = feedbackLoop.getStatus();
    if (status.annotations >= 10) {
      // Trigger update generation (async)
      feedbackLoop.generateUpdate('prompt', [queryId])
        .then(update => {
          console.log('Generated update:', update.id);
          // Continue with retrain → evaluate → deploy cycle
        })
        .catch(err => console.error('Update generation failed:', err));
    }

    return NextResponse.json({
      success: true,
      annotationId: `annotation-${Date.now()}`,
      message: 'Annotation stored'
    });
  } catch (error: any) {
    console.error('Feedback annotate error:', error);
    return NextResponse.json(
      { error: 'Failed to store annotation' },
      { status: 500 }
    );
  }
}

