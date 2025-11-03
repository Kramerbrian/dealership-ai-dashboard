/**
 * POST /api/automation/tasks/:id/execute
 * 
 * Executes an approved automation task
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
    
    // Fetch task
    const task = await prisma.automationTask.findUnique({
      where: { id },
    });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    if (!['APPROVED', 'PENDING'].includes(task.status)) {
      return NextResponse.json(
        { error: 'Task must be APPROVED or PENDING to execute' },
        { status: 400 }
      );
    }
    
    try {
      // Execute based on task kind
      if (task.kind === 'PRICE') {
        // TODO: Integrate with pricing API
        // await applyPriceChange(task.dealerId!, task.modelId!, task.payload.recommendedOtd);
        console.log('[Automation] Executing PRICE task:', task.id);
      } else if (task.kind === 'ADS') {
        // TODO: Integrate with ads API
        // await refreshAds(task.payload.campaigns);
        console.log('[Automation] Executing ADS task:', task.id);
      } else if (task.kind === 'NOTIFY') {
        // TODO: Send notification
        // await sendNotification(task.payload.channel, task.payload.message);
        console.log('[Automation] Executing NOTIFY task:', task.id);
      }
      
      // Mark as executed
      const executed = await prisma.automationTask.update({
        where: { id },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
        },
      });
      
      return NextResponse.json({ ok: true, task: executed });
    } catch (execError: any) {
      // Mark as failed
      const failed = await prisma.automationTask.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: execError.message || String(execError),
        },
      });
      
      return NextResponse.json(
        { ok: false, task: failed, error: execError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Automation Tasks] Execute error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute task' },
      { status: 500 }
    );
  }
}
