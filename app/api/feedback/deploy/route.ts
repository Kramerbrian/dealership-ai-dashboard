import { NextRequest, NextResponse } from 'next/server';
import { feedbackLoop } from '@/lib/feedback/loop';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback/deploy
 * 
 * Deploy update to production if metrics pass threshold
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
    const { updateId } = body;

    if (!updateId) {
      return NextResponse.json(
        { error: 'updateId is required' },
        { status: 400 }
      );
    }

    const deployed = await feedbackLoop.deployIfPassed(updateId);

    if (!deployed) {
      return NextResponse.json({
        success: false,
        message: 'Update did not pass evaluation threshold',
        updateId
      });
    }

    return NextResponse.json({
      success: true,
      deployed: true,
      updateId,
      message: 'Update deployed to production'
    });
  } catch (error: any) {
    console.error('Feedback deploy error:', error);
    return NextResponse.json(
      { error: 'Failed to deploy update' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback/status
 * 
 * Get feedback loop status
 */
export async function GET(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = feedbackLoop.getStatus();

    return NextResponse.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('Feedback status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

