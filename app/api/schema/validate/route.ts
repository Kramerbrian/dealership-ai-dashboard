import { NextRequest, NextResponse } from 'next/server';

// Proxies to your dAI Schema Engine — set SCHEMA_ENGINE_URL
export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url');
  const base = process.env.SCHEMA_ENGINE_URL;

  if (!base) {
    return NextResponse.json({
      coverage: 0.76,
      errors: ['Proxy not configured: SCHEMA_ENGINE_URL missing']
    });
  }

  try {
    const r = await fetch(`${base.replace(/\/$/, '')}/validate?url=${encodeURIComponent(url || '')}`, {
      cache: 'no-store'
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ coverage: 0.0, errors: [e.message] }, { status: 502 });
  }
}
