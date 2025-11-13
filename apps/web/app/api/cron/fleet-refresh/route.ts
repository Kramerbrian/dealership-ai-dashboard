/**
 * Fleet Refresh Cron Job
 * Scheduled job to refresh all fleet rooftops
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const KEY = process.env.CRON_SECRET || '';
const UP = process.env.X_API_KEY || '';

async function listOrigins(): Promise<any[]> {
  if (!BASE || !UP) return [];
  
  try {
    const url = new URL('/api/origins', BASE);
    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': UP,
        'X-Orchestrator-Role': 'AI_CSO',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to list origins:', response.status);
      return [];
    }

    const data = await response.json();
    return data?.origins || [];
  } catch (error) {
    console.error('Error listing origins:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${KEY}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!BASE) {
    return NextResponse.json({ ok: false, error: 'FLEET_API_BASE not set' }, { status: 500 });
  }

  const origins = await listOrigins();
  let queued = 0;
  const errors: string[] = [];

  // Queue refresh for each origin
  for (const origin of origins) {
    try {
      const url = new URL('/api/refresh', BASE);
      url.searchParams.set('origin', origin.origin || origin);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'x-api-key': UP,
          'X-Orchestrator-Role': 'AI_CSO',
        },
      });

      if (!response.ok) {
        errors.push(`${origin.origin || origin}: ${response.status}`);
      } else {
        queued++;
      }
    } catch (error: any) {
      errors.push(`${origin.origin || origin}: ${error.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    queued,
    total: origins.length,
    errors: errors.length > 0 ? errors : undefined,
    when: new Date().toISOString(),
  });
}

