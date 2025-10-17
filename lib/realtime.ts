// Realtime feed implementation using Supabase Realtime
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface RealtimeEvent {
  id: string;
  type: 'metric_update' | 'alert' | 'scan_complete' | 'fix_executed';
  data: any;
  timestamp: string;
  tenant_id: string;
}

export class RealtimeFeed {
  private subscriptions: Map<string, any> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeRealtime();
  }

  private async initializeRealtime() {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scores' 
        }, 
        (payload) => {
          this.handleScoreUpdate(payload);
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audits'
        },
        (payload) => {
          this.handleAuditUpdate(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('dashboard_updates', channel);
  }

  private handleScoreUpdate(payload: any) {
    const event: RealtimeEvent = {
      id: `score_${payload.new.id}`,
      type: 'metric_update',
      data: payload.new,
      timestamp: new Date().toISOString(),
      tenant_id: payload.new.dealership_id
    };
    this.emit('metric_update', event);
  }

  private handleAuditUpdate(payload: any) {
    const event: RealtimeEvent = {
      id: `audit_${payload.new.id}`,
      type: 'scan_complete',
      data: payload.new,
      timestamp: new Date().toISOString(),
      tenant_id: payload.new.dealership_id
    };
    this.emit('scan_complete', event);
  }

  public subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private emit(eventType: string, data: RealtimeEvent) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  public async sendAlert(tenantId: string, alert: {
    type: 'anomaly' | 'threshold_breach' | 'fix_completed';
    message: string;
    severity: 'low' | 'medium' | 'high';
    data?: any;
  }) {
    const event: RealtimeEvent = {
      id: `alert_${Date.now()}`,
      type: 'alert',
      data: alert,
      timestamp: new Date().toISOString(),
      tenant_id: tenantId
    };

    // Store in database
    await supabase
      .from('realtime_events')
      .insert([{
        tenant_id: tenantId,
        event_type: 'alert',
        event_data: alert,
        created_at: new Date().toISOString()
      }]);

    this.emit('alert', event);
  }

  public async sendFixUpdate(tenantId: string, fix: {
    playbook: string;
    status: 'started' | 'completed' | 'failed';
    actions: any[];
    results?: any;
  }) {
    const event: RealtimeEvent = {
      id: `fix_${Date.now()}`,
      type: 'fix_executed',
      data: fix,
      timestamp: new Date().toISOString(),
      tenant_id: tenantId
    };

    this.emit('fix_executed', event);
  }

  public destroy() {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
    this.listeners.clear();
  }
}

// Singleton instance
export const realtimeFeed = new RealtimeFeed();

// React hook for realtime updates
export function useRealtime(eventType: string, callback: Function) {
  const { useEffect } = require('react');
  
  useEffect(() => {
    const unsubscribe = realtimeFeed.subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
}
