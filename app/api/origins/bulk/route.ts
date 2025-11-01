/**
 * Bulk Origins API - CSV/JSON Ingest
 * Proxies bulk origin uploads to fleet API
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const KEY = process.env.X_API_KEY || '';

export async function POST(req: NextRequest) {
  if (!BASE) {
    return NextResponse.json({ ok: false, error: 'FLEET_API_BASE not set' }, { status: 500 });
  }

  try {
    const body = await req.text();
    
    const response = await fetch(new URL('/api/origins/bulk', BASE).toString(), {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'content-type': 'application/json',
        'X-Orchestrator-Role': 'AI_CSO',
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Bulk origins error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

