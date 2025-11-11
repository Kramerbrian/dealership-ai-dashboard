import { NextRequest, NextResponse } from 'next/server';
import { trackSLO } from '@/lib/slo';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const dealerId = searchParams.get('dealerId') || 'default';

    // Simulate database query time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate realistic mock data based on time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    const baseScore = 85 + Math.random() * 10; // 85-95 range
    const trend = (Math.random() - 0.5) * 10; // -5 to +5 range

    const dashboardData = {
      timestamp: new Date().toISOString(),
      dealerId,
      timeRange,
      aiVisibility: {
        score: Math.round(baseScore * 10) / 10,
        trend: Math.round(trend * 10) / 10,
        breakdown: {
          seo: Math.round((baseScore + (Math.random() - 0.5) * 5) * 10) / 10,
          aeo: Math.round((baseScore - 10 + (Math.random() - 0.5) * 5) * 10) / 10,
          geo: Math.round((baseScore - 15 + (Math.random() - 0.5) * 5) * 10) / 10
        },
        platforms: {
          chatgpt: Math.round((baseScore + (Math.random() - 0.5) * 3) * 10) / 10,
          claude: Math.round((baseScore - 2 + (Math.random() - 0.5) * 3) * 10) / 10,
          perplexity: Math.round((baseScore - 5 + (Math.random() - 0.5) * 3) * 10) / 10,
          gemini: Math.round((baseScore - 3 + (Math.random() - 0.5) * 3) * 10) / 10
        }
      },
      revenue: {
        atRisk: Math.round((300000 + Math.random() * 200000) / 1000) * 1000,
        potential: Math.round((1000000 + Math.random() * 500000) / 1000) * 1000,
        trend: Math.round((Math.random() - 0.3) * 15 * 10) / 10, // Slightly positive bias
        monthly: Math.round((200000 + Math.random() * 100000) / 1000) * 1000
      },
      performance: {
        loadTime: Math.round((0.8 + Math.random() * 0.8) * 10) / 10,
        uptime: Math.round((99.5 + Math.random() * 0.4) * 10) / 10,
        score: Math.round((90 + Math.random() * 8) * 10) / 10,
        coreWebVitals: {
          lcp: Math.round((1.2 + Math.random() * 0.8) * 10) / 10,
          fid: Math.round((50 + Math.random() * 50) * 10) / 10,
          cls: Math.round((0.05 + Math.random() * 0.1) * 1000) / 1000
        }
      },
      leads: {
        monthly: Math.round(200 + Math.random() * 100),
        trend: Math.round((Math.random() - 0.2) * 20 * 10) / 10, // Slightly positive bias
        conversion: Math.round((2.5 + Math.random() * 2) * 10) / 10,
        sources: {
          organic: Math.round((150 + Math.random() * 50) * 10) / 10,
          direct: Math.round((80 + Math.random() * 30) * 10) / 10,
          social: Math.round((30 + Math.random() * 20) * 10) / 10,
          referral: Math.round((20 + Math.random() * 15) * 10) / 10
        }
      },
      competitive: {
        position: Math.round(1 + Math.random() * 4), // 1-5 position
        marketShare: Math.round((15 + Math.random() * 10) * 10) / 10,
        gap: Math.round((5 + Math.random() * 10) * 10) / 10
      },
      recommendations: [
        {
          id: '1',
          type: 'seo',
          priority: 'high',
          title: 'Optimize FAQ Schema',
          description: 'Add FAQ structured data to improve AI visibility',
          impact: 'Medium',
          effort: 'Low',
          estimatedLift: '5-8%'
        },
        {
          id: '2',
          type: 'content',
          priority: 'medium',
          title: 'Create Service-Specific Content',
          description: 'Develop dedicated pages for each service offering',
          impact: 'High',
          effort: 'Medium',
          estimatedLift: '10-15%'
        },
        {
          id: '3',
          type: 'technical',
          priority: 'high',
          title: 'Improve Page Speed',
          description: 'Optimize images and reduce JavaScript bundle size',
          impact: 'High',
          effort: 'Medium',
          estimatedLift: '8-12%'
        }
      ],
      alerts: [
        {
          id: '1',
          type: 'success',
          title: 'AI Visibility Improved',
          message: `Your AI visibility score increased by ${Math.round(trend * 10) / 10}% this week`,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'warning',
          title: 'Revenue at Risk Alert',
          message: 'Potential revenue loss detected in GEO performance',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: false
        }
      ],
      timeSeries: {
        aiVisibility: generateTimeSeriesData(days, baseScore),
        revenue: generateTimeSeriesData(days, 250000, 'revenue'),
        leads: generateTimeSeriesData(days, 200, 'leads')
      }
    };

    const duration = Date.now() - startTime;
    trackSLO('api.dashboard.overview', duration);

    const response = NextResponse.json(dashboardData);
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.headers.set('Server-Timing', `dashboard-overview;dur=${duration}`);
    
    return response;

  } catch (error) {
    console.error('Dashboard overview API error:', error);
    
    const duration = Date.now() - startTime;
    trackSLO('api.dashboard.overview', duration);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper function to generate time series data
function generateTimeSeriesData(days: number, baseValue: number, type: 'score' | 'revenue' | 'leads' = 'score') {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let value = baseValue;
    if (type === 'score') {
      value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * 10));
    } else if (type === 'revenue') {
      value = Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.2);
    } else if (type === 'leads') {
      value = Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.3);
    }
    
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value * 10) / 10,
      timestamp: date.toISOString()
    });
  }
  
  return data;
}