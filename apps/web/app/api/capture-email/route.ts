import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { redact } from '@/lib/security/redact';
import { logger } from '@/lib/logger';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';

export const runtime = 'nodejs';

const CaptureEmailSchema = z.object({
  dealer: z.string().min(1, 'Dealer is required'),
  email: z.string().email('Invalid email format'),
  scanResults: z.any().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  }).optional(),
});

export const POST = createPublicRoute(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { dealer, email, scanResults, utm } = CaptureEmailSchema.parse(body);

    // Store in Redis with redacted PII
    const key = `plg:email:${Date.now()}`;
    
    const sanitized = {
      dealer: redact(String(dealer || '')),
      email: redact(String(email || '')),
      scanResults,
      utm,
      timestamp: new Date().toISOString(),
      source: 'instant_analyzer',
    };

    await redis.setex(key, 90 * 24 * 60 * 60, JSON.stringify(sanitized));

    // Log telemetry
    await logger.info('Email captured', {
      event: 'email_captured',
      dealer: redact(String(dealer || '')),
      hasScanResults: !!scanResults,
      utm_source: utm?.source,
    });

    // Send welcome email
    try {
      const { emailService } = await import('@/lib/services/email');
      await emailService.sendWelcomeEmail(email, dealer);
    } catch (emailError: any) {
      // Log but don't fail the request
      await logger.warn('Failed to send welcome email', { error: emailError.message });
    }

    // TODO: Add to CRM/marketing automation (HubSpot, Salesforce, etc.)

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
}, {
  schema: CaptureEmailSchema,
});
