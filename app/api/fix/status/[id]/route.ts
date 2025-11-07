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

    // Load from database
    const { getReceipt } = await import('@/lib/db/receipts');
    const receipt = await getReceipt(receiptId, isolation.tenantId);

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: receipt.id,
      deltaUSD: receipt.delta_usd,
      undone: receipt.undone,
      finalized: receipt.finalized,
      timestamp: receipt.updated_at
    });
  } catch (error: any) {
    console.error('Fix status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
