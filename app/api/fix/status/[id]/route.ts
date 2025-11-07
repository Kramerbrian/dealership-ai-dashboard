import { NextRequest, NextResponse } from 'next/server';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fix/status/:id
 * 
 * Get current status of a fix receipt (for polling)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const receiptId = params.id;

    // TODO: Load from database
    // For now, return synthetic data
    // In production, this would query your receipts table:
    // const receipt = await db.receipts.findOne({ id: receiptId, tenant_id: isolation.tenantId });

    // Simulate pending → finalized transition
    const isFinalized = Math.random() > 0.3; // 70% chance of being finalized

    return NextResponse.json({
      id: receiptId,
      deltaUSD: isFinalized ? Math.floor(Math.random() * 10000) + 2000 : undefined,
      undone: false,
      finalized: isFinalized,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Fix status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
