/**
 * Test Mapbox API Token
 * Verifies Mapbox token is accessible in both client and server contexts
 */

import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const GET = createPublicRoute(async () => {
  const serverToken = process.env.MAPBOX_ACCESS_TOKEN;
  const clientToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return NextResponse.json({
    ok: true,
    tokens: {
      server: {
        configured: !!serverToken,
        length: serverToken?.length || 0,
        preview: serverToken ? `${serverToken.substring(0, 10)}...` : 'not set',
      },
      client: {
        configured: !!clientToken,
        length: clientToken?.length || 0,
        preview: clientToken ? `${clientToken.substring(0, 10)}...` : 'not set',
      },
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

