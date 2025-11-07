import { NextRequest, NextResponse } from 'next/server';
import { feedbackLoop } from '@/lib/feedback/loop';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback/update
 * 
 * Generate training update from annotations
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
    const { type, queryIds } = body;

    if (!type || !queryIds || !Array.isArray(queryIds)) {
      return NextResponse.json(
        { error: 'type and queryIds array are required' },
        { status: 400 }
      );
    }

    const update = await feedbackLoop.generateUpdate(
      type as 'prompt' | 'kb' | 'rag' | 'fine-tune',
      queryIds
    );

    return NextResponse.json({
      success: true,
      update: {
        id: update.id,
        type: update.type,
        version: update.version,
        createdAt: update.createdAt
      }
    });
  } catch (error: any) {
    console.error('Feedback update error:', error);
    return NextResponse.json(
      { error: 'Failed to generate update' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback/update/:updateId/retrain
 * 
 * Retrain model with update
 */
export async function PUT(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const updateId = url.pathname.split('/').pop();

    if (!updateId) {
      return NextResponse.json(
        { error: 'updateId is required' },
        { status: 400 }
      );
    }

    // Find update
    const status = feedbackLoop.getStatus();
    // TODO: Load update from database
    // For now, create a mock update
    const update = {
      id: updateId,
      type: 'prompt' as const,
      changes: {},
      version: 'v1',
      createdAt: new Date()
    };

    const { modelId, version } = await feedbackLoop.retrain(update);

    return NextResponse.json({
      success: true,
      modelId,
      version
    });
  } catch (error: any) {
    console.error('Feedback retrain error:', error);
    return NextResponse.json(
      { error: 'Failed to retrain model' },
      { status: 500 }
    );
  }
}

