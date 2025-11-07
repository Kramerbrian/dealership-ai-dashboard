// components/pulse/PulseEngine.ts

export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: 'schema'|'faq'|'reviews'|'visibility'|'traffic'|'funnel'|'geo'|'seo';
};

export function rankPulse(pulses: Pulse[], role: 'gm'|'marketing'|'service' = 'gm'): Pulse[] {
  // Simple ranking: sort by impact * confidence, then by recency
  return [...pulses].sort((a, b) => {
    const scoreA = a.impactMonthlyUSD * a.confidenceScore - (a.recencyMinutes / 60);
    const scoreB = b.impactMonthlyUSD * b.confidenceScore - (b.recencyMinutes / 60);
    return scoreB - scoreA;
  });
}
