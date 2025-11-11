export interface PIQRInput {
  visibility: number; // AI/SEO coverage drop (0-1)
  ux: number; // UX and CWV volatility (0-1)
  consistency: number; // Content update consistency (0-1)
  sentiment: number; // UGC sentiment health (0-1)
  compliance: number; // Regulatory / disclosure compliance (0-1)
}

export function piqrRisk(i: PIQRInput): number {
  const w = { visibility: 0.25, ux: 0.25, consistency: 0.2, sentiment: 0.2, compliance: 0.1 };
  const stability = i.visibility * w.visibility + i.ux * w.ux + i.consistency * w.consistency + i.sentiment * w.sentiment + i.compliance * w.compliance;
  const risk = 1 - stability;
  return +(risk * 100).toFixed(2);
}

export function piqrClassification(risk: number): 'low' | 'moderate' | 'high' {
  if (risk <= 20) return 'low';
  if (risk <= 50) return 'moderate';
  return 'high';
}

export function getPIQRWeights() {
  return { visibility: 0.25, ux: 0.25, consistency: 0.2, sentiment: 0.2, compliance: 0.1 };
}

export function validatePIQRInput(input: PIQRInput): boolean {
  const values = Object.values(input);
  return values.every(v => v >= 0 && v <= 1) && values.length === 5;
}

export function getPIQRInsights(risk: number): string[] {
  const insights = [];
  const classification = piqrClassification(risk);
  
  if (classification === 'low') {
    insights.push('Low risk profile - stable performance indicators');
    insights.push('Strong visibility and user experience metrics');
    insights.push('Consistent content updates and positive sentiment');
  } else if (classification === 'moderate') {
    insights.push('Moderate risk profile - monitor key indicators');
    insights.push('Some areas need attention for optimization');
    insights.push('Focus on improving consistency and sentiment');
  } else {
    insights.push('High risk profile - immediate action required');
    insights.push('Significant visibility and UX issues detected');
    insights.push('Urgent need for content and compliance improvements');
  }
  
  return insights;
}

export function calculatePIQRComponents(input: PIQRInput) {
  const weights = getPIQRWeights();
  
  return {
    visibility: +(input.visibility * weights.visibility).toFixed(3),
    ux: +(input.ux * weights.ux).toFixed(3),
    consistency: +(input.consistency * weights.consistency).toFixed(3),
    sentiment: +(input.sentiment * weights.sentiment).toFixed(3),
    compliance: +(input.compliance * weights.compliance).toFixed(3)
  };
}

export function getPIQRRiskFactors(input: PIQRInput): string[] {
  const factors = [];
  
  if (input.visibility < 0.7) factors.push('Low visibility coverage');
  if (input.ux < 0.7) factors.push('Poor user experience metrics');
  if (input.consistency < 0.7) factors.push('Inconsistent content updates');
  if (input.sentiment < 0.7) factors.push('Negative sentiment trends');
  if (input.compliance < 0.7) factors.push('Compliance issues detected');
  
  return factors;
}
