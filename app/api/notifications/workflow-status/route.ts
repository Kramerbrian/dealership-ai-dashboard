import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { triggerNotification } from '@/lib/smart-notifications';

export const dynamic = 'force-dynamic';

/**
 * Check workflow status and send notifications
 * Called by automation systems when workflows complete
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workflowId, status, domain, dealerId, opportunityId, results } = body;

    if (!workflowId || !status) {
      return NextResponse.json(
        { error: 'workflowId and status are required' },
        { status: 400 }
      );
    }

    // Get dealer info
    let dealer;
    if (dealerId) {
      dealer = await db.dealer.findUnique({ where: { id: dealerId } });
    } else if (domain) {
      dealer = await db.dealer.findUnique({ where: { domain } });
    }

    const dealershipName = dealer?.name || domain || 'Your Dealership';

    // Update opportunity status
    if (opportunityId) {
      await db.opportunity.update({
        where: { id: opportunityId },
        data: {
          status: status === 'completed' ? 'COMPLETED' : status === 'failed' ? 'CANCELLED' : 'IN_PROGRESS',
          completedAt: status === 'completed' ? new Date() : undefined,
        },
      });
    }

    // Send notification based on status
    if (status === 'completed') {
      await triggerNotification('fix_completed', {
        type: 'fix_completed',
        tenant_id: dealerId || domain || '',
        dealership_name: dealershipName,
        data: {
          fixes_executed: results?.fixes || [{
            playbook: results?.type || 'unknown',
            status: 'success',
            impact: results?.impact || 15,
          }],
          revenue_impact: results?.revenueImpact || 0,
        },
        timestamp: new Date().toISOString(),
      });
    } else if (status === 'failed') {
      await triggerNotification('anomaly_alert', {
        type: 'anomaly_alert',
        tenant_id: dealerId || domain || '',
        dealership_name: dealershipName,
        data: {
          anomalies: [{
            type: 'workflow_failure',
            severity: 'high',
            description: `Workflow ${workflowId} failed: ${results?.error || 'Unknown error'}`,
          }],
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      notificationSent: true,
    });
  } catch (error: any) {
    console.error('Workflow status notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get notification preferences for a user/dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;

    // In production, fetch from user preferences table
    // For now, return defaults
    return NextResponse.json({
      email: true,
      push: true,
      slack: false,
      frequency: 'immediate', // 'immediate' | 'digest' | 'daily'
    });
  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

