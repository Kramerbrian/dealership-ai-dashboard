/**
 * Automation Task Service
 * 
 * Handles automation tasks for PRICE, ADS, and NOTIFY operations
 * with approval workflow support
 */

import { prisma } from '@/lib/prisma';

export type AutomationTaskKind = 'PRICE' | 'ADS' | 'NOTIFY';
export type AutomationTaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

export interface CreateAutomationTaskInput {
  kind: AutomationTaskKind;
  dealerId?: string;
  modelId?: string;
  payload: Record<string, any>;
  requiresApproval?: boolean;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: AutomationTaskStatus;
  approvedBy?: string;
  error?: string;
}

/**
 * Create a new automation task
 */
export async function createAutomationTask(input: CreateAutomationTaskInput) {
  return await prisma.automationTask.create({
    data: {
      kind: input.kind,
      dealerId: input.dealerId || null,
      modelId: input.modelId || null,
      payload: input.payload,
      requiresApproval: input.requiresApproval ?? true,
      status: 'PENDING',
    },
  });
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(
  status: AutomationTaskStatus,
  limit: number = 50
) {
  return await prisma.automationTask.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get tasks by dealer
 */
export async function getTasksByDealer(dealerId: string) {
  return await prisma.automationTask.findMany({
    where: { dealerId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get pending tasks requiring approval
 */
export async function getPendingApprovalTasks(limit: number = 50) {
  return await prisma.automationTask.findMany({
    where: {
      status: 'PENDING',
      requiresApproval: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Approve a task
 */
export async function approveTask(taskId: string, approvedBy: string) {
  return await prisma.automationTask.update({
    where: { id: taskId },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    },
  });
}

/**
 * Reject a task
 */
export async function rejectTask(taskId: string, approvedBy: string, reason?: string) {
  return await prisma.automationTask.update({
    where: { id: taskId },
    data: {
      status: 'REJECTED',
      approvedBy,
      approvedAt: new Date(),
      error: reason || null,
    },
  });
}

/**
 * Mark task as executed
 */
export async function markTaskExecuted(taskId: string) {
  return await prisma.automationTask.update({
    where: { id: taskId },
    data: {
      status: 'EXECUTED',
      executedAt: new Date(),
    },
  });
}

/**
 * Mark task as failed
 */
export async function markTaskFailed(taskId: string, error: string) {
  return await prisma.automationTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      executedAt: new Date(),
      error,
    },
  });
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string) {
  return await prisma.automationTask.findUnique({
    where: { id: taskId },
  });
}

/**
 * Update task status (generic)
 */
export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  const updateData: any = {
    status: input.status,
  };

  if (input.status === 'APPROVED' || input.status === 'REJECTED') {
    updateData.approvedBy = input.approvedBy;
    updateData.approvedAt = new Date();
  }

  if (input.status === 'EXECUTED' || input.status === 'FAILED') {
    updateData.executedAt = new Date();
  }

  if (input.error) {
    updateData.error = input.error;
  }

  return await prisma.automationTask.update({
    where: { id: input.taskId },
    data: updateData,
  });
}

/**
 * Get tasks by kind
 */
export async function getTasksByKind(
  kind: AutomationTaskKind,
  limit: number = 50
) {
  return await prisma.automationTask.findMany({
    where: { kind },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

