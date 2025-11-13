import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { redact } from '@/lib/security/redact';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, dealer, email, metadata, timestamp } = body;

    // Redact PII
    const sanitized = {
      event,
      dealer: dealer ? redact(String(dealer)) : undefined,
      email: email ? redact(String(email)) : undefined,
      metadata: metadata ? JSON.parse(redact(JSON.stringify(metadata))) : undefined,
      timestamp: timestamp || new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    };

    // Store in Redis
    if (redis) {
    await redis.lpush('telemetry:events', JSON.stringify(sanitized));
    await redis.ltrim('telemetry:events', 0, 9999); // Keep last 10k events
    }

    // Log to structured logger
    await logger.info('Telemetry event', sanitized);

    // TODO: Send to analytics warehouse (Supabase, BigQuery, etc.)

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    await logger.error('Telemetry error', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to record telemetry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!redis) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }
    const events = await redis.lrange('telemetry:events', 0, limit - 1);

    const parsed = events
      .map((e: string) => {
        try {
          return JSON.parse(e);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter((e: any) => !event || e.event === event);

    return NextResponse.json({
      events: parsed,
      count: parsed.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch telemetry' },
      { status: 500 }
    );
  }
}
