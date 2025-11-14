import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * AI Visibility Analyzer Endpoint
 * POST /api/analyze
 * 
 * Proxies to backend AI scoring APIs and normalizes response for landing page
 */
export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Normalize domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // TODO: Replace with real API calls
    const dealershipName = cleanDomain
      .split('.')[0]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const result = {
      dealership: dealershipName,
      location: "Unknown",
      domain: cleanDomain,
      overall: Math.floor(Math.random() * 20) + 75,
      rank: Math.floor(Math.random() * 5) + 1,
      of: 12,
      platforms: [
        { name: "ChatGPT", score: Math.floor(Math.random() * 20) + 80, status: "Excellent" },
        { name: "Claude", score: Math.floor(Math.random() * 15) + 75, status: "Good" },
        { name: "Perplexity", score: Math.floor(Math.random() * 15) + 70, status: "Good" },
        { name: "Gemini", score: Math.floor(Math.random() * 15) + 65, status: "Fair" },
        { name: "Copilot", score: Math.floor(Math.random() * 15) + 60, status: "Fair" }
      ],
      issues: [
        { title: "Missing AutoDealer Schema", impact: Math.floor(Math.random() * 5000) + 5000, effort: "2 hours", fix: "schema" },
        { title: "Low Review Response Rate", impact: Math.floor(Math.random() * 3000) + 2000, effort: "1 hour", fix: "ugc" },
        { title: "Incomplete FAQ Schema", impact: Math.floor(Math.random() * 2000) + 1500, effort: "3 hours", fix: "schema" }
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[analyze] Error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
