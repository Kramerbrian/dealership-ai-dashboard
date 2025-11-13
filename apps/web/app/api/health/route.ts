/**
 * GET /api/health
 * Healthcheck endpoint to verify landing + clarity API are reachable
 * 
 * Returns:
 * - ok: boolean (overall status)
 * - checks: object with env vars and API status
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
  const checks: Record<string, any> = {};
  let ok = true;

  // Check env vars
  const mapboxKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const clerkPub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  checks.env = {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: !!mapboxKey,
    NEXT_PUBLIC_MAPBOX_KEY: !!mapboxKey, // legacy support
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!clerkPub,
    CLERK_SECRET_KEY: !!clerkSecret,
    NEXT_PUBLIC_BASE_URL: !!baseUrl,
  };

  // Check if critical env vars are missing
  if (!clerkPub || !clerkSecret) {
    ok = false;
    checks.env._critical_missing = 'Clerk keys required for /dash';
  }

  // Check clarity API (if it exists)
  try {
    const clarityUrl = baseUrl 
      ? `${baseUrl}/api/clarity/stack?domain=exampledealer.com`
      : '/api/clarity/stack?domain=exampledealer.com';
    
    const res = await fetch(clarityUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Fallback to relative URL if baseUrl fetch fails
      return fetch('/api/clarity/stack?domain=exampledealer.com', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    if (!res.ok) {
      ok = false;
      checks.clarity = { 
        ok: false, 
        status: res.status,
        statusText: res.statusText,
        note: 'Clarity API endpoint may not exist or is broken'
      };
    } else {
      const data = await res.json().catch(() => ({}));
      checks.clarity = {
        ok: true,
        status: res.status,
        hasScores: !!data?.scores,
        hasLocation: !!data?.location,
        hasIntros: !!(data?.ai_intro_current && data?.ai_intro_improved),
        responseKeys: Object.keys(data || {}),
      };
    }
  } catch (err: any) {
    // Clarity API doesn't exist or is unreachable - this is OK for basic healthcheck
    checks.clarity = { 
      ok: false, 
      error: String(err?.message || err),
      note: 'Clarity API endpoint may not be implemented yet'
    };
    // Don't fail overall healthcheck if clarity API is missing
  }

  // Check trust scan endpoints (if they exist)
  try {
    const trustUrl = baseUrl
      ? `${baseUrl}/api/trust/scan/lite`
      : '/api/trust/scan/lite';
    
    const res = await fetch(trustUrl, {
      method: 'HEAD',
      cache: 'no-store',
    }).catch(() => {
      return fetch('/api/trust/scan/lite', {
        method: 'HEAD',
        cache: 'no-store',
      });
    });

    checks.trust_api = {
      exists: res.ok || res.status === 405, // 405 = method not allowed but endpoint exists
      status: res.status,
    };
  } catch (err: any) {
    checks.trust_api = {
      exists: false,
      error: String(err?.message || err),
    };
  }

  // Check assistant API (if it exists)
  try {
    const assistantUrl = baseUrl
      ? `${baseUrl}/api/assistant`
      : '/api/assistant';
    
    const res = await fetch(assistantUrl, {
      method: 'HEAD',
      cache: 'no-store',
    }).catch(() => {
      return fetch('/api/assistant', {
        method: 'HEAD',
        cache: 'no-store',
      });
    });

    checks.assistant_api = {
      exists: res.ok || res.status === 405,
      status: res.status,
    };
  } catch (err: any) {
    checks.assistant_api = {
      exists: false,
      error: String(err?.message || err),
    };
  }

  const status = ok ? 200 : 500;
  return NextResponse.json(
    { 
      ok, 
      checks,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    { status }
  );
}
