/**
 * Upstash QStash publisher with DLQ and retry strategy.
 * Docs: https://upstash.com/docs/qstash/quickstarts/nextjs
 */

export async function qstashPublish(
  path: string,
  body: any,
  headers: Record<string, string> = {}
) {
  const token = process.env.QSTASH_TOKEN!;
  const base =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://dash.dealershipai.com";

  if (!token) throw new Error("QSTASH_TOKEN not configured");

  const target = new URL(path, base).toString();
  const dlq = new URL("/api/jobs/fix-dlq", base).toString();

  // optional retries: x-retries, x-callback (DLQ), x-delay (ms)
  const h = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Upstash-Callback": dlq, // DLQ endpoint
    "Upstash-Retries": "5", // retry 5 times with exponential backoff
    ...headers,
  };

  const res = await fetch(
    `https://qstash.upstash.io/v2/publish/${encodeURIComponent(target)}`,
    {
      method: "POST",
      headers: h,
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QStash publish failed: ${res.status} ${text}`);
  }

  return res.json(); // { messageId, ... }
}

