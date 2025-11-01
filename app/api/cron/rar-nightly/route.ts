import { NextRequest, NextResponse } from 'next/server';
import { rarQueue } from '@/lib/queues/rarQueue';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/rar-nightly
 * 
 * Vercel Cron Job: Runs nightly at 3 AM UTC
 * Computes RaR for all active dealers for the current month
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    // Get all dealers (adjust query based on your schema)
    const dealers = await prisma.dealership.findMany({
      select: { id: true },
      where: {
        // Add any active status filter if you have one
      }
    });

    // Enqueue compute for each dealer
    const queued: string[] = [];
    for (const dealer of dealers) {
      await rarQueue.add(
        'computeMonthly',
        { dealerId: dealer.id, month: currentMonth },
        { jobId: `${dealer.id}:${currentMonth}` }
      );
      queued.push(dealer.id);
    }

    return NextResponse.json({
      ok: true,
      queued: queued.length,
      month: currentMonth,
      dealers: queued
    });
  } catch (error) {
    console.error('RaR nightly cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

