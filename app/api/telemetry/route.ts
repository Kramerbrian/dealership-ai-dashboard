import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Telemetry API Endpoint
 * Tracks user events, funnel metrics, and analytics
 * 
 * POST /api/telemetry
 * Body: { type: string, payload?: any, ts?: number }
 */

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Telemetry] Supabase not configured, events will be logged only');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Parse event type to category
function getEventCategory(eventType: string): string {
  const type = eventType.toLowerCase();
  
  if (type.includes('page_view') || type.includes('landing') || type.includes('onboarding')) {
    return 'funnel';
  }
  if (type.includes('click') || type.includes('interaction') || type.includes('share')) {
    return 'engagement';
  }
  if (type.includes('error') || type.includes('fail')) {
    return 'error';
  }
  if (type.includes('signup') || type.includes('purchase') || type.includes('convert')) {
    return 'conversion';
  }
  
  return 'engagement'; // default
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (100 events per minute per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const rl = rateLimit(`telemetry:${ip}`, 100, 60_000);
    
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded', retryIn: rl.retryIn },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { type, payload = {}, ts = Date.now() } = body;

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid event type' },
        { status: 400 }
      );
    }

    // Extract metadata from request
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    
    // Extract user/dealer info from payload or headers
    const userId = payload.userId || payload.user_id || null;
    const sessionId = payload.sessionId || payload.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dealerId = payload.dealerId || payload.dealer_id || payload.dealer || null;
    const domain = payload.domain || payload.url || null;

    // Build telemetry event
    const event = {
      event_type: type,
      event_category: getEventCategory(type),
      user_id: userId,
      session_id: sessionId,
      dealer_id: dealerId,
      domain: domain ? domain.replace(/https?:\/\//, '').split('/')[0] : null,
      payload: payload,
      metadata: {
        user_agent: userAgent,
        referrer: referrer,
        timestamp: ts,
        ...(payload.metadata || {})
      },
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
    };

    // Write to Supabase
    const supabase = getSupabaseClient();
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('telemetry_events')
          .insert([event]);

        if (error) {
          console.error('[Telemetry] Supabase insert error:', error);
          // Continue - don't fail the request
        }
      } catch (error) {
        console.error('[Telemetry] Failed to write to Supabase:', error);
        // Continue - don't fail the request
      }
    }

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', type, payload);
    }

    return NextResponse.json({ 
      ok: true, 
      eventId: `evt_${Date.now()}`,
      recorded: !!supabase
    });

  } catch (error) {
    console.error('[Telemetry] Error:', error);
    
    // Don't fail the request - telemetry should be non-blocking
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  const supabase = getSupabaseClient();
  return NextResponse.json({
    ok: true,
    supabase_configured: !!supabase,
    timestamp: new Date().toISOString()
  });
}

