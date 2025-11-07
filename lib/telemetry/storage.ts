/**
 * Telemetry Storage Service
 * 
 * Stores telemetry events and metrics in Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing for telemetry');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export interface TelemetryEvent {
  event_type: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
  session_id?: string;
  ip_address?: string;
}

export async function storeTelemetry(event: TelemetryEvent): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('telemetry_events').insert({
      event_type: event.event_type,
      tenant_id: event.tenant_id,
      user_id: event.user_id,
      metadata: event.metadata || {},
      timestamp: event.timestamp || new Date(),
      session_id: event.session_id,
      ip_address: event.ip_address,
    });

    if (error) {
      console.error('Telemetry storage error:', error);
      // Don't throw - telemetry failures shouldn't break the app
    }
  } catch (error) {
    console.error('Telemetry storage exception:', error);
    // Silently fail - telemetry is non-critical
  }
}

export async function getTelemetryStats(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('telemetry_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Telemetry query error:', error);
    return [];
  }
}

export async function getTelemetryByEventType(
  tenantId: string,
  eventType: string,
  limit: number = 100
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('telemetry_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', eventType)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Telemetry query error:', error);
    return [];
  }
}

export async function getTelemetrySummary(tenantId: string, days: number = 7) {
  try {
    const supabase = getSupabaseClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('telemetry_events')
      .select('event_type, timestamp')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    // Group by event type
    const summary: Record<string, number> = {};
    data?.forEach(event => {
      summary[event.event_type] = (summary[event.event_type] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error('Telemetry summary error:', error);
    return {};
  }
}

