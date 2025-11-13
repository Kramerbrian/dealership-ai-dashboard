import { NextRequest, NextResponse } from 'next/server';
import { createEnhancedApiRoute } from '@/lib/api-enhanced-wrapper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = createEnhancedApiRoute(
  {
    endpoint: '/api/ai-visibility/consensus',
    requireAuth: false,
    rateLimit: { windowSeconds: 60, maxRequests: 100 },
    performanceMonitoring: true,
    methods: ['GET'],
  },
  async (req, auth) => {
    return { status: 'ok', message: 'Endpoint stub' };
  }
);

export const POST = createEnhancedApiRoute(
  {
    endpoint: '/api/ai-visibility/consensus',
    requireAuth: false,
    rateLimit: { windowSeconds: 60, maxRequests: 100 },
    performanceMonitoring: true,
    methods: ['POST'],
  },
  async (req, auth) => {
    return { status: 'ok', message: 'Endpoint stub' };
  }
);

