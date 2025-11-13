/**
 * Orchestrator Deployment Verification API
 * GET /api/orchestrator/deploy/verify
 * Verifies landing page deployment status
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyLandingPageDeployment } from '@/lib/ai/orchestrator';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('url') || undefined;

    const status = await verifyLandingPageDeployment(baseUrl);

    return NextResponse.json({
      success: true,
      ...status,
    }, { status: status.status === 'healthy' ? 200 : status.status === 'degraded' ? 206 : 500 });
  } catch (error) {
    console.error('Deployment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

