import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { redact } from '@/lib/security/redact';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealer, email, scanResults, utm } = body;

    if (!email || !dealer) {
      return NextResponse.json(
        { error: 'Email and dealer are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store in Redis with redacted PII
    const redis = getRedis();
    const key = `plg:email:${Date.now()}`;
    
    const sanitized = {
      dealer: redact(dealer),
      email: redact(email),
      scanResults,
      utm,
      timestamp: new Date().toISOString(),
      source: 'instant_analyzer',
    };

    await redis.setex(key, 90 * 24 * 60 * 60, JSON.stringify(sanitized));

    // Log telemetry
    await logger.info('Email captured', {
      event: 'email_captured',
      dealer: redact(dealer),
      hasScanResults: !!scanResults,
      utm_source: utm?.source,
    });

    // TODO: Send welcome email via email service
    // TODO: Add to CRM/marketing automation

    return NextResponse.json({
      ok: true,
      message: 'Email captured successfully',
    });
  } catch (error: any) {
    await logger.error('Email capture failed', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to capture email' },
      { status: 500 }
    );
  }
}
