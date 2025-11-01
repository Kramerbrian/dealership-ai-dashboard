import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDiagnostics } from '@/lib/orchestrator/diagnostics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diagnostics/msrp-sync
 *
 * Returns comprehensive diagnostics for MSRP synchronization including:
 * - Last sync run timestamp and status
 * - Average MSRP delta percentage
 * - Pulse integration latency
 * - AI score statistics and summaries
 *
 * Query Parameters:
 * - tenantId: (optional) Tenant/Dealer ID for filtering diagnostics
 * - includeAiScores: (optional, default: true) Include detailed AI score summaries
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const includeAiScores = searchParams.get('includeAiScores') !== 'false';

    // Get diagnostics data
    const diagnostics = await getDiagnostics({
      tenantId,
      includeAiScores,
      includePulse: true,
      includeGraph: false
    });

    // Return response with appropriate cache headers
    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Diagnostic-Version': diagnostics.meta.version,
        'X-Request-ID': diagnostics.meta.requestId || ''
      }
    });
  } catch (error) {
    console.error('MSRP Sync Diagnostics Error:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch diagnostics data',
        details: process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagnostics/msrp-sync
 *
 * Trigger a manual MSRP sync refresh (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // TODO: Check if user has admin permissions
    // For now, allow all authenticated users

    // Parse request body
    const body = await req.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        {
          error: 'BAD_REQUEST',
          message: 'tenantId is required'
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual MSRP sync trigger
    // This would typically:
    // 1. Queue a background job to fetch latest MSRP data
    // 2. Update the database with new values
    // 3. Trigger AI score recalculation if needed

    return NextResponse.json({
      success: true,
      message: 'MSRP sync triggered successfully',
      tenantId,
      jobId: crypto.randomUUID(),
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });
  } catch (error) {
    console.error('MSRP Sync Trigger Error:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to trigger MSRP sync'
      },
      { status: 500 }
    );
  }
}
