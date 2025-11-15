/**
 * AI Scores API - DealershipAI API Specification
 * GET /api/ai-scores?origin=https://dealer.com
 * 
 * Aligns with ai_scores_get endpoint from orchestration spec
 * Returns composite AI Visibility, Zero-Click, UGC, and platform breakdown metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';
import { validateUrl } from '@/lib/security/url-validation';
import { rateLimit, getClientIP } from '@/lib/security/rate-limit';

export const runtime = 'edge';

const FLEET_API_BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || 'https://api.gpt.dealershipai.com';
const X_API_KEY = process.env.X_API_KEY || '';

// Type definitions matching the API specification
interface PlatformBreakdown {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot' | 'grok';
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AIVATIComposite {
  AIV: number; // Algorithmic Visibility Index
  ATI: number; // Algorithmic Trust Index
  CRS: number; // Citation Relevance Score
}

interface KPIScoreboard {
  QAI_star: number;
  VAI_Penalized: number;
  PIQR: number;
  HRP: number;
  OCI: number;
}

interface AiScoresResponse {
  dealerId: string;
  timestamp: string;
  model_version: string;
  kpi_scoreboard: KPIScoreboard;
  platform_breakdown: PlatformBreakdown[];
  zero_click_inclusion_rate: number;
  ugc_health_score: number;
  aivati_composite: AIVATIComposite;
}

export async function GET(req: NextRequest) {
  // Rate limiting: 15 requests per minute per IP
  const clientIP = getClientIP(req);
  const rateLimitResult = await rateLimit(clientIP, 15, 60);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        },
      }
    );
  }

  // Get and validate origin parameter (required per spec)
  const originInput = req.nextUrl.searchParams.get('origin') || undefined || '';
  
  if (!originInput) {
    return NextResponse.json(
      { ok: false, error: 'origin parameter is required. Example: ?origin=https://dealer.com' },
      { status: 400 }
    );
  }

  // Validate URL with SSRF protection
  const urlValidation = validateUrl(originInput);
  if (!urlValidation.valid || !urlValidation.url) {
    return NextResponse.json(
      { ok: false, error: urlValidation.error || 'Invalid URL format' },
      { status: 400 }
    );
  }

  const origin = urlValidation.url;
  const dealerId = req.nextUrl.searchParams.get('dealerId') || undefined || '';
  const cacheKey = `ai-scores:${dealerId || origin}`;

  // Check cache first (3-minute TTL)
  const cached = await cacheGet<AiScoresResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-RateLimit-Limit': '15',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        'X-Cache': 'HIT',
      },
    });
  }

  // Proxy to DealershipAI API (api.gpt.dealershipai.com)
  const url = new URL('/api/ai-scores', FLEET_API_BASE);
  url.searchParams.set('origin', origin);
  if (dealerId) url.searchParams.set('dealerId', dealerId);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': X_API_KEY,
        'x-dai-agent': 'plg-proxy',
        'X-Orchestrator-Role': 'AI_CSO',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: AiScoresResponse = await response.json();
    
    // Validate response structure matches specification
    if (!data.kpi_scoreboard || !data.platform_breakdown || !data.aivati_composite) {
      return NextResponse.json(
        { ok: false, error: 'Invalid response format from upstream API' },
        { status: 502 }
      );
    }
    
    // Cache response for 3 minutes
    await cacheSet(cacheKey, data, 180);
    
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '15',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        'X-Cache': 'MISS',
        'X-Model-Version': data.model_version || 'unknown',
      },
    });
  } catch (error: any) {
    console.error('AI scores proxy error:', error);
    return NextResponse.json(
      { ok: false, error: 'Proxy failed', details: error.message },
      { status: 500 }
    );
  }
}
