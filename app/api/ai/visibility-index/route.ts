import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const dealerId = searchParams.get('dealerId');

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'Domain or dealerId is required' },
        { status: 400 }
      );
    }

    // Mock AI Visibility Index data
    const visibilityData = {
      domain: domain || 'demo-dealership.com',
      dealerId: dealerId || 'demo-dealer',
      timestamp: new Date().toISOString(),
      vai: {
        score: 87.3,
        grade: 'A',
        percentile: 87,
        trend: 'up',
        change: 2.3
      },
      breakdown: {
        searchPresence: {
          score: 89.2,
          weight: 0.3,
          factors: ['Google My Business', 'Local SEO', 'Directory Listings']
        },
        aiPlatforms: {
          score: 85.1,
          weight: 0.4,
          factors: ['ChatGPT', 'Claude', 'Perplexity', 'Bard']
        },
        contentQuality: {
          score: 88.7,
          weight: 0.3,
          factors: ['Website Content', 'Reviews', 'Social Media']
        }
      },
      recommendations: [
        {
          priority: 'high',
          category: 'AI Platforms',
          action: 'Optimize website content for AI training data',
          impact: 'Increase VAI by 5-8 points'
        },
        {
          priority: 'medium',
          category: 'Search Presence',
          action: 'Update Google My Business information',
          impact: 'Increase VAI by 2-3 points'
        }
      ]
    };

    const duration = Date.now() - startTime;
    // Optional telemetry hook; no-op if undefined
    try { (globalThis as any).trackSLO?.('api.ai.visibility-index', duration); } catch {}
    
    const response = NextResponse.json(visibilityData);
    response.headers.set('Server-Timing', `ai-visibility-index;dur=${duration}`);
    return response;
  } catch (error) {
    console.error('AI Visibility Index API error:', error);
    
    const duration = Date.now() - startTime;
    try { (globalThis as any).trackSLO?.('api.ai.visibility-index', duration); } catch {}
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { domain, dealerId, action } = body;

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'Domain or dealerId is required' },
        { status: 400 }
      );
    }

    // Handle VAI calculation requests
    switch (action) {
      case 'calculate':
        return NextResponse.json({
          success: true,
          message: 'VAI calculation initiated',
          jobId: `vai-${Date.now()}`,
          estimatedTime: '2-3 minutes'
        });
      
      case 'refresh':
        return NextResponse.json({
          success: true,
          message: 'VAI refresh initiated',
          timestamp: new Date().toISOString()
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Visibility Index POST error:', error);
    
    const duration = Date.now() - startTime;
    try { (globalThis as any).trackSLO?.('api.ai.visibility-index.post', duration); } catch {}
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
