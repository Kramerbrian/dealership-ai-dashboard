/**
 * Automation Tasks API
 * 
 * REST API for managing automation tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAutomationTask,
  getTasksByStatus,
  getTasksByDealer,
  getPendingApprovalTasks,
  approveTask,
  rejectTask,
  markTaskExecuted,
  markTaskFailed,
  getTaskById,
  updateTaskStatus,
  getTasksByKind,
  type CreateAutomationTaskInput,
  type UpdateTaskStatusInput,
} from '@/lib/services/automationTaskService';

/**
 * GET /api/automation-tasks
 * Query tasks with filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const dealerId = searchParams.get('dealerId');
    const kind = searchParams.get('kind');
    const pending = searchParams.get('pending') === 'true';

    // Get pending approval tasks
    if (pending) {
      const tasks = await getPendingApprovalTasks();
      return NextResponse.json({ tasks });
    }

    // Get by status
    if (status) {
      const tasks = await getTasksByStatus(status as any);
      return NextResponse.json({ tasks });
    }

    // Get by dealer
    if (dealerId) {
      const tasks = await getTasksByDealer(dealerId);
      return NextResponse.json({ tasks });
    }

    // Get by kind
    if (kind) {
      const tasks = await getTasksByKind(kind as any);
      return NextResponse.json({ tasks });
    }

    // Default: return all pending
    const tasks = await getTasksByStatus('PENDING');
    return NextResponse.json({ tasks });

  } catch (error: any) {
    console.error('[Automation Tasks API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation-tasks
 * Create a new automation task
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateAutomationTaskInput = await req.json();
    
    if (!body.kind || !body.payload) {
      return NextResponse.json(
        { error: 'kind and payload are required' },
        { status: 400 }
      );
    }

    const task = await createAutomationTask(body);
    
    return NextResponse.json({ task }, { status: 201 });

  } catch (error: any) {
    console.error('[Automation Tasks API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create task', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automation-tasks/:id
 * Update task status
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateTaskStatusInput = await req.json();
    body.taskId = taskId;

    const task = await updateTaskStatus(body);
    
    return NextResponse.json({ task });

  } catch (error: any) {
    console.error('[Automation Tasks API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update task', message: error.message },
      { status: 500 }
    );
  }
}

