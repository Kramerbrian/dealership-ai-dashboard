/**
 * Individual Automation Task API
 * 
 * GET, PATCH, DELETE for specific tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTaskById,
  approveTask,
  rejectTask,
  markTaskExecuted,
  markTaskFailed,
} from '@/lib/services/automationTaskService';

/**
 * GET /api/automation-tasks/[id]
 * Get a specific task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await getTaskById(params.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });

  } catch (error: any) {
    console.error('[Automation Task API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation-tasks/[id]/approve
 * Approve a task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const body = await req.json();

    const taskId = params.id;
    const approvedBy = body.approvedBy || 'system';

    let task;

    switch (action) {
      case 'approve':
        task = await approveTask(taskId, approvedBy);
        break;
      case 'reject':
        task = await rejectTask(taskId, approvedBy, body.reason);
        break;
      case 'execute':
        task = await markTaskExecuted(taskId);
        break;
      case 'fail':
        task = await markTaskFailed(taskId, body.error || 'Unknown error');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, execute, fail' },
          { status: 400 }
        );
    }

    return NextResponse.json({ task });

  } catch (error: any) {
    console.error('[Automation Task API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update task', message: error.message },
      { status: 500 }
    );
  }
}

