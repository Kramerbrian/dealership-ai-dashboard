import { NextRequest, NextResponse } from 'next/server';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  impact: number; // VAI points improvement
  effort: 'low' | 'medium' | 'high';
  timeEstimate: string; // "5 min", "30 min", etc.
  category: 'schema' | 'gmb' | 'content' | 'technical' | 'reviews' | 'social';
  priority: number; // Calculated: impact / effort multiplier
  revenueImpact?: number; // Estimated monthly revenue impact
  status?: 'available' | 'in-progress' | 'completed';
}

interface QuickWinsResponse {
  wins: QuickWin[];
  totalImpact: number;
  totalRevenueImpact: number;
  averageEffort: string;
}

/**
 * Quick Win Detection API
 * 
 * Identifies easy, high-impact fixes that can be completed quickly
 * Prioritized by ROI (impact/effort ratio)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const dealerId = searchParams.get('dealerId');

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'Domain or dealerId is required' },
        { status: 400 }
      );
    }

    // In production, fetch real data from database
    // For now, generate realistic demo quick wins
    const quickWins = detectQuickWins({
      domain: domain || 'example.com',
      dealerId: dealerId || undefined
    });

    const totalImpact = quickWins.reduce((sum, win) => sum + win.impact, 0);
    const totalRevenueImpact = quickWins.reduce(
      (sum, win) => sum + (win.revenueImpact || 0),
      0
    );
    const averageEffort = calculateAverageEffort(quickWins);

    const response: QuickWinsResponse = {
      wins: quickWins,
      totalImpact: Math.round(totalImpact * 10) / 10,
      totalRevenueImpact: Math.round(totalRevenueImpact),
      averageEffort
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Quick wins API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect quick wins',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Detect quick wins based on common issues
 */
function detectQuickWins(context: { domain: string; dealerId?: string }): QuickWin[] {
  const wins: QuickWin[] = [];

  // Schema errors (low effort, high impact)
  const schemaErrorCount = Math.floor(Math.random() * 5) + 1;
  if (schemaErrorCount > 0) {
    wins.push({
      id: 'schema-fix',
      title: `Fix ${schemaErrorCount} Schema Error${schemaErrorCount > 1 ? 's' : ''}`,
      description: 'Fix structured data errors for better AI visibility. These are easy JSON-LD fixes.',
      impact: 6 + schemaErrorCount, // More errors = more impact
      effort: 'low',
      timeEstimate: '5-10 min',
      category: 'schema',
      priority: calculatePriority(6 + schemaErrorCount, 'low'),
      revenueImpact: (6 + schemaErrorCount) * 248 // $248 per VAI point (simplified)
    });
  }

  // Missing Google Business hours
  const hasGMBHours = Math.random() > 0.3; // 70% chance missing
  if (!hasGMBHours) {
    wins.push({
      id: 'gmb-hours',
      title: 'Add Business Hours to Google Business',
      description: 'Complete your Google Business Profile with hours of operation to improve local visibility.',
      impact: 5,
      effort: 'low',
      timeEstimate: '2 min',
      category: 'gmb',
      priority: calculatePriority(5, 'low'),
      revenueImpact: 5 * 248
    });
  }

  // Missing meta descriptions
  const missingMetaCount = Math.floor(Math.random() * 20) + 5;
  if (missingMetaCount > 0) {
    wins.push({
      id: 'meta-descriptions',
      title: `Add ${missingMetaCount} Meta Descriptions`,
      description: 'Add SEO meta descriptions to key pages to improve search visibility.',
      impact: Math.min(8, missingMetaCount * 0.4), // Cap at 8 points
      effort: 'low',
      timeEstimate: '15-30 min',
      category: 'content',
      priority: calculatePriority(8, 'low'),
      revenueImpact: 8 * 248
    });
  }

  // Missing Google Business photos
  const photoCount = Math.floor(Math.random() * 10);
  if (photoCount < 10) {
    wins.push({
      id: 'gmb-photos',
      title: `Add ${10 - photoCount} More Photos to Google Business`,
      description: 'Increase trust and engagement by adding more photos to your Google Business Profile.',
      impact: 4,
      effort: 'low',
      timeEstimate: '10 min',
      category: 'gmb',
      priority: calculatePriority(4, 'low'),
      revenueImpact: 4 * 248
    });
  }

  // Review response gaps
  const unreviewedCount = Math.floor(Math.random() * 15) + 3;
  if (unreviewedCount > 0) {
    wins.push({
      id: 'review-responses',
      title: `Respond to ${unreviewedCount} Recent Reviews`,
      description: 'Responding to reviews builds trust and improves your local SEO ranking.',
      impact: 6,
      effort: 'low',
      timeEstimate: '10-15 min',
      category: 'reviews',
      priority: calculatePriority(6, 'low'),
      revenueImpact: 6 * 248
    });
  }

  // Missing sitemap
  const hasSitemap = Math.random() > 0.4; // 60% chance missing
  if (!hasSitemap) {
    wins.push({
      id: 'sitemap',
      title: 'Create and Submit XML Sitemap',
      description: 'Help search engines discover and index your pages faster.',
      impact: 4,
      effort: 'low',
      timeEstimate: '5 min',
      category: 'technical',
      priority: calculatePriority(4, 'low'),
      revenueImpact: 4 * 248
    });
  }

  // Broken links
  const brokenLinkCount = Math.floor(Math.random() * 5);
  if (brokenLinkCount > 0) {
    wins.push({
      id: 'broken-links',
      title: `Fix ${brokenLinkCount} Broken Link${brokenLinkCount > 1 ? 's' : ''}`,
      description: 'Fix broken internal links to improve user experience and SEO.',
      impact: 3,
      effort: 'low',
      timeEstimate: '5 min',
      category: 'technical',
      priority: calculatePriority(3, 'low'),
      revenueImpact: 3 * 248
    });
  }

  // Missing FAQ schema
  const hasFAQSchema = Math.random() > 0.5; // 50% chance missing
  if (!hasFAQSchema) {
    wins.push({
      id: 'faq-schema',
      title: 'Add FAQ Schema Markup',
      description: 'Add FAQ structured data to capture voice search and AI overview features.',
      impact: 7,
      effort: 'low',
      timeEstimate: '15 min',
      category: 'schema',
      priority: calculatePriority(7, 'low'),
      revenueImpact: 7 * 248
    });
  }

  // Missing social media links
  const hasSocialLinks = Math.random() > 0.3; // 70% chance missing
  if (!hasSocialLinks) {
    wins.push({
      id: 'social-links',
      title: 'Add Social Media Links to Website',
      description: 'Add links to your social media profiles to improve trust signals.',
      impact: 3,
      effort: 'low',
      timeEstimate: '5 min',
      category: 'social',
      priority: calculatePriority(3, 'low'),
      revenueImpact: 3 * 248
    });
  }

  // Sort by priority (highest ROI first)
  return wins.sort((a, b) => b.priority - a.priority).slice(0, 10); // Top 10 quick wins
}

/**
 * Calculate priority score (impact / effort multiplier)
 * Higher priority = better ROI
 */
function calculatePriority(impact: number, effort: 'low' | 'medium' | 'high'): number {
  const effortMultiplier = {
    low: 3,    // Low effort = 3x multiplier
    medium: 2, // Medium effort = 2x multiplier
    high: 1    // High effort = 1x multiplier
  };
  
  return impact * effortMultiplier[effort];
}

/**
 * Calculate average effort time
 */
function calculateAverageEffort(wins: QuickWin[]): string {
  if (wins.length === 0) return '0 min';

  const timeValues = wins.map(win => {
    const match = win.timeEstimate.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });

  const average = timeValues.reduce((a, b) => a + b, 0) / timeValues.length;
  
  if (average < 10) {
    return `${Math.round(average)} min`;
  } else if (average < 60) {
    return `${Math.round(average)} min`;
  } else {
    return `${Math.round(average / 60)} hour${average >= 120 ? 's' : ''}`;
  }
}

