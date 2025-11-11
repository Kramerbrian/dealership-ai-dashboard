export async function postSlack(text: string, blocks?: any) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(blocks ? { blocks } : { text })
    });

    if (!res.ok) {
      console.error('Slack API error:', res.status, await res.text());
      return { ok: false, error: `Slack API returned ${res.status}` };
    }

    return { ok: true };
  } catch (e: any) {
    console.error('Slack notification error:', e);
    return { ok: false, error: e.message };
  }
}
