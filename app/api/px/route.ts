import { NextResponse } from 'next/server';

/**
 * Privacy-safe variant telemetry endpoint
 * - No PII collection
 * - No IP storage
 * - No UA persistence
 * - Anonymous behavioral signals only
 */
export async function POST(req: Request) {
  try {
    const { route, ev, variant } = await req.json().catch(() => ({}));
    
    // In production, send to analytics pipeline
    // Example: await fetch(process.env.ANALYTICS_URL!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     timestamp: Date.now(),
    //     route,
    //     event: ev,
    //     variant,
    //     // No PII, no IP, no UA
    //   })
    // });

    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', { route, event: ev, variant });
    }
  } catch (error) {
    // Silently fail - telemetry should never break UX
  }

  return new NextResponse(null, { status: 204 });
}
