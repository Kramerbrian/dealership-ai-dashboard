import { NextRequest, NextResponse } from 'next/server';
import { feedbackLoop } from '@/lib/feedback/loop';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback/cycle
 * 
 * Run complete feedback loop cycle:
 * Store Query → Annotate → Update → Retrain → Evaluate → Deploy
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
    const {
      query,
      response,
      success,
      error,
      userSatisfaction,
      latencyMs,
      model,
      tokensUsed,
      annotation
    } = body;

    if (!query || !response) {
      return NextResponse.json(
        { error: 'query and response are required' },
        { status: 400 }
      );
    }

    const queryId = `query-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const userQuery = {
      id: queryId,
      query,
      timestamp: new Date(),
      tenantId: isolation.tenantId,
      userId: body.userId,
      sessionId: body.sessionId,
      metadata: body.metadata
    };

    const outcome = {
      queryId,
      response,
      success: success !== false,
      error,
      userSatisfaction,
      timestamp: new Date(),
      latencyMs: latencyMs || 0,
      model,
      tokensUsed
    };

    const annot = annotation ? {
      queryId,
      annotatorId: annotation.annotatorId || isolation.tenantId,
      errorType: annotation.errorType,
      severity: annotation.severity,
      notes: annotation.notes,
      correctedResponse: annotation.correctedResponse,
      timestamp: new Date()
    } : undefined;

    const result = await feedbackLoop.runCycle(userQuery, outcome, annot);

    return NextResponse.json({
      success: true,
      queryId,
      cycle: {
        deployed: result.deployed,
        updateId: result.updateId
      }
    });
  } catch (error: any) {
    console.error('Feedback cycle error:', error);
    return NextResponse.json(
      { error: 'Failed to run feedback cycle' },
      { status: 500 }
    );
  }
}

