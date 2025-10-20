/**
 * Tenant-Specific AI Scores API
 * 
 * Provides AI scores for a specific tenant with RBAC enforcement
 * Requires proper authentication and tenant access permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { calculateDealershipAIScore, generateMockMetrics } from '@/lib/scoring/algorithm';
import { validateTenantAccess, createMockUserContext } from '@/lib/auth/rbac';
import type { KPIMetrics, ScoringResult } from '@/lib/scoring/algorithm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TenantScoreRequest {
  metrics?: Partial<KPIMetrics>;
  useMockData?: boolean;
}

/**
 * GET /api/tenants/[tenantId]/scores
 * Get AI scores for a specific tenant
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get authentication context
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create user context (in production, fetch from database)
    const userContext = createMockUserContext(
      sessionClaims?.metadata?.role || 'owner',
      sessionClaims?.metadata?.tenantId || tenantId
    );

    // Validate tenant access
    const accessCheck = validateTenantAccess(userContext, tenantId);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: 'Access denied', details: accessCheck.reason },
        { status: 403 }
      );
    }

    // Generate mock metrics for the tenant
    const metrics = generateMockMetrics(tenantId, `tenant-${tenantId}.com`);
    
    // Calculate scores
    const result: ScoringResult = calculateDealershipAIScore(metrics);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        tenantId,
        userId,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      },
    });

  } catch (error) {
    console.error('Tenant scores API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tenant scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/scores
 * Update AI scores for a specific tenant
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body: TenantScoreRequest = await req.json();
    const { metrics, useMockData = false } = body;
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get authentication context
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create user context
    const userContext = createMockUserContext(
      sessionClaims?.metadata?.role || 'owner',
      sessionClaims?.metadata?.tenantId || tenantId
    );

    // Validate tenant access and update permission
    const accessCheck = validateTenantAccess(userContext, tenantId);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: 'Access denied', details: accessCheck.reason },
        { status: 403 }
      );
    }

    // Generate or use provided metrics
    let kpiMetrics: KPIMetrics;
    if (useMockData || !metrics) {
      kpiMetrics = generateMockMetrics(tenantId, `tenant-${tenantId}.com`);
      if (metrics) {
        kpiMetrics = { ...kpiMetrics, ...metrics };
      }
    } else {
      kpiMetrics = metrics as KPIMetrics;
    }

    // Calculate updated scores
    const result: ScoringResult = calculateDealershipAIScore(kpiMetrics);

    // In production, save to database here
    // await saveTenantScores(tenantId, result);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        tenantId,
        userId,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        updated: true,
      },
    });

  } catch (error) {
    console.error('Tenant scores update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update tenant scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[tenantId]/scores
 * Delete AI scores for a specific tenant (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get authentication context
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create user context
    const userContext = createMockUserContext(
      sessionClaims?.metadata?.role || 'owner',
      sessionClaims?.metadata?.tenantId || tenantId
    );

    // Only superadmin can delete tenant data
    if (userContext.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Insufficient permissions - superadmin required' },
        { status: 403 }
      );
    }

    // Validate tenant access
    const accessCheck = validateTenantAccess(userContext, tenantId);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: 'Access denied', details: accessCheck.reason },
        { status: 403 }
      );
    }

    // In production, delete from database here
    // await deleteTenantScores(tenantId);

    return NextResponse.json({
      success: true,
      message: `Scores deleted for tenant ${tenantId}`,
      metadata: {
        tenantId,
        userId,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      },
    });

  } catch (error) {
    console.error('Tenant scores deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete tenant scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}