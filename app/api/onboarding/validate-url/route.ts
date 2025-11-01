import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/onboarding/validate-url
 * Validates dealership URL for onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Parse and validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { valid: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Basic validation
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      return NextResponse.json(
        { valid: false, error: 'Invalid domain name' },
        { status: 400 }
      );
    }

    // Check if domain is already in system (optional - check database)
    // For now, just validate format and reachability

    // Check if domain is reachable (optional server-side check)
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'DealershipAI/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok && response.status >= 400) {
        return NextResponse.json(
          { valid: false, error: 'Domain returned an error (check URL)' },
          { status: 400 }
        );
      }
    } catch (fetchError) {
      // If fetch fails, still allow it (might be CORS or network issue)
      // The client-side validation will catch actual issues
      console.warn('Could not verify URL reachability:', fetchError);
    }

    return NextResponse.json({
      valid: true,
      url: parsedUrl.toString(),
      domain: parsedUrl.hostname,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('URL validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }
}
