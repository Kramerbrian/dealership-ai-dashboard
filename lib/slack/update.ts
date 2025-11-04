/**
 * Slack Message Update Utilities
 * Helper functions for updating Slack messages in real-time
 */

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const SLACK_API_URL = 'https://slack.com/api';

export interface SlackUpdatePayload {
  channel: string;
  ts: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
}

/**
 * Update an existing Slack message in-place
 * @param payload - Update payload with channel, ts, and content
 * @returns Success status
 */
export async function updateSlackMessage(
  payload: SlackUpdatePayload
): Promise<boolean> {
  if (!SLACK_BOT_TOKEN) {
    console.error('SLACK_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(`${SLACK_API_URL}/chat.update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack update error:', data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating Slack message:', error);
    return false;
  }
}

/**
 * Format task status message
 */
export function formatTaskStatusMessage(
  task: string,
  dealer: string,
  status: 'running' | 'completed' | 'failed',
  details?: {
    progress?: number;
    error?: string;
    taskId?: string;
    grafanaUrl?: string;
  }
): string {
  const statusEmoji = {
    running: '⚙️',
    completed: '✅',
    failed: '❌',
  };

  const statusText = {
    running: 'running',
    completed: 'completed successfully',
    failed: 'failed',
  };

  let message = `${statusEmoji[status]} Task *${task}* ${statusText[status]} for *${dealer}*`;

  if (status === 'running' && details?.progress !== undefined) {
    message += ` (${details.progress}%)`;
  }

  if (status === 'failed' && details?.error) {
    message += `\n_Error: ${details.error}_`;
  }

  if (status === 'completed' && details?.taskId) {
    message += `\n_Task ID: ${details.taskId}_`;
  }

  if (status === 'completed' && details?.grafanaUrl) {
    message += `\n<${details.grafanaUrl}|View in Grafana →>`;
  }

  return message;
}

/**
 * Create rich message blocks for task status
 */
export function createTaskStatusBlocks(
  task: string,
  dealer: string,
  status: 'running' | 'completed' | 'failed',
  details?: {
    progress?: number;
    error?: string;
    taskId?: string;
    grafanaUrl?: string;
  }
): any[] {
  const blocks: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: formatTaskStatusMessage(task, dealer, status, details),
      },
    },
  ];

  // Add progress bar if running
  if (status === 'running' && details?.progress !== undefined) {
    const filled = Math.floor(details.progress / 10);
    const empty = 10 - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `\`${progressBar}\` ${details.progress}%`,
      },
    });
  }

  // Add action buttons if failed
  if (status === 'failed') {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Retry Task',
            emoji: true,
          },
          style: 'primary',
          value: JSON.stringify({ dealer, action: task, retry: true }),
          action_id: 'retry_task',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Logs',
            emoji: true,
          },
          url: details?.grafanaUrl || 'https://grafana.dealershipai.com',
          action_id: 'view_logs',
        },
      ],
    });
  }

  // Add Grafana link if completed
  if (status === 'completed' && details?.grafanaUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${details.grafanaUrl}|View latest metrics in Grafana →>`,
      },
    });
  }

  return blocks;
}

