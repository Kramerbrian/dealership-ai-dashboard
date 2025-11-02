/**
 * App Approval Workflow
 * 
 * POST - Approve/reject app submission
 * Only accessible by admins
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin auth check
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await req.json();
    const { action, reviewedBy, rejectionReason } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || 'admin'
    };

    if (action === 'approve') {
      updateData.status = 'APPROVED';
    } else {
      updateData.status = 'REJECTED';
      updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const app = await prisma.marketplaceApp.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      app,
      message: `App ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error: any) {
    console.error('[Marketplace] Approve app error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process approval' },
      { status: 500 }
    );
  }
}

