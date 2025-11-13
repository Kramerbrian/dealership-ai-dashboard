export type FeedEvent = {
  title: string;
  description?: string;
  impact?: string;
  severity?: 'info' | 'warning' | 'alert' | 'success';
  ts?: number;
};

const FEED_KEY = '__dai_feed__';

export function writeEvent(e: FeedEvent) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(FEED_KEY) || '[]');
    const evt = { ...e, ts: e.ts || Date.now() };
    const next = [evt, ...existing].slice(0, 50);
    localStorage.setItem(FEED_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function readEvents(): FeedEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FEED_KEY) || '[]');
  } catch {
    return [];
  }
}

