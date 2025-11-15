/**
 * Web Vitals Analytics API
 * POST /api/analytics/web-vitals
 * Receives and stores Core Web Vitals metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'edge';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

export async function POST(req: NextRequest) {
  try {
    const metric: WebVitalMetric = await req.json();

    // Validate metric
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Get user agent for context
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const country = (req as any).geo?.country || 'unknown';
    const city = (req as any).geo?.city || 'unknown';

    const supabase = getSupabase() as any;
    if (supabase) {
      // Store in Supabase
      await supabase.from('web_vitals').insert({
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_id: metric.id,
        navigation_type: metric.navigationType,
        user_agent: userAgent,
        country,
        city,
        created_at: new Date(metric.timestamp).toISOString(),
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals API]', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        location: `${city}, ${country}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Web Vitals API] Error:', error);
    // Don't fail the response - web vitals shouldn't break the app
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
