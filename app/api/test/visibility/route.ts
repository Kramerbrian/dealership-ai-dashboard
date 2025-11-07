import { NextResponse } from 'next/server';

/**
 * Development-only test endpoint for visibility/presence
 * Does NOT require authentication - returns synthetic data
 * 
 * ⚠️ Remove or protect this in production!
 */
export async function GET(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || 'example.com';

    // Synthetic data for testing
    const data = {
      domain,
      engines: [
        { name: 'ChatGPT' as const, presencePct: 89 },
        { name: 'Perplexity' as const, presencePct: 78 },
        { name: 'Gemini' as const, presencePct: 72 },
        { name: 'Copilot' as const, presencePct: 64 },
      ],
      lastCheckedISO: new Date().toISOString(),
      connected: false, // Marked as not connected since it's test data
      _note: 'This is test data. Use /api/visibility/presence for production with authentication.'
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Test-Endpoint': 'true'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Test failed' },
      { status: 500 }
    );
  }
}

