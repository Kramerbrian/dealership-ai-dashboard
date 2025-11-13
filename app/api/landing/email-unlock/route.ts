import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api/error-response';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const EmailUnlockSchema = z.object({
  email: z.string().email('Valid email is required'),
  dealerName: z.string().optional(),
  revenueAtRisk: z.number().optional(),
});

export const POST = createPublicRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const { email, dealerName, revenueAtRisk } = EmailUnlockSchema.parse(body);

    // Track email capture
    const redisClient = redis();

    if (redisClient) {
      // Add to email list
      const emailEvent = JSON.stringify({
        email,
        dealerName: dealerName || 'Unknown',
        revenueAtRisk: revenueAtRisk || 0,
        timestamp: new Date().toISOString(),
        source: 'landing-page-unlock',
      });

      await redisClient.lpush('landing:email_captures', emailEvent);
      await redisClient.ltrim('landing:email_captures', 0, 999); // Keep last 1000

      // Increment daily counter
      const todayKey = `landing:emails:${new Date().toISOString().split('T')[0]}`;
      await redisClient.incr(todayKey);
      await redisClient.expire(todayKey, 86400 * 30); // Keep for 30 days

      // Add to unique emails set (for deduplication)
      await redisClient.sadd('landing:unique_emails', email.toLowerCase());
    }

    // TODO: Integrate with email service provider (SendGrid, Resend, etc.)
    // For now, just log the capture
    console.log(`Email captured: ${email} - ${dealerName || 'Unknown'}`);

    // In production, you'd send the email here:
    /*
    await sendEmailReport({
      to: email,
      dealerName,
      revenueAtRisk,
      templateId: 'ai-visibility-report',
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Report will be sent to your email',
    });
  } catch (error) {
    console.error('Failed to process email unlock:', error);
    return NextResponse.json(
      { error: 'Failed to process email unlock' },
      { status: 500 }
    );
  }
});

// Get email capture stats
export async function GET() {
  try {
    const redisClient = redis();

    if (!redisClient) {
      return NextResponse.json({
        totalEmails: 0,
        uniqueEmails: 0,
        todayCount: 0,
        recent: [],
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const [todayCount, uniqueEmailsSet, recentCaptures] = await Promise.all([
      redisClient.get(`landing:emails:${today}`),
      redisClient.scard('landing:unique_emails'),
      redisClient.lrange('landing:email_captures', 0, 9),
    ]);

    return NextResponse.json({
      todayCount: parseInt(todayCount || '0'),
      uniqueEmails: uniqueEmailsSet,
      recent: recentCaptures.map((capture) => JSON.parse(capture)),
    });
  } catch (error) {
    console.error('Failed to get email stats:', error);
    return NextResponse.json(
      { error: 'Failed to get email stats' },
      { status: 500 }
    );
  }
}
