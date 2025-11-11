export type Vertical = 'acquisition' | 'service' | 'parts';

export interface TrustInput {
  eeat: number; // E-E-A-T composite (0-1)
  reputation: number; // Review & UGC weight (0-1)
  technical: number; // Core Web Vitals, CWV proxy (0-1)
  localVis: number; // GEO/SEO/AEO coverage (0-1)
  compliance: number; // PIQR alignment (0-1)
}

export function algorithmicTrustScore(input: TrustInput, vertical: Vertical): number {
  const weights = {
    acquisition: { eeat: 0.3, reputation: 0.3, technical: 0.15, localVis: 0.15, compliance: 0.1 },
    service: { eeat: 0.4, reputation: 0.35, technical: 0.1, localVis: 0.1, compliance: 0.05 },
    parts: { eeat: 0.25, reputation: 0.25, technical: 0.3, localVis: 0.15, compliance: 0.05 }
  }[vertical];

  const total = Object.entries(weights).reduce((sum, [k, w]) => sum + (input[k as keyof TrustInput] * w), 0);
  return +(total * 100).toFixed(2);
}

export function getTrustWeights(vertical: Vertical) {
  return {
    acquisition: { eeat: 0.3, reputation: 0.3, technical: 0.15, localVis: 0.15, compliance: 0.1 },
    service: { eeat: 0.4, reputation: 0.35, technical: 0.1, localVis: 0.1, compliance: 0.05 },
    parts: { eeat: 0.25, reputation: 0.25, technical: 0.3, localVis: 0.15, compliance: 0.05 }
  }[vertical];
}

export function validateTrustInput(input: TrustInput): boolean {
  const values = Object.values(input);
  return values.every(v => v >= 0 && v <= 1) && values.length === 5;
}

export function getTrustInsights(score: number, vertical: Vertical): string[] {
  const insights = [];
  
  if (score >= 90) {
    insights.push(`Excellent ${vertical} trust score - industry leading performance`);
  } else if (score >= 80) {
    insights.push(`Strong ${vertical} trust score - above industry average`);
  } else if (score >= 70) {
    insights.push(`Good ${vertical} trust score - room for improvement`);
  } else {
    insights.push(`Below average ${vertical} trust score - requires immediate attention`);
  }
  
  return insights;
}
