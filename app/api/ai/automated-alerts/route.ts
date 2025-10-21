import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { alertType, threshold, dealerId, notificationChannels } = await req.json();

    // Automated alert system for various intelligence metrics
    const alertConfig = {
      id: `alert_${Date.now()}`,
      type: alertType,
      threshold: threshold,
      dealerId: dealerId || 'demo_dealer',
      channels: notificationChannels || ['email', 'slack', 'dashboard'],
      status: 'active',
      createdAt: new Date().toISOString(),
      triggers: [
        {
          condition: 'inventory_freshness < 70',
          action: 'send_email_alert',
          message: 'Inventory freshness below threshold'
        },
        {
          condition: 'pricing_optimization < 60',
          action: 'send_slack_alert',
          message: 'Pricing optimization needs attention'
        },
        {
          condition: 'compliance_score < 80',
          action: 'send_dashboard_alert',
          message: 'Compliance score requires immediate attention'
        }
      ],
      schedule: {
        frequency: 'realtime',
        timezone: 'UTC',
        enabled: true
      }
    };

    // Simulate alert processing
    const alertResults = {
      configId: alertConfig.id,
      status: 'configured',
      nextCheck: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      channelsConfigured: alertConfig.channels.length,
      triggersActive: alertConfig.triggers.length,
      estimatedAlertsPerDay: Math.floor(Math.random() * 20) + 5 // 5-25 alerts per day
    };

    // Log alert configuration to database
    await prisma.intelTask.create({
      data: {
        type: 'AUTOMATED_ALERTS',
        status: 'COMPLETED',
        payload: { alertType, threshold, dealerId, notificationChannels },
        result: { alertConfig, alertResults },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: { alertConfig, alertResults } 
    });
  } catch (error) {
    console.error('Error configuring automated alerts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to configure automated alerts' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealer_id');

    // Get current alert status and recent alerts
    const alertStatus = {
      dealerId: dealerId || 'demo_dealer',
      activeAlerts: [
        {
          id: 'alert_001',
          type: 'inventory_freshness',
          severity: 'medium',
          message: '15 vehicles have stale pricing data',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          status: 'active'
        },
        {
          id: 'alert_002',
          type: 'compliance',
          severity: 'high',
          message: 'Google Ads policy violation detected',
          timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          status: 'active'
        }
      ],
      recentAlerts: [
        {
          id: 'alert_003',
          type: 'pricing_optimization',
          severity: 'low',
          message: 'Pricing optimization opportunity detected',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          status: 'resolved'
        }
      ],
      summary: {
        totalAlerts: 3,
        activeAlerts: 2,
        resolvedAlerts: 1,
        averageResolutionTime: '2.5 hours',
        alertTrend: 'decreasing'
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: alertStatus 
    });
  } catch (error) {
    console.error('Error fetching alert status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch alert status' 
    }, { status: 500 });
  }
}
