export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: 'visibility' | 'seo' | 'geo';
};

export async function visibilityToPulses(domain?: string): Promise<Pulse[]> {
  try {
    const res = await fetch(`/api/visibility/presence?domain=${encodeURIComponent(domain || '')}`, {cache: 'no-store'});
    if (!res.ok) return [];
    
    const v = await res.json();
    const map: Record<string, number> = {};
    for (const e of v.engines || []) {
      map[e.name] = e.presencePct;
    }
    
    const pulses: Pulse[] = [];
    
    if ((map['Gemini'] ?? 0) < 75) {
      pulses.push({
        id: 'gemini_low_presence',
        title: 'Gemini presence weak',
        diagnosis: `Gemini presence ${(map['Gemini'] ?? 0).toFixed(0)}% trails ChatGPT ${map['ChatGPT'] ?? 0}%`,
        prescription: 'Embed FAQPage schema on service pages; publish Q&A answers; add entity markup.',
        impactMonthlyUSD: 2400,
        etaSeconds: 150,
        confidenceScore: 0.72,
        recencyMinutes: 15,
        kind: 'visibility'
      });
    }
    
    if ((map['Copilot'] ?? 0) < 70) {
      pulses.push({
        id: 'copilot_low_presence',
        title: 'Copilot presence limited',
        diagnosis: `Copilot ${(map['Copilot'] ?? 0).toFixed(0)}% suggests weak GBP + schema alignment.`,
        prescription: 'Ensure AutoDealer schema, address/hours consistency; add review snippet schema.',
        impactMonthlyUSD: 1600,
        etaSeconds: 120,
        confidenceScore: 0.66,
        recencyMinutes: 15,
        kind: 'visibility'
      });
    }
    
    return pulses;
  } catch {
    return [];
  }
}

