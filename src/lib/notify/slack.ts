export async function postSlack(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ text }) });
  } catch {}
}

