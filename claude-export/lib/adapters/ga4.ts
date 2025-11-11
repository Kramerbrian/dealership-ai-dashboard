import { apiFetch } from './utils';

export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: 'traffic' | 'funnel';
};

export async function ga4ToPulses(domain?: string): Promise<Pulse[]> {
  try {
    const url = `/api/ga4/summary${domain ? `?domain=${encodeURIComponent(domain)}` : ''}`;
    const res = await apiFetch(url);
    if (!res.ok) return [];
    const g = await res.json();
    const aiShare = g.aiAssistedSessions / Math.max(1, g.sessions);
    const pulses: Pulse[] = [];
    if (aiShare < 0.18) {
      pulses.push({
        id: 'ga4_ai_low',
        title: 'AI-assisted traffic low',
        diagnosis: `Only ${(aiShare * 100).toFixed(1)}% AI-assisted.`,
        prescription: 'Add FAQ schema; target +5–8% AI share.',
        impactMonthlyUSD: 1900,
        etaSeconds: 180,
        confidenceScore: 0.7,
        recencyMinutes: 10,
        kind: 'traffic',
      });
    }
    if (g.bounceRatePct > 55) {
      pulses.push({
        id: 'ga4_bounce_high',
        title: 'High bounce reduces conversions',
        diagnosis: `Bounce ${g.bounceRatePct.toFixed(1)}% last ${g.rangeDays}d.`,
        prescription: 'Compress images; defer scripts; raise CTA.',
        impactMonthlyUSD: 1200,
        etaSeconds: 180,
        confidenceScore: 0.6,
        recencyMinutes: 10,
        kind: 'funnel',
      });
    }
    return pulses;
  } catch (error) {
    console.error('[ga4ToPulses] Error:', error);
    return [];
  }
}