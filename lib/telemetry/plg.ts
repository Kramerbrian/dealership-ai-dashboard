/**
 * PLG Telemetry System
 * Tracks user events for funnel analysis
 */

export type TelemetryEvent =
  | 'scan_started'
  | 'scan_completed'
  | 'unlock_attempted'
  | 'unlock_submitted'
  | 'checkout_started'
  | 'checkout_completed'
  | 'dashboard_visit'
  | 'feature_used';

export interface TelemetryPayload {
  event: TelemetryEvent;
  dealer?: string;
  email?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Track PLG event
 */
export async function trackEvent(payload: TelemetryPayload) {
  try {
    // Send to telemetry endpoint
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silent fail - don't block user flow
    console.error('Telemetry failed:', error);
  }
}

/**
 * Client-side tracking helper
 */
if (typeof window !== 'undefined') {
  (window as any).plg = {
    track: trackEvent,
  };
}

