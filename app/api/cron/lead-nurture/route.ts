/**
 * Lead Nurture Cron Job
 *
 * This endpoint should be called by Vercel Cron (or external scheduler)
 * to automatically send follow-up emails to leads.
 *
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/lead-nurture",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { processLeadNurtureQueue } from '@/lib/email/lead-nurture';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for cron job

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting lead nurture cron job...');
    await processLeadNurtureQueue();

    return NextResponse.json(
      { success: true, message: 'Lead nurture queue processed' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Lead nurture cron job failed:', error);
    return NextResponse.json(
      { error: 'Failed to process lead nurture queue' },
      { status: 500 }
    );
  }
}
