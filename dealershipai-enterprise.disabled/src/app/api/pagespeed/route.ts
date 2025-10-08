import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const strategy = searchParams.get('strategy') || 'mobile' // mobile or desktop
    const category = searchParams.get('category') || 'performance,accessibility,best-practices,seo'

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.PAGESPEED_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PageSpeed API key not configured' },
        { status: 500 }
      )
    }

    const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=${category}&key=${apiKey}`

    const response = await fetch(pagespeedUrl)
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract Core Web Vitals and other metrics
    const lighthouse = data.lighthouseResult
    const audits = lighthouse.audits

    const scores = {
      performance: Math.round(lighthouse.categories.performance.score * 100),
      accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
      bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
      seo: Math.round(lighthouse.categories.seo.score * 100),
    }

    const metrics = {
      // Core Web Vitals
      lcp: {
        value: audits['largest-contentful-paint']?.numericValue || 0,
        score: audits['largest-contentful-paint']?.score || 0,
        displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A',
      },
      fid: {
        value: audits['max-potential-fid']?.numericValue || 0,
        score: audits['max-potential-fid']?.score || 0,
        displayValue: audits['max-potential-fid']?.displayValue || 'N/A',
      },
      cls: {
        value: audits['cumulative-layout-shift']?.numericValue || 0,
        score: audits['cumulative-layout-shift']?.score || 0,
        displayValue: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      },
      // Additional metrics
      fcp: {
        value: audits['first-contentful-paint']?.numericValue || 0,
        score: audits['first-contentful-paint']?.score || 0,
        displayValue: audits['first-contentful-paint']?.displayValue || 'N/A',
      },
      si: {
        value: audits['speed-index']?.numericValue || 0,
        score: audits['speed-index']?.score || 0,
        displayValue: audits['speed-index']?.displayValue || 'N/A',
      },
      tti: {
        value: audits['interactive']?.numericValue || 0,
        score: audits['interactive']?.score || 0,
        displayValue: audits['interactive']?.displayValue || 'N/A',
      },
      tbt: {
        value: audits['total-blocking-time']?.numericValue || 0,
        score: audits['total-blocking-time']?.score || 0,
        displayValue: audits['total-blocking-time']?.displayValue || 'N/A',
      },
    }

    // Extract opportunities and diagnostics
    const opportunities = Object.entries(audits)
      .filter(([key, audit]: [string, any]) => audit.details?.type === 'opportunity' && audit.numericValue > 0)
      .map(([key, audit]: [string, any]) => ({
        id: key,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        savings: audit.numericValue,
        displayValue: audit.displayValue,
      }))
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 10)

    const diagnostics = Object.entries(audits)
      .filter(([key, audit]: [string, any]) => audit.details?.type === 'diagnostic' && audit.score < 1)
      .map(([key, audit]: [string, any]) => ({
        id: key,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
      }))
      .slice(0, 10)

    return NextResponse.json({
      url: data.id,
      strategy,
      scores,
      metrics,
      opportunities,
      diagnostics,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('PageSpeed API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze page speed', details: error.message },
      { status: 500 }
    )
  }
}
