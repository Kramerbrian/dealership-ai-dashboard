/**
 * AI Scores API Proxy - PLG Widget Endpoint
 * Proxies to fleet API with Redis caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';
import type { AiScoresResponse } from '@/lib/types/AiScores';

export const runtime = 'edge';

const FLEET_API_BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const X_API_KEY = process.env.X_API_KEY || '';

function normOrigin(origin?: string): string {
  if (!origin) return '';
  try {
    const u = new URL(origin);
    return u.origin;
  } catch {
    return origin || '';
  }
}

export async function GET(req: NextRequest) {
  const origin = normOrigin(
    req.nextUrl.searchParams.get('origin') || req.nextUrl.searchParams.get('domain') || ''
  );
  const dealerId = req.nextUrl.searchParams.get('dealerId') || '';
  const cacheKey = `ai-scores:${dealerId || origin}`;

  // Check cache first
  const cached = await cacheGet<AiScoresResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // If no fleet API configured, return error
  if (!FLEET_API_BASE) {
    return NextResponse.json({ ok: false, error: 'FLEET_API_BASE not set' }, { status: 500 });
  }

  // Proxy to fleet API
  const url = new URL('/api/ai-scores', FLEET_API_BASE);
  if (origin) url.searchParams.set('origin', origin);
  if (dealerId) url.searchParams.set('dealerId', dealerId);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': X_API_KEY,
        'x-dai-agent': 'plg-proxy',
        'X-Orchestrator-Role': 'AI_CSO',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Cache response for 3 minutes
    await cacheSet(cacheKey, data, 180);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI scores proxy error:', error);
    return NextResponse.json({ ok: false, error: 'Proxy failed' }, { status: 500 });
  }
}

