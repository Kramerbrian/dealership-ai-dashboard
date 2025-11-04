/**
 * Slack Message Update Service
 * 
 * Updates existing Slack messages using the chat.update API
 */

interface SlackUpdateOptions {
  text?: string;
  blocks?: any[];
}

/**
 * Update a Slack message using chat.update
 * 
 * @param channel - Slack channel ID (e.g., "C12345")
 * @param ts - Message timestamp (e.g., "1698800172.000200")
 * @param text - Message text (legacy format)
 * @param blocks - Slack Block Kit blocks (preferred)
 */
export async function updateSlackMessage(
  channel: string,
  ts: string,
  text?: string,
  blocks?: any[]
): Promise<boolean> {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  
  if (!slackToken) {
    console.warn('[Slack Update] SLACK_BOT_TOKEN not configured');
    return false;
  }

  try {
    const payload: any = {
      channel,
      ts,
    };

    // Use Block Kit if provided, otherwise use text
    if (blocks && blocks.length > 0) {
      payload.blocks = blocks;
    } else if (text) {
      payload.text = text;
    } else {
      console.warn('[Slack Update] No text or blocks provided');
      return false;
    }

    const response = await fetch('https://slack.com/api/chat.update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[Slack Update] API error:', data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Slack Update] Failed to update message:', error);
    return false;
  }
}

/**
 * Generate a progress bar for Slack messages
 */
export function generateProgressBar(progress: number): string {
  const filled = Math.floor(progress / 10);
  const empty = 10 - filled;
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${progress}%`;
}

/**
 * Calculate ETA based on progress and elapsed time
 */
export function calculateETA(progress: number, elapsedSeconds: number): string {
  if (progress <= 0 || progress >= 100) {
    return '';
  }

  const remainingProgress = 100 - progress;
  const secondsPerPercent = elapsedSeconds / progress;
  const remainingSeconds = Math.round(remainingProgress * secondsPerPercent);

  if (remainingSeconds < 60) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds < 3600) {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

