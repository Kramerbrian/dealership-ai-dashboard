import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

interface RelevanceMetric {
  query: string;
  relevance: number;
  position: number;
  clickProbability: number;
  zeroClickProbability: number;
  competitors: {
    name: string;
    relevance: number;
    position: number;
  }[];
  opportunities: {
    action: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    timeToFix: string;
  }[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const dealerId = searchParams.get('dealerId');

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'domain or dealerId required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database queries
    // For now, return demo data based on domain/dealerId
    const metrics: RelevanceMetric[] = [
      {
        query: `best ${domain?.split('.')[0] || 'dealer'} near me`,
        relevance: 78,
        position: 2,
        clickProbability: 0.34,
        zeroClickProbability: 0.42,
        competitors: [
          { name: 'Naples Honda', relevance: 88, position: 1 },
          { name: 'Crown Nissan', relevance: 71, position: 3 },
        ],
        opportunities: [
          { action: 'Add local schema markup', impact: 15, effort: 'low', timeToFix: '2 hours' },
          { action: 'Optimize meta description', impact: 8, effort: 'low', timeToFix: '30 min' },
        ],
      },
      {
        query: `${domain?.split('.')[0] || 'inventory'} cape coral`,
        relevance: 65,
        position: 4,
        clickProbability: 0.18,
        zeroClickProbability: 0.55,
        competitors: [
          { name: 'Naples Honda', relevance: 82, position: 1 },
          { name: 'Germain Toyota', relevance: 74, position: 2 },
        ],
        opportunities: [
          { action: 'Enhance inventory schema', impact: 22, effort: 'medium', timeToFix: '4 hours' },
          { action: 'Add vehicle-specific FAQs', impact: 12, effort: 'medium', timeToFix: '3 hours' },
        ],
      },
      {
        query: `${domain?.split('.')[0] || 'service'} center reviews`,
        relevance: 82,
        position: 1,
        clickProbability: 0.45,
        zeroClickProbability: 0.28,
        competitors: [
          { name: 'Crown Nissan', relevance: 75, position: 2 },
          { name: 'Naples Honda', relevance: 68, position: 3 },
        ],
        opportunities: [
          { action: 'Increase review response rate', impact: 5, effort: 'low', timeToFix: '1 hour' },
        ],
      },
    ];

    // Calculate overall relevance (weighted average)
    const overallRelevance = Math.round(
      metrics.reduce((sum, m) => sum + m.relevance, 0) / metrics.length
    );

    return NextResponse.json({
      metrics,
      overallRelevance,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Relevance overlay API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

