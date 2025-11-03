/**
 * POST /api/automation/tasks/:id/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = authResult.userId;
    
    const { id } = params;
    
    const task = await prisma.automationTask.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });
    
    return NextResponse.json({ ok: true, task });
  } catch (error: any) {
    console.error('[Automation Tasks] Reject error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to reject task' },
      { status: 500 }
    );
  }
}
