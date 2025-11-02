import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai-visibility/velocity?origin=https://www.dealer.com
 * 
 * Temporal velocity metrics: how quickly content propagates through
 * Google, Perplexity, and ChatGPT caches
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');

    if (!origin) {
      return NextResponse.json(
        { error: 'origin query parameter is required' },
        { status: 400 }
      );
    }

    const url = new URL(origin.startsWith('http') ? origin : `https://${origin}`);
    const domain = url.hostname.replace('www.', '');

    // Simulate velocity measurements (in production, query each platform)
    const velocity = {
      google: {
        averagePropagationDays: 2.5,
        lastVerified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        cacheFreshness: 0.92,
        indexedPages: 245,
        totalPages: 267,
      },
      perplexity: {
        averagePropagationDays: 4.2,
        lastVerified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        cacheFreshness: 0.78,
        mentionsFound: 18,
        accuracy: 0.85,
      },
      chatgpt: {
        averagePropagationDays: 5.8,
        lastVerified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        cacheFreshness: 0.65,
        mentionsFound: 12,
        accuracy: 0.72,
      },
      claude: {
        averagePropagationDays: 6.1,
        lastVerified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        cacheFreshness: 0.58,
        mentionsFound: 9,
        accuracy: 0.68,
      },
      summary: {
        avgPropagationDelay: 4.65, // days
        fastestPlatform: 'google',
        slowestPlatform: 'claude',
        overallVelocity: 0.73, // weighted average
        recommendation: 'Consider increasing sitemap frequency and adding structured data to accelerate indexing',
      },
    };

    return NextResponse.json({
      origin,
      domain,
      velocity,
      trends: {
        // Historical trend (last 30 days)
        acceleration: 0.12, // Getting faster over time
        bestImprovement: 'google', // Which platform improved most
        actionItems: [
          {
            platform: 'claude',
            issue: 'Slowest propagation (6.1 days)',
            fix: 'Increase social signals and backlinks to improve Claude cache refresh',
            estimatedImprovement: 'Could reduce to 4.5 days (+26%)',
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('Velocity metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get velocity metrics' },
      { status: 500 }
    );
  }
}

