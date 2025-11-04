/**
 * POST /api/automation/tasks/:id/reject
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { prisma } from '@/lib/prisma';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Resolve params if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  return createApiRoute(
    {
      endpoint: `/api/automation/tasks/${id}/reject`,
      requireAuth: true,
      rateLimit: true,
      performanceMonitoring: true,
    },
    async (req, auth) => {
      const requestId = req.headers.get('x-request-id') || 'unknown';
      
      try {
        await logger.info('Rejecting automation task', {
          requestId,
          taskId: id,
          userId: auth.userId,
        });
        
        const task = await prisma.automationTask.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approvedAt: new Date(),
            approvedBy: auth.userId,
          },
        });
        
        await logger.info('Automation task rejected successfully', {
          requestId,
          taskId: id,
          userId: auth.userId,
        });
        
        return noCacheResponse({
          success: true,
          ok: true,
          task
        });
      } catch (error: any) {
        await logger.error('Automation task reject error', {
          requestId,
          taskId: id,
          userId: auth.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          prismaCode: error.code,
        });
        
        if (error.code === 'P2025') {
          return NextResponse.json(
            {
              success: false,
              error: 'Task not found',
            },
            { status: 404 }
          );
        }
        
        return errorResponse(error, 500, {
          requestId,
          endpoint: `/api/automation/tasks/${id}/reject`,
          userId: auth.userId,
        });
      }
    }
  )(req);
}
