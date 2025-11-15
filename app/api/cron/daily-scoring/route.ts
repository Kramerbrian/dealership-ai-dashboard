/**
 * Daily Scoring Cron Job
 * Runs at 04:00 local time with ±20 min jitter per dealership
 * 
 * Vercel Cron: 0 4 * * * (runs at 04:00 UTC)
 * Jitter is applied per dealership to avoid thundering herd
 */

import { NextRequest, NextResponse } from 'next/server';
import { scoreComposite, scoreAIVisibility, scoreWebsiteHealth, scoreOverall, scoreMystery, scoreEEAT, consensus } from '@/lib/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/daily-scoring
 * Triggered by Vercel Cron at 04:00 UTC
 * Applies jitter per dealership (±20 min)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify cron secret (Vercel Cron sends this)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active dealerships (from database or config)
    // TODO: Replace with actual dealership fetch
    const dealerships = await getActiveDealerships();

    const results = [];

    for (const dealer of dealerships) {
      // Apply jitter: ±20 minutes based on dealer ID hash
      const jitter = getJitterForDealer(dealer.id, 20);
      const scheduledTime = new Date();
      scheduledTime.setHours(4, jitter, 0, 0);

      // Skip if not time yet (for manual runs, process immediately)
      const now = new Date();
      if (now < scheduledTime && !req.headers.get('x-vercel-cron')) {
        continue; // Skip until scheduled time
      }

      try {
        // Fetch latest metrics for dealership
        const metrics = await fetchDealershipMetrics(dealer.id);

        // Calculate scores
        const scores = {
          seo: scoreComposite(metrics.seo, 'seo'),
          aeo: scoreComposite(metrics.aeo, 'aeo'),
          geo: scoreComposite(metrics.geo, 'geo'),
          ai: scoreAIVisibility(metrics.aiCoverage),
          wh: scoreWebsiteHealth(metrics.vitals, metrics.meta, metrics.indexation),
          mystery: scoreMystery(metrics.mystery),
        };

        const overall = scoreOverall(scores);
        const eeat = scoreEEAT(metrics.eeatFlags);

        // Calculate consensus for issues
        const issueConsensus = consensus(metrics.issueHits);

        // Save scores to database
        await saveScores(dealer.id, {
          ...scores,
          overall,
          eeat,
          issueConsensus,
          timestamp: new Date().toISOString(),
        });

        results.push({
          dealer: dealer.id,
          overall,
          status: 'success',
        });
      } catch (error: any) {
        console.error(`[daily-scoring] Error for dealer ${dealer.id}:`, error);
        results.push({
          dealer: dealer.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[daily-scoring] Fatal error:', error);
    return NextResponse.json(
      { error: 'Failed to process daily scoring', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get jitter offset in minutes for a dealer
 * Uses dealer ID hash to ensure consistent jitter per dealer
 */
function getJitterForDealer(dealerId: string, maxMinutes: number): number {
  // Simple hash of dealer ID
  let hash = 0;
  for (let i = 0; i < dealerId.length; i++) {
    hash = (hash << 5) - hash + dealerId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return jitter between -maxMinutes and +maxMinutes
  return Math.abs(hash) % (maxMinutes * 2 + 1) - maxMinutes;
}

// Placeholder functions - replace with actual implementations
async function getActiveDealerships() {
  // TODO: Fetch from database
  return [{ id: 'default-dealer', domain: 'exampledealer.com' }];
}

async function fetchDealershipMetrics(dealerId: string) {
  // TODO: Fetch actual metrics from database/APIs
  return {
    seo: { mentions: 75, citations: 80, sentiment: 70, shareOfVoice: 65 },
    aeo: { mentions: 70, citations: 75, sentiment: 65, shareOfVoice: 60 },
    geo: { mentions: 80, citations: 85, sentiment: 75, shareOfVoice: 70 },
    aiCoverage: { perplexity: 75, chatgpt: 80, gemini: 70 },
    vitals: { lcp: 2.8, inp: 250, cls: 0.12 },
    meta: { title: 0.9, description: 0.85, h1: 0.95 },
    indexation: { indexed: 950, excluded: 50 },
    mystery: {
      speedToLead: 75,
      quoteTransparency: 80,
      phoneEtiquette: 85,
      chatResponsiveness: 70,
      apptSetRate: 75,
      followUp: 80,
    },
    eeatFlags: { exp: true, expx: true, auth: true, trust: true },
    issueHits: [],
  };
}

async function saveScores(dealerId: string, scores: any) {
  // TODO: Save to database
  console.log(`[daily-scoring] Saving scores for ${dealerId}:`, scores);
}

