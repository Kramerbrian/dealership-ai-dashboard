import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/analytics/track
 * 
 * Server-side analytics event tracking
 * Stores events in database for business metrics computation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, properties, userId, dealerId } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'event is required' },
        { status: 400 }
      );
    }

    // Store event in database (use events table if exists, or create audit log)
    // For now, we'll use a simplified approach
    await prisma.auditLog.create({
      data: {
        action: `analytics:${event}`,
        userId: userId || 'anonymous',
        details: JSON.stringify({
          event,
          properties,
          dealerId,
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics track error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

