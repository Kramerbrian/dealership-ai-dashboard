import { NextResponse } from 'next/server'
import { trackSLO } from '@/lib/slo'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const startTime = Date.now();
  
  try {
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    // Return mock data for demo (no database connection)
    const duration = Date.now() - startTime;
    trackSLO('api.aeo.leaderboard', duration);
    
    const response = NextResponse.json({
      data: [
        {
          engine: 'google_sge',
          total_queries: 1250,
          total_appearances: 342,
          appearance_rate_pct: 27.36,
          total_citations: 89,
          citation_rate_pct: 26.02,
          avg_clicks_when_appeared: 2.4,
          last_observed: new Date().toISOString()
        },
        {
          engine: 'perplexity',
          total_queries: 890,
          total_appearances: 198,
          appearance_rate_pct: 22.25,
          total_citations: 45,
          citation_rate_pct: 22.73,
          avg_clicks_when_appeared: 1.8,
          last_observed: new Date().toISOString()
        },
        {
          engine: 'gemini',
          total_queries: 675,
          total_appearances: 156,
          appearance_rate_pct: 23.11,
          total_citations: 38,
          citation_rate_pct: 24.36,
          avg_clicks_when_appeared: 2.1,
          last_observed: new Date().toISOString()
        }
      ],
      period: `${days} days`,
      lastUpdated: new Date().toISOString(),
      source: 'mock_data'
    });
    
    response.headers.set('Server-Timing', `aeo-leaderboard;dur=${duration}`);
    return response;

  } catch (error) {
    console.error('AEO Leaderboard API Error:', error)
    
    const duration = Date.now() - startTime;
    trackSLO('api.aeo.leaderboard', duration);
    
    // Return mock data on error
    return NextResponse.json({
      data: [
        {
          engine: 'google_sge',
          total_queries: 1250,
          total_appearances: 342,
          appearance_rate_pct: 27.36,
          total_citations: 89,
          citation_rate_pct: 26.02,
          avg_clicks_when_appeared: 2.4,
          last_observed: new Date().toISOString()
        },
        {
          engine: 'perplexity',
          total_queries: 890,
          total_appearances: 198,
          appearance_rate_pct: 22.25,
          total_citations: 45,
          citation_rate_pct: 22.73,
          avg_clicks_when_appeared: 1.8,
          last_observed: new Date().toISOString()
        },
        {
          engine: 'gemini',
          total_queries: 675,
          total_appearances: 156,
          appearance_rate_pct: 23.11,
          total_citations: 38,
          citation_rate_pct: 24.36,
          avg_clicks_when_appeared: 2.1,
          last_observed: new Date().toISOString()
        }
      ],
      period: '30 days',
      lastUpdated: new Date().toISOString(),
      source: 'error_fallback',
      error: 'Database connection failed, using mock data'
    })
  }
}
