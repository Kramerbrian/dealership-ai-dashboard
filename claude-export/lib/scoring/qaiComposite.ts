export interface QAIInput {
  authority: number; // Domain, backlinks, citations
  trust: number; // Brand + reputation
  experience: number; // EEAT experiential content factor
  recency: number; // Last content update weight
  structure: number; // Schema & markup compliance
}

export function qaiComposite(i: QAIInput): number {
  const w = { authority: 0.35, trust: 0.25, experience: 0.15, recency: 0.15, structure: 0.1 };
  const score = (i.authority * w.authority + i.trust * w.trust + i.experience * w.experience + i.recency * w.recency + i.structure * w.structure);
  return +(score).toFixed(2);
}

export function qaiHealthColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 0.8) return 'green';
  if (score >= 0.6) return 'amber';
  return 'red';
}

export function getQAIWeights() {
  return { authority: 0.35, trust: 0.25, experience: 0.15, recency: 0.15, structure: 0.1 };
}

export function validateQAIInput(input: QAIInput): boolean {
  const values = Object.values(input);
  return values.every(v => v >= 0 && v <= 1) && values.length === 5;
}

export function getQAIInsights(score: number): string[] {
  const insights = [];
  
  if (score >= 0.8) {
    insights.push('Excellent authority score - dominant market position');
    insights.push('Strong brand trust and reputation');
    insights.push('High-quality content with recent updates');
  } else if (score >= 0.6) {
    insights.push('Good authority score - competitive position');
    insights.push('Solid brand trust foundation');
    insights.push('Regular content updates needed');
  } else {
    insights.push('Below average authority score - requires improvement');
    insights.push('Focus on building domain authority and trust');
    insights.push('Implement structured data and content strategy');
  }
  
  return insights;
}

export function calculateQAIComponents(input: QAIInput) {
  const weights = getQAIWeights();
  
  return {
    authority: +(input.authority * weights.authority).toFixed(3),
    trust: +(input.trust * weights.trust).toFixed(3),
    experience: +(input.experience * weights.experience).toFixed(3),
    recency: +(input.recency * weights.recency).toFixed(3),
    structure: +(input.structure * weights.structure).toFixed(3)
  };
}
