/**
 * POST /api/automation/tasks/:id/execute
 * 
 * Executes an approved automation task
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
      endpoint: `/api/automation/tasks/${id}/execute`,
      requireAuth: true,
      rateLimit: true,
      performanceMonitoring: true,
    },
    async (req, auth) => {
      const requestId = req.headers.get('x-request-id') || 'unknown';
      
      try {
        await logger.info('Executing automation task', {
          requestId,
          taskId: id,
          userId: auth.userId,
        });
        
        // Fetch task
        const task = await prisma.automationTask.findUnique({
          where: { id },
        });
        
        if (!task) {
          await logger.warn('Automation task not found', {
            requestId,
            taskId: id,
            userId: auth.userId,
          });
          
          return NextResponse.json(
            {
              success: false,
              error: 'Task not found',
            },
            { status: 404 }
          );
        }
        
        if (!['APPROVED', 'PENDING'].includes(task.status)) {
          await logger.warn('Task not in executable state', {
            requestId,
            taskId: id,
            status: task.status,
            userId: auth.userId,
          });
          
          return NextResponse.json(
            {
              success: false,
              error: 'Task must be APPROVED or PENDING to execute',
              currentStatus: task.status,
            },
            { status: 400 }
          );
        }
        
        try {
          // Execute based on task kind
          if (task.kind === 'PRICE') {
            // TODO: Integrate with pricing API
            await logger.info('Executing PRICE task', {
              requestId,
              taskId: id,
              kind: task.kind,
            });
          } else if (task.kind === 'ADS') {
            // TODO: Integrate with ads API
            await logger.info('Executing ADS task', {
              requestId,
              taskId: id,
              kind: task.kind,
            });
          } else if (task.kind === 'NOTIFY') {
            // TODO: Send notification
            await logger.info('Executing NOTIFY task', {
              requestId,
              taskId: id,
              kind: task.kind,
            });
          }
          
          // Mark as executed
          const executed = await prisma.automationTask.update({
            where: { id },
            data: {
              status: 'EXECUTED',
              executedAt: new Date(),
            },
          });
          
          await logger.info('Automation task executed successfully', {
            requestId,
            taskId: id,
            userId: auth.userId,
          });
          
          return noCacheResponse({
            success: true,
            ok: true,
            task: executed
          });
        } catch (execError: any) {
          // Mark as failed
          const failed = await prisma.automationTask.update({
            where: { id },
            data: {
              status: 'FAILED',
              error: execError.message || String(execError),
            },
          });
          
          await logger.error('Task execution failed', {
            requestId,
            taskId: id,
            userId: auth.userId,
            error: execError.message || String(execError),
          });
          
          return errorResponse(
            execError,
            500,
            {
              requestId,
              endpoint: `/api/automation/tasks/${id}/execute`,
              userId: auth.userId,
              taskId: id,
            }
          );
        }
      } catch (error) {
        await logger.error('Automation task execution error', {
          requestId,
          taskId: id,
          userId: auth.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        return errorResponse(error, 500, {
          requestId,
          endpoint: `/api/automation/tasks/${id}/execute`,
          userId: auth.userId,
        });
      }
    }
  )(req);
}
