import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/fleet-refresh
 * 
 * Scheduled cron job (08:00, 12:00, 16:00 ET) to refresh all origins
 * Groups by city for efficient processing
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret-change-in-production';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active dealerships grouped by city
    const dealerships = await prisma.dealership.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        domain: true,
        city: true,
        state: true,
      },
    });

    // Group by city for batch processing
    const byCity: Record<string, typeof dealerships> = {};
    for (const dealer of dealerships) {
      const key = `${dealer.city}, ${dealer.state}`;
      if (!byCity[key]) byCity[key] = [];
      byCity[key].push(dealer);
    }

    const results = {
      total: dealerships.length,
      cities: Object.keys(byCity).length,
      processed: 0,
      queued: 0,
      errors: 0,
      errorsList: [] as any[],
    };

    // Process each city group
    for (const [city, dealers] of Object.entries(byCity)) {
      for (const dealer of dealers) {
        try {
          // Check if we need refresh (last audit > 4 hours old)
          const lastAudit = await prisma.audit.findFirst({
            where: { dealershipId: dealer.id },
            orderBy: { createdAt: 'desc' },
          });

          const needsRefresh = !lastAudit ||
            (new Date().getTime() - lastAudit.createdAt.getTime()) > 4 * 60 * 60 * 1000;

          if (needsRefresh) {
            // Queue refresh
            await prisma.audit.create({
              data: {
                dealershipId: dealer.id,
                domain: dealer.domain,
                scores: JSON.stringify({
                  queued: true,
                  queuedAt: new Date().toISOString(),
                  cronTriggered: true,
                  city,
                }),
                status: 'pending',
              },
            });

            // Simulate async processing
            setTimeout(async () => {
              try {
                const aiVisibility = Math.random() * 30 + 70;
                const zeroClick = Math.random() * 20 + 60;
                const ugcHealth = Math.random() * 15 + 75;

                await Promise.all([
                  prisma.score.create({
                    data: {
                      dealershipId: dealer.id,
                      aiVisibility,
                      zeroClick,
                      ugcHealth,
                    },
                  }),
                  prisma.audit.updateMany({
                    where: {
                      dealershipId: dealer.id,
                      status: 'pending',
                      scores: {
                        path: ['cronTriggered'],
                        equals: true,
                      },
                    },
                    data: {
                      status: 'completed',
                      scores: JSON.stringify({
                        aiVisibility,
                        zeroClick,
                        ugcHealth,
                        completedAt: new Date().toISOString(),
                      }),
                    },
                  }),
                ]);
              } catch (error) {
                console.error(`Background refresh error for ${dealer.domain}:`, error);
              }
            }, Math.random() * 5000); // Stagger processing

            results.queued++;
          }
          results.processed++;
        } catch (error: any) {
          results.errors++;
          results.errorsList.push({
            domain: dealer.domain,
            error: error.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      timezone: 'America/New_York',
      ...results,
    });
  } catch (error: any) {
    console.error('Cron fleet refresh error:', error);
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    );
  }
}

