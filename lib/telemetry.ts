/**
 * Telemetry tracking for DealershipAI
 * Sends events to Slack webhook or other endpoints
 */

export async function track(event: string, props: Record<string, any> = {}) {
  try {
    const url = process.env.TELEMETRY_WEBHOOK;
    if (!url) {
      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('[Telemetry]', event, props);
      }
      return;
    }
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        props,
        ts: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silently fail - telemetry should never break the app
    console.error('[Telemetry] Failed to send event:', error);
  }
}
