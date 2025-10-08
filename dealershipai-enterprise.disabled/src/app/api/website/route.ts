import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock Website data - replace with real data source
    const websiteData = {
      domain: 'example-dealership.com',
      status: 'active',
      lastCrawl: new Date().toISOString(),
      metrics: {
        pagesIndexed: 1250,
        loadTime: 2.1,
        mobileScore: 92,
        seoScore: 78
      },
      issues: [
        { id: 1, type: 'error', message: 'Missing meta descriptions on 15 pages', severity: 'medium' },
        { id: 2, type: 'warning', message: 'Slow loading images detected', severity: 'low' }
      ]
    }

    return NextResponse.json(websiteData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch website data' },
      { status: 500 }
    )
  }
}
