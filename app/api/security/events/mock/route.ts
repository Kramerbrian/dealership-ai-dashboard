/**
 * Mock Security Events API for Testing
 * This version works without database connectivity
 */

import { NextRequest, NextResponse } from 'next/server';

interface SecurityEvent {
  id: number;
  event_type: string;
  actor_id: string;
  payload: any;
  occurred_at: string;
  tenant_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  eventsLast24h: number;
  eventsLast7d: number;
  topEventTypes: Array<{ type: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

// Mock data for testing
const mockEvents: SecurityEvent[] = [
  {
    id: 1,
    event_type: 'auth.login',
    actor_id: 'user-123',
    payload: { method: 'email', success: true },
    occurred_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    tenant_id: 'demo-tenant',
    severity: 'medium',
    source: 'authentication',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    event_type: 'api.call',
    actor_id: 'user-456',
    payload: { endpoint: '/api/analyze', method: 'POST', statusCode: 200 },
    occurred_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    tenant_id: 'demo-tenant',
    severity: 'low',
    source: 'api',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    event_type: 'security.alert.suspicious_activity',
    actor_id: 'system',
    payload: { 
      alert_type: 'multiple_failed_logins',
      count: 5,
      time_window: '10 minutes'
    },
    occurred_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    tenant_id: 'demo-tenant',
    severity: 'critical',
    source: 'security_monitor',
    ip_address: '192.168.1.102',
    user_agent: 'SecurityBot/1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    event_type: 'data.export',
    actor_id: 'user-789',
    payload: { 
      resource: 'dealership_data',
      record_count: 150,
      format: 'csv'
    },
    occurred_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    tenant_id: 'demo-tenant',
    severity: 'high',
    source: 'data_access',
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    event_type: 'tier.limit_reached',
    actor_id: 'user-999',
    payload: { 
      plan: 'FREE',
      limit: 50,
      used: 50,
      endpoint: '/api/analyze'
    },
    occurred_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    tenant_id: 'demo-tenant',
    severity: 'medium',
    source: 'tier_manager',
    ip_address: '192.168.1.104',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || 'all';
    const eventType = searchParams.get('eventType') || 'all';
    const timeRange = searchParams.get('timeRange') || '24h';

    // Filter events based on parameters
    let filteredEvents = [...mockEvents];

    // Apply tenant filter
    if (tenantId) {
      filteredEvents = filteredEvents.filter(event => event.tenant_id === tenantId);
    }

    // Apply search filter
    if (search) {
      filteredEvents = filteredEvents.filter(event => 
        event.event_type.toLowerCase().includes(search.toLowerCase()) ||
        event.source?.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(event.payload).toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply severity filter
    if (severity !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    // Apply event type filter
    if (eventType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.event_type === eventType);
    }

    // Apply time range filter
    const now = new Date();
    let timeFilter: Date;
    
    switch (timeRange) {
      case '1h':
        timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(0); // All time
    }

    if (timeRange !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.occurred_at) >= timeFilter
      );
    }

    // Calculate metrics
    const metrics: SecurityMetrics = {
      totalEvents: mockEvents.length,
      criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
      highSeverityEvents: mockEvents.filter(e => e.severity === 'high').length,
      mediumSeverityEvents: mockEvents.filter(e => e.severity === 'medium').length,
      lowSeverityEvents: mockEvents.filter(e => e.severity === 'low').length,
      eventsLast24h: mockEvents.filter(e => 
        new Date(e.occurred_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
      ).length,
      eventsLast7d: mockEvents.filter(e => 
        new Date(e.occurred_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      topEventTypes: [
        { type: 'auth.login', count: 1 },
        { type: 'api.call', count: 1 },
        { type: 'security.alert.suspicious_activity', count: 1 },
        { type: 'data.export', count: 1 },
        { type: 'tier.limit_reached', count: 1 }
      ],
      topSources: [
        { source: 'authentication', count: 1 },
        { source: 'api', count: 1 },
        { source: 'security_monitor', count: 1 },
        { source: 'data_access', count: 1 },
        { source: 'tier_manager', count: 1 }
      ]
    };

    return NextResponse.json({
      events: filteredEvents,
      metrics,
      mock: true // Indicate this is mock data
    });

  } catch (error) {
    console.error('Mock security events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      event_type, 
      actor_id, 
      payload, 
      tenant_id, 
      severity = 'info',
      source,
      ip_address,
      user_agent 
    } = body;

    // Validate required fields
    if (!event_type || !actor_id || !payload) {
      return NextResponse.json(
        { error: 'event_type, actor_id, and payload are required' },
        { status: 400 }
      );
    }

    // Create new mock event
    const newEvent: SecurityEvent = {
      id: mockEvents.length + 1,
      event_type,
      actor_id,
      payload,
      occurred_at: new Date().toISOString(),
      tenant_id,
      severity: severity as any,
      source,
      ip_address,
      user_agent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to mock data
    mockEvents.unshift(newEvent);

    return NextResponse.json({
      success: true,
      event: newEvent,
      mock: true
    });

  } catch (error) {
    console.error('Create mock security event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
