import { NextRequest, NextResponse } from 'next/server';
import { lifecycleMetrics } from '@/lib/lifecycle/metrics';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || isolation.tenantId;
    
    const summary = lifecycleMetrics.getMetricsSummary(userId, isolation.tenantId);
    
    return NextResponse.json({
      success: true,
      metrics: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Lifecycle metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

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
    const { event, value, metadata } = body;
    const userId = body.userId || isolation.tenantId;
    
    switch (event) {
      case 'domain_to_first_fix':
        await lifecycleMetrics.trackDomainToFirstFix(userId, isolation.tenantId, value);
        break;
      case 'integration_added':
        await lifecycleMetrics.trackIntegration(userId, isolation.tenantId, metadata?.integration || 'unknown');
        break;
      case 'pulse_unlocked':
        await lifecycleMetrics.trackPulseUnlock(userId, isolation.tenantId);
        break;
      case 'time_to_first_value':
        await lifecycleMetrics.trackTimeToFirstValue(userId, isolation.tenantId, value);
        break;
      case 'day7_check':
        const signupDate = metadata?.signupDate ? new Date(metadata.signupDate) : new Date();
        await lifecycleMetrics.checkDay7Retention(userId, isolation.tenantId, signupDate);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lifecycle tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
