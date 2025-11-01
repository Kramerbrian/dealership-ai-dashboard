import { NextRequest, NextResponse } from 'next/server';

/**
 * Ultra-lean quick scan endpoint
 * Returns preview data without requiring auth
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Extract domain (basic validation)
    const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();

    // Mock preview data (replace with real analysis in production)
    const preview = {
      domain,
      timestamp: new Date().toISOString(),
      scores: {
        trust: Math.floor(Math.random() * 30) + 70, // 70-100
        schema: Math.floor(Math.random() * 25) + 60, // 60-85
        zeroClick: Math.floor(Math.random() * 20) + 40, // 40-60
        freshness: Math.floor(Math.random() * 30) + 55, // 55-85
      },
      mentions: {
        chatgpt: Math.random() > 0.3,
        perplexity: Math.random() > 0.4,
        gemini: Math.random() > 0.5,
        google_ai: Math.random() > 0.3,
      },
      insights: [
        'Schema coverage is incomplete',
        'Content freshness needs attention',
        'Zero-click visibility below industry average',
      ],
      // Require sign-in for full report
      requiresAuth: true,
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(preview, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Scan failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/scan/quick',
    version: '1.0.0',
  });
}

