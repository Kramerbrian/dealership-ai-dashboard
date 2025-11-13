// Simple localStorage helpers for last AIV composite per domain (client-only)

export type AIVSnapshot = { domain: string; score: number; tsISO: string };

const KEY = "dai:last_aiv";

export function getLastAIV(domain?: string): AIVSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIVSnapshot;
    if (!parsed || (domain && parsed.domain !== domain)) return null;
    return parsed;
  } catch { return null; }
}

export function setLastAIV(snap: AIVSnapshot) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(snap)); } catch {}
}

