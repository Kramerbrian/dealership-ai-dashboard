import { NextResponse } from 'next/server';

/**
 * DealershipAI Orchestrator 3.4 — Theme API Endpoint
 * Returns a dealership's theme configuration (light/dark + brand colors).
 * 
 * Environment vars:
 *   THEME_API_KEY   — secure API key for Orchestrator theme fetch
 *   ORCHESTRATOR_URL — base URL for DealershipAI Orchestrator Cloud
 */

export const runtime = 'edge'; // Use Vercel Edge for low latency

export async function GET(
  req: Request,
  { params }: { params: { dealerId: string } }
) {
  const { dealerId } = params;
  const orchestratorUrl =
    process.env.ORCHESTRATOR_URL || 'https://api.dealershipai.cloud';
  const apiKey = process.env.THEME_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Missing THEME_API_KEY environment variable',
        mode: 'system',
        palette: {
          primary: '#1b75bb',
          accent: '#00c896',
          light: '#ffffff',
          dark: '#101820',
        },
        source: 'fallback',
      },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`${orchestratorUrl}/v1/theme/${dealerId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Fallback theme (blue/teal default)
      return NextResponse.json({
        mode: 'system',
        palette: {
          primary: '#1b75bb',
          accent: '#00c896',
          light: '#ffffff',
          dark: '#101820',
        },
        borderRadius: '8px',
        font: {
          family: 'Inter, Helvetica, Arial, sans-serif',
        },
        source: 'fallback',
      });
    }

    const themeData = await res.json();
    return NextResponse.json(themeData);
  } catch (err) {
    console.error('[Theme API] Fetch error:', err);
    return NextResponse.json(
      {
        error: 'Theme fetch error',
        mode: 'system',
        palette: {
          primary: '#1b75bb',
          accent: '#00c896',
          light: '#ffffff',
          dark: '#101820',
        },
        borderRadius: '8px',
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
