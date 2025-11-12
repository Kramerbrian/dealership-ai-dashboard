import { NextRequest, NextResponse } from 'next/server';

/**
 * MarketPulse Compute API
 * --------------------------------------------------
 * Calculates AI Visibility Index (AIV) and Algorithmic Trust Index (ATI)
 * for a given dealership URL. Used by the landing page to show live KPIs.
 *
 * This is a mock implementation - replace with actual MarketPulse logic.
 */

export const runtime = 'edge';

interface MarketPulseMetrics {
  aiv: number;        // AI Visibility Index (0-1)
  ati: number;        // Algorithmic Trust Index (0-1)
  schemaHealth: number;
  competitorRank: number;
  dma: string;
  lastUpdated: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealer = searchParams.get('dealer');

  if (!dealer) {
    return NextResponse.json(
      { error: 'Missing dealer parameter' },
      { status: 400 }
    );
  }

  // Simulate API processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate deterministic metrics based on dealer domain
  // In production, this would fetch real data from your analytics engine
  const metrics = calculateMetrics(dealer);

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function calculateMetrics(dealer: string): MarketPulseMetrics {
  // Generate deterministic but realistic-looking metrics
  const hash = [...dealer.toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);

  // Base values influenced by domain hash for consistency
  const baseAIV = 0.70 + (hash % 25) / 100;
  const baseATI = 0.65 + (hash % 30) / 100;

  // Add small random variation for "live" feel
  const aiv = Math.min(0.98, baseAIV + (Math.random() - 0.5) * 0.05);
  const ati = Math.min(0.98, baseATI + (Math.random() - 0.5) * 0.05);

  // Schema health typically correlates with ATI
  const schemaHealth = Math.min(100, Math.round(ati * 100 + (Math.random() - 0.5) * 10));

  // Competitor rank in DMA (1-20)
  const competitorRank = Math.max(1, Math.round(20 - (aiv * 15) + (Math.random() - 0.5) * 3));

  // Extract likely DMA from domain (mock - in production use geo lookup)
  const dma = extractDMA(dealer);

  return {
    aiv: Number(aiv.toFixed(2)),
    ati: Number(ati.toFixed(2)),
    schemaHealth,
    competitorRank,
    dma,
    lastUpdated: new Date().toISOString(),
  };
}

function extractDMA(dealer: string): string {
  // Mock DMA extraction - in production, use actual geo/domain lookup
  const cityPatterns: Record<string, string> = {
    'naples': 'Naples-Fort Myers, FL',
    'miami': 'Miami-Fort Lauderdale, FL',
    'tampa': 'Tampa-St. Petersburg, FL',
    'orlando': 'Orlando-Daytona Beach, FL',
    'atlanta': 'Atlanta, GA',
    'charlotte': 'Charlotte, NC',
    'dallas': 'Dallas-Fort Worth, TX',
    'houston': 'Houston, TX',
    'austin': 'Austin, TX',
    'phoenix': 'Phoenix, AZ',
    'denver': 'Denver, CO',
    'seattle': 'Seattle-Tacoma, WA',
    'portland': 'Portland, OR',
    'vegas': 'Las Vegas, NV',
    'losangeles': 'Los Angeles, CA',
    'sandiego': 'San Diego, CA',
    'sacramento': 'Sacramento, CA',
    'chicago': 'Chicago, IL',
    'detroit': 'Detroit, MI',
    'boston': 'Boston, MA',
    'newyork': 'New York, NY',
  };

  const normalized = dealer.toLowerCase().replace(/[^a-z]/g, '');

  for (const [key, dma] of Object.entries(cityPatterns)) {
    if (normalized.includes(key)) {
      return dma;
    }
  }

  // Default fallback
  return 'National Average';
}
