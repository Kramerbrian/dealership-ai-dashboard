/**
 * Refresh Single Origin API
 * POST endpoint to trigger refresh for a specific origin
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const KEY = process.env.X_API_KEY || '';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');

  if (!origin) {
    return NextResponse.json({ ok: false, error: 'origin parameter required' }, { status: 400 });
  }

  if (!BASE) {
    return NextResponse.json({ ok: false, error: 'FLEET_API_BASE not set' }, { status: 500 });
  }

  try {
    const url = new URL('/api/refresh', BASE);
    url.searchParams.set('origin', origin);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'X-Orchestrator-Role': 'AI_CSO',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { ok: false, error: `upstream ${response.status}: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

