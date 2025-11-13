/**
 * Idempotency and freshness guards
 * Stub implementation for production
 */

const seenKeys = new Set<string>();

export function seen(key: string): boolean {
  if (seenKeys.has(key)) return true;
  seenKeys.add(key);
  return false;
}

export function isFresh(sentAt: string): boolean {
  try {
    const sent = new Date(sentAt).getTime();
    const now = Date.now();
    // Consider fresh if within 5 minutes
    return (now - sent) < 5 * 60 * 1000;
  } catch {
    return false;
  }
}

export function recordEvent(env: any): void {
  // TODO: Implement event recording
  console.log('[reinforce] Event recorded:', env.event_id);
}

