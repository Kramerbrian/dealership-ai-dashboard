export async function postToSlack(text: string) {
  if (!process.env.SLACK_WEBHOOK_RAR) {
    return;
  }

  try {
    await fetch(process.env.SLACK_WEBHOOK_RAR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error('Slack webhook error:', error);
    // Don't throw - Slack failures shouldn't break the flow
  }
}

