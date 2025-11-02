/**
 * Unified API endpoint for Example Dashboard
 * Aggregates data from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(apiRateLimit, `dashboard:${clientIP}`);
    
    if (!rateLimitCheck.success && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || 'demo';
    
    // Try to fetch from real APIs, fallback to mock data
    let overviewData = null;
    let competitorsData = null;
    let aiVisibilityData = null;

    try {
      // Fetch from real APIs (with error handling)
      const [overview, competitors, aiVisibility] = await Promise.all([
        fetch(`${req.nextUrl.origin}/api/dashboard/overview-live?dealerId=${dealerId}&timeRange=7d`, {
          headers: { 'User-Agent': 'DealershipAI-Dashboard' }
        }).catch(() => null),
        fetch(`${req.nextUrl.origin}/api/competitors/intelligence?dealerId=${dealerId}`, {
          headers: { 'User-Agent': 'DealershipAI-Dashboard' }
        }).catch(() => null),
        fetch(`${req.nextUrl.origin}/api/ai/visibility-index?dealerId=${dealerId}`, {
          headers: { 'User-Agent': 'DealershipAI-Dashboard' }
        }).catch(() => null),
      ]);

      if (overview?.ok) {
        overviewData = await overview.json();
      }
      if (competitors?.ok) {
        competitorsData = await competitors.json();
      }
      if (aiVisibility?.ok) {
        aiVisibilityData = await aiVisibility.json();
      }
    } catch (fetchError) {
      // Silently fall back to mock data
      console.log('[Example Dashboard API] Using fallback data');
    }

    // Transform to dashboard format
    const dashboardData = {
      trustScore: overviewData?.data?.aiVisibility?.score || 
                  aiVisibilityData?.overallScore || 
                  78,
      scoreDelta: overviewData?.data?.aiVisibility?.trend || 5,
      traffic: overviewData?.data?.leads?.monthly || 5200,
      aiCitations: overviewData?.data?.aiVisibility?.citations || 145,
      pillars: {
        seo: overviewData?.data?.aiVisibility?.seo || 
             aiVisibilityData?.seoScore || 
             85,
        aeo: overviewData?.data?.aiVisibility?.aeo || 
             aiVisibilityData?.aeoScore || 
             72,
        geo: overviewData?.data?.aiVisibility?.geo || 
             aiVisibilityData?.geoScore || 
             90,
        qai: overviewData?.data?.aiVisibility?.qai || 
             aiVisibilityData?.qaiScore || 
             65,
      },
      competitors: competitorsData?.competitors?.map((comp: any, idx: number) => ({
        id: comp.id || `comp${idx + 1}`,
        name: comp.name,
        trustScore: comp.trustScore || comp.score || 75,
        scoreDelta: comp.scoreDelta || comp.change || 0,
        distance: comp.distance || 5 + idx * 3,
        city: comp.city || 'Naples',
        strengths: comp.strengths || [],
        weaknesses: comp.weaknesses || [],
      })) || [
        { id: 'comp1', name: 'AutoNation', trustScore: 82, scoreDelta: 3, distance: 5, city: 'Naples', strengths: ['Brand Recognition'], weaknesses: ['Slow Response'] },
        { id: 'comp2', name: 'Germain Toyota', trustScore: 75, scoreDelta: -2, distance: 2, city: 'Naples', strengths: ['Local SEO'], weaknesses: ['Outdated Inventory'] },
        { id: 'comp3', name: 'Honda of Estero', trustScore: 70, scoreDelta: 6, distance: 10, city: 'Estero', strengths: ['Aggressive Pricing'], weaknesses: ['Poor Reviews'] },
        { id: 'comp4', name: 'Toyota of Fort Myers', trustScore: 80, scoreDelta: 1, distance: 15, city: 'Fort Myers', strengths: ['Large Inventory'], weaknesses: ['High Ad Spend'] },
      ],
      criticalIssues: overviewData?.data?.recommendations?.filter((r: any) => r.priority === 'high')?.length || 2,
      recentActivity: overviewData?.data?.recommendations?.slice(0, 2).map((r: any) => r.title) || 
                     ['New negative review', 'Schema markup fixed'],
    };

    const response = NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });

    // Add caching headers for performance
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    // Add rate limit headers
    if (rateLimitCheck.limit && rateLimitCheck.remaining !== undefined) {
      response.headers.set('X-RateLimit-Limit', String(rateLimitCheck.limit));
      response.headers.set('X-RateLimit-Remaining', String(rateLimitCheck.remaining));
      if (rateLimitCheck.reset) {
        response.headers.set('X-RateLimit-Reset', String(rateLimitCheck.reset));
      }
    }

    return response;

  } catch (error) {
    console.error('[Example Dashboard API] Error:', error);
    
    // Return fallback mock data on error - always succeeds
    const response = NextResponse.json({
      success: true, // Changed to true so dashboard still works
      data: {
        trustScore: 78,
        scoreDelta: 5,
        traffic: 5200,
        aiCitations: 145,
        pillars: {
          seo: 85,
          aeo: 72,
          geo: 90,
          qai: 65,
        },
        competitors: [
          { id: 'comp1', name: 'AutoNation', trustScore: 82, scoreDelta: 3, distance: 5, city: 'Naples', strengths: ['Brand Recognition'], weaknesses: ['Slow Response'] },
          { id: 'comp2', name: 'Germain Toyota', trustScore: 75, scoreDelta: -2, distance: 2, city: 'Naples', strengths: ['Local SEO'], weaknesses: ['Outdated Inventory'] },
        ],
        criticalIssues: 2,
        recentActivity: ['New negative review', 'Schema markup fixed'],
      },
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Add error cache headers (shorter TTL for errors)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=60'
    );

    return response;
  }
}
