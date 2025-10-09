/**
 * Automation Alerts API - Profound-inspired
 * Handles alert management and notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { automationEngine, Alert } from '@/lib/automation/AutomationEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type') || 'all';
    
    if (!dealerId) {
      return NextResponse.json({ error: 'Dealer ID required' }, { status: 400 });
    }

    let alerts = automationEngine.getAlerts(dealerId);
    
    // Apply filters
    if (filter !== 'all') {
      switch (filter) {
        case 'unread':
          alerts = alerts.filter(a => !a.read);
          break;
        case 'critical':
          alerts = alerts.filter(a => a.severity === 'critical');
          break;
        case 'action_required':
          alerts = alerts.filter(a => a.actionRequired);
          break;
      }
    }
    
    if (type !== 'all') {
      alerts = alerts.filter(a => a.type === type);
    }
    
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      stats: {
        total: automationEngine.getAlerts(dealerId).length,
        unread: automationEngine.getAlerts(dealerId).filter(a => !a.read).length,
        critical: automationEngine.getAlerts(dealerId).filter(a => a.severity === 'critical').length,
        actionRequired: automationEngine.getAlerts(dealerId).filter(a => a.actionRequired).length
      }
    });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Alert ID and action required' }, { status: 400 });
    }

    let success = false;
    
    switch (action) {
      case 'mark_read':
        success = automationEngine.markAlertRead(id);
        break;
      case 'dismiss':
        success = automationEngine.dismissAlert(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (!success) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Alert ${action.replace('_', ' ')} successfully`
    });
  } catch (error) {
    console.error('Failed to update alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerId, trigger, metrics } = body;
    
    if (!dealerId || !trigger || !metrics) {
      return NextResponse.json({ error: 'Dealer ID, trigger, and metrics required' }, { status: 400 });
    }

    // Check triggers and execute workflows
    await automationEngine.checkTriggers(dealerId, metrics);
    
    return NextResponse.json({
      success: true,
      message: 'Triggers checked and workflows executed'
    });
  } catch (error) {
    console.error('Failed to check triggers:', error);
    return NextResponse.json({ error: 'Failed to check triggers' }, { status: 500 });
  }
}
