'use client';

import { AGENT_CONFIG } from './config';
import type { QuoteItem, QuoteTelemetry } from './types';

const KEY = 'dai:agent:quotes:v1';

/** Persist minimal telemetry in localStorage (per browser). */
function loadTelemetry(): Record<string, QuoteTelemetry> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

function saveTelemetry(db: Record<string, QuoteTelemetry>) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
}

function idFor(q: QuoteItem) {
  return `${q.source}::${q.quote.slice(0, 32)}`;
}

/** Scarcity: 10% chance to show anything at all (default returns undefined). */
function passesScarcityGate(prob = 0.10) {
  return Math.random() < prob;
}

/** Usage-decay weighting: prefer rarely-used and long-idle quotes. */
function weightFor(q: QuoteItem, t?: QuoteTelemetry) {
  const now = Date.now();
  const last = t?.last_used ?? 0;
  const idleMs = Math.max(1, now - last);
  const idleFactor = Math.min(4, Math.log10(idleMs / (60_000)) + 1); // grows with minutes since last use
  const usagePenalty = 1 / Math.max(1, (t?.usage_count ?? 0) + 1);
  const subtlety = (t?.subtlety_index ?? 0.7); // default subtle
  return idleFactor * usagePenalty * (0.5 + 0.5 * subtlety);
}

function isPGSafe(q: QuoteItem) {
  const txt = `${q.quote} ${q.source} ${q.context_tag}`.toLowerCase();
  // Basic topic avoidance
  const banned = AGENT_CONFIG.guardrails.topic_avoidance.map(s => s.toLowerCase());
  return !banned.some(b => txt.includes(b));
}

/** Choose a PG-safe, scarce, fresh quote. Returns undefined most of the time by design. */
export function getEasterEggQuote(): QuoteItem | undefined {
  if (!passesScarcityGate()) return undefined;

  const list = AGENT_CONFIG.tier_1_pg_quotes_baseline.filter(q => q.quote && q.source);
  const db = loadTelemetry();

  // Rank by usage-decay weight
  const scored = list.map(q => {
    const id = idFor(q);
    const w = weightFor(q, db[id]);
    return { q, w, id };
  }).sort((a, b) => b.w - a.w);

  const pick = scored[0]?.q;
  if (!pick) return undefined;

  // Guardrails (avoid topics)
  if (!isPGSafe(pick)) return undefined;

  // Update telemetry
  const id = idFor(pick);
  const prev = db[id];
  db[id] = {
    quote: pick.quote,
    source: pick.source,
    last_used: Date.now(),
    usage_count: (prev?.usage_count ?? 0) + 1,
    subtlety_index: prev?.subtlety_index ?? 0.7
  };
  saveTelemetry(db);

  return pick;
}

