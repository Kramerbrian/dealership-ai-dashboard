import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const strategy = searchParams.get('strategy') || 'mobile';

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAGESPEED_API_KEY || 'AIzaSyBVvR8Q_VqMVHCbvQGqG7LqVW0m8h6QDIY';
    // For development, use a fallback key or return mock data
    if (!apiKey || apiKey === 'your_pagespeed_api_key_here') {
      return NextResponse.json({
        success: true,
        data: {
          score: 87,
          metrics: {
            fcp: '1.2s',
            lcp: '2.1s',
            cls: '0.05',
            fid: '125ms',
            tbt: '180ms',
            si: '2.3s',
            tti: '3.1s'
          },
          opportunities: [
            {
              id: 'unused-css-rules',
              title: 'Remove unused CSS',
              description: 'Remove unused CSS rules to reduce bytes consumed by network activity.',
              score: 0.85,
              savings: 1200
            }
          ]
        },
        metadata: {
          url,
          strategy,
          analyzedAt: new Date().toISOString()
        }
      });
    }

    const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
    
    const response = await fetch(pagespeedUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const result = {
      score: Math.round(data.lighthouseResult.categories.performance.score * 100),
      metrics: {
        fcp: data.lighthouseResult.audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: data.lighthouseResult.audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue || 'N/A',
        fid: data.lighthouseResult.audits['max-potential-fid']?.displayValue || 'N/A',
        tbt: data.lighthouseResult.audits['total-blocking-time']?.displayValue || 'N/A',
        si: data.lighthouseResult.audits['speed-index']?.displayValue || 'N/A',
        tti: data.lighthouseResult.audits['interactive']?.displayValue || 'N/A'
      },
      opportunities: Object.keys(data.lighthouseResult.audits)
        .filter(key => data.lighthouseResult.audits[key].details?.type === 'opportunity')
        .map(key => ({
          id: key,
          title: data.lighthouseResult.audits[key].title,
          description: data.lighthouseResult.audits[key].description,
          score: data.lighthouseResult.audits[key].score,
          savings: data.lighthouseResult.audits[key].details?.overallSavingsMs || 0
        }))
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 5)
    };

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        url,
        strategy,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PageSpeed API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch PageSpeed data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock data for testing
export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  return NextResponse.json({
    success: true,
    data: {
      score: 87,
      metrics: {
        fcp: '1.2s',
        lcp: '2.1s',
        cls: '0.05',
        fid: '125ms',
        tbt: '180ms',
        si: '2.3s',
        tti: '3.1s'
      },
      opportunities: [
        {
          id: 'unused-css-rules',
          title: 'Remove unused CSS',
          description: 'Remove unused CSS rules to reduce bytes consumed by network activity.',
          score: 0.85,
          savings: 1200
        },
        {
          id: 'render-blocking-resources',
          title: 'Eliminate render-blocking resources',
          description: 'Resources are blocking the first paint of your page.',
          score: 0.72,
          savings: 800
        }
      ]
    },
    metadata: {
      url: url || 'https://example.com',
      strategy: 'mobile',
      analyzedAt: new Date().toISOString()
    }
  });
}
