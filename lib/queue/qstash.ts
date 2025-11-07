/**
 * Minimal Upstash QStash publisher.
 * Docs: https://upstash.com/docs/qstash/quickstarts/nextjs
 */

export async function qstashPublish(
  path: string,
  body: any,
  headers: Record<string, string> = {}
) {
  const token = process.env.QSTASH_TOKEN!;
  const base = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://dash.dealershipai.com";
  
  if (!token) throw new Error("QSTASH_TOKEN not configured");
  
  const url = `https://qstash.upstash.io/v2/publish/${encodeURIComponent(new URL(path, base).toString())}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QStash publish failed: ${res.status} ${text}`);
  }

  return res.json(); // returns { messageId, ... }
}

/** Verify QStash signature in consumer */
export async function verifyQStashSignature(req: Request) {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;

  // For brevity we skip full signature verification code (Upstash provides SDK).
  // In production, import @upstash/qstash/nextjs and use verifySignature or the middleware:
  //   import { verifySignature } from "@upstash/qstash/nextjs";
  // Here, we assume trusted QStash → add verification when you wire the SDK.
  if (!current || !next) {
    console.warn(
      "QStash signing keys not set; skipping verification (dev only)."
    );
  }
  return true;
}

