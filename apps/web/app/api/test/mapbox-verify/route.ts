/**
 * Verify Mapbox API Token
 * Tests the token by making a real API call to Mapbox
 */

import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const GET = createPublicRoute(async () => {
  const token = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      ok: false,
      error: 'Mapbox token not configured',
    }, { status: 503 });
  }

  try {
    // Test token by calling Mapbox Token API
    const response = await fetch(`https://api.mapbox.com/tokens/v2?access_token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        ok: true,
        tokenValid: true,
        tokenType: token.startsWith('pk.') ? 'public' : token.startsWith('sk.') ? 'secret' : 'unknown',
        tokenPreview: `${token.substring(0, 15)}...`,
        mapboxResponse: {
          code: data.code || 'success',
          scopes: data.scopes || [],
        },
        message: 'Token is valid and working',
      });
    } else {
      return NextResponse.json({
        ok: false,
        tokenValid: false,
        error: data.message || 'Token validation failed',
        status: response.status,
      }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      tokenValid: false,
      error: error.message || 'Failed to verify token',
    }, { status: 500 });
  }
});

