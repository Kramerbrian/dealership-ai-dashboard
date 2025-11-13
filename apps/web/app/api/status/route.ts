/**
 * Status Ping Endpoint
 * Health check for fleet agent service
 */

import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const runtime = 'edge';

export const GET = createPublicRoute(async () => {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    service: 'dealershipAI_fleet_agent',
    version: '3.0.0',
    platform: process.env.PLATFORM_MODE || 'CognitiveOps',
  });
});

