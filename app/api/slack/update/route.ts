import { NextRequest, NextResponse } from 'next/server';
import { updateSlackMessage, formatTaskStatusMessage, createTaskStatusBlocks } from '@/lib/slack/update';
import { logger } from '@/lib/logger';
import { errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/**
 * POST /api/slack/update
 * Update a Slack message with task status
 * 
 * Expected body:
 * {
 *   channel: string,
 *   ts: string,
 *   status: 'running' | 'completed' | 'failed',
 *   task: string,
 *   dealer: string,
 *   progress?: number,
 *   error?: string,
 *   taskId?: string,
 *   grafanaUrl?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, ts, status, task, dealer, progress, error, taskId, grafanaUrl } = body;

    // Validate required fields
    if (!channel || !ts || !status || !task || !dealer) {
      return errorResponse('Missing required fields: channel, ts, status, task, dealer', 400);
    }

    // Validate status
    if (!['running', 'completed', 'failed'].includes(status)) {
      return errorResponse('Invalid status. Must be: running, completed, or failed', 400);
    }

    await logger.info('Slack message update requested', {
      channel,
      ts,
      status,
      task,
      dealer,
      progress,
      taskId,
    });

    // Format message and blocks
    const text = formatTaskStatusMessage(task, dealer, status, {
      progress,
      error,
      taskId,
      grafanaUrl,
    });

    const blocks = createTaskStatusBlocks(task, dealer, status, {
      progress,
      error,
      taskId,
      grafanaUrl,
    });

    // Update Slack message
    const success = await updateSlackMessage({
      channel,
      ts,
      text,
      blocks,
    });

    if (!success) {
      return errorResponse('Failed to update Slack message', 500);
    }

    return NextResponse.json({
      success: true,
      message: 'Slack message updated',
    });
  } catch (error) {
    await logger.error('Slack update API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse('Failed to update Slack message', 500);
  }
}
