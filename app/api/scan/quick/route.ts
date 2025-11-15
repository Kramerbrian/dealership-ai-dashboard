import { NextRequest, NextResponse } from 'next/server';
import { validateUrl, extractDomain } from '@/lib/security/url-validation';
import { rateLimit, getClientIP } from '@/lib/security/rate-limit';
import { z } from 'zod';

/**
 * Ultra-lean quick scan endpoint
 * Returns preview data without requiring auth
 * Enhanced with URL validation and rate limiting
 * 
 * ⚠️ DEPRECATED: This endpoint may be unused. Consider using /api/clarity/stack instead.
 * Will be removed in a future version if no active usage is found.
 */
export async function POST(req: NextRequest) {
  try {
    // CSRF protection: Validate Origin header
    const { validateCSRF } = await import('@/lib/security/csrf');
    const csrfValidation = validateCSRF(req);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: csrfValidation.error || 'CSRF validation failed' },
        { status: 403 }
      );
    }

    // Rate limiting: 10 requests per minute per IP
    const clientIP = getClientIP(req);
    const rateLimitResult = await rateLimit(clientIP, 10, 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const urlSchema = z.object({
      url: z.string().min(1, 'URL is required').max(2048, 'URL is too long'),
    });

    const validation = urlSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Validate URL with SSRF protection
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error || 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Extract domain from validated URL
    const domain = extractDomain(urlValidation.url!);
    if (!domain) {
      return NextResponse.json(
        { error: 'Could not extract domain from URL' },
        { status: 400 }
      );
    }

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
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
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

