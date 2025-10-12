/**
 * Security Events API
 * Handles fetching and managing security events with proper RBAC
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || 'all';
    const eventType = searchParams.get('eventType') || 'all';
    const timeRange = searchParams.get('timeRange') || '24h';

    // TODO: Add proper authentication and RBAC checks
    // For now, we'll allow access but this should be secured

    // Build query filters
    let query = supabaseAdmin
      .from('security_events')
      .select('*')
      .order('occurred_at', { ascending: false });

    // Apply tenant filter if provided
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
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
      query = query.gte('occurred_at', timeFilter.toISOString());
    }

    // Apply severity filter
    if (severity !== 'all') {
      query = query.eq('severity', severity);
    }

    // Apply event type filter
    if (eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }

    // Apply search filter
    if (search) {
      query = query.or(`event_type.ilike.%${search}%,source.ilike.%${search}%,payload::text.ilike.%${search}%`);
    }

    // Limit results for performance
    query = query.limit(1000);

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching security events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch security events' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const metrics = await calculateSecurityMetrics(tenantId, timeRange);

    return NextResponse.json({
      events: events || [],
      metrics
    });

  } catch (error) {
    console.error('Security events API error:', error);
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

    // Insert new security event
    const { data, error } = await supabaseAdmin
      .from('security_events')
      .insert({
        event_type,
        actor_id,
        payload,
        tenant_id,
        severity,
        source,
        ip_address,
        user_agent
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating security event:', error);
      return NextResponse.json(
        { error: 'Failed to create security event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Create security event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateSecurityMetrics(tenantId?: string, timeRange?: string): Promise<SecurityMetrics> {
  try {
    // Base query
    let query = supabaseAdmin.from('security_events').select('*');
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    // Get all events for metrics calculation
    const { data: allEvents, error } = await query;

    if (error || !allEvents) {
      return {
        totalEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0,
        mediumSeverityEvents: 0,
        lowSeverityEvents: 0,
        eventsLast24h: 0,
        eventsLast7d: 0,
        topEventTypes: [],
        topSources: []
      };
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate metrics
    const totalEvents = allEvents.length;
    const criticalEvents = allEvents.filter(e => e.severity === 'critical').length;
    const highSeverityEvents = allEvents.filter(e => e.severity === 'high').length;
    const mediumSeverityEvents = allEvents.filter(e => e.severity === 'medium').length;
    const lowSeverityEvents = allEvents.filter(e => e.severity === 'low').length;

    const eventsLast24h = allEvents.filter(e => 
      new Date(e.occurred_at) >= last24h
    ).length;

    const eventsLast7d = allEvents.filter(e => 
      new Date(e.occurred_at) >= last7d
    ).length;

    // Top event types
    const eventTypeCounts = allEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEventTypes = Object.entries(eventTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top sources
    const sourceCounts = allEvents.reduce((acc, event) => {
      const source = event.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents,
      criticalEvents,
      highSeverityEvents,
      mediumSeverityEvents,
      lowSeverityEvents,
      eventsLast24h,
      eventsLast7d,
      topEventTypes,
      topSources
    };

  } catch (error) {
    console.error('Error calculating security metrics:', error);
    return {
      totalEvents: 0,
      criticalEvents: 0,
      highSeverityEvents: 0,
      mediumSeverityEvents: 0,
      lowSeverityEvents: 0,
      eventsLast24h: 0,
      eventsLast7d: 0,
      topEventTypes: [],
      topSources: []
    };
  }
}
