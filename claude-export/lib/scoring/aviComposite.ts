export interface AVIInput {
  seo: number; // Search exposure
  aeo: number; // AI overview presence
  geo: number; // Map/Local Pack coverage
  ugc: number; // User generated content density
}

export function aviComposite(i: AVIInput): number {
  const w = { seo: 0.35, aeo: 0.35, geo: 0.2, ugc: 0.1 };
  const score = (i.seo * w.seo + i.aeo * w.aeo + i.geo * w.geo + i.ugc * w.ugc);
  return +(score * 100).toFixed(2);
}

export function aviLabel(score: number): 'Dominant' | 'Competitive' | 'Vulnerable' {
  if (score >= 80) return 'Dominant';
  if (score >= 65) return 'Competitive';
  return 'Vulnerable';
}

export function getAVIWeights() {
  return { seo: 0.35, aeo: 0.35, geo: 0.2, ugc: 0.1 };
}

export function validateAVIInput(input: AVIInput): boolean {
  const values = Object.values(input);
  return values.every(v => v >= 0 && v <= 1) && values.length === 4;
}

export function getAVIInsights(score: number): string[] {
  const insights = [];
  const label = aviLabel(score);
  
  if (label === 'Dominant') {
    insights.push('Dominant visibility position - market leader');
    insights.push('Strong SEO and AI overview presence');
    insights.push('Excellent local and user-generated content coverage');
  } else if (label === 'Competitive') {
    insights.push('Competitive visibility position - solid performance');
    insights.push('Good SEO foundation with AI optimization opportunities');
    insights.push('Room for improvement in local and UGC coverage');
  } else {
    insights.push('Vulnerable visibility position - requires immediate action');
    insights.push('Significant SEO and AI overview gaps');
    insights.push('Critical need for local and content strategy improvements');
  }
  
  return insights;
}

export function calculateAVIComponents(input: AVIInput) {
  const weights = getAVIWeights();
  
  return {
    seo: +(input.seo * weights.seo * 100).toFixed(2),
    aeo: +(input.aeo * weights.aeo * 100).toFixed(2),
    geo: +(input.geo * weights.geo * 100).toFixed(2),
    ugc: +(input.ugc * weights.ugc * 100).toFixed(2)
  };
}

export function getAVIOpportunities(input: AVIInput): string[] {
  const opportunities = [];
  
  if (input.seo < 0.8) opportunities.push('SEO optimization - improve search exposure');
  if (input.aeo < 0.8) opportunities.push('AI overview optimization - enhance AI presence');
  if (input.geo < 0.8) opportunities.push('Local SEO - strengthen map pack coverage');
  if (input.ugc < 0.8) opportunities.push('UGC strategy - increase user-generated content');
  
  return opportunities;
}

export function getAVIStrengths(input: AVIInput): string[] {
  const strengths = [];
  
  if (input.seo >= 0.8) strengths.push('Strong SEO performance');
  if (input.aeo >= 0.8) strengths.push('Excellent AI overview presence');
  if (input.geo >= 0.8) strengths.push('Dominant local pack coverage');
  if (input.ugc >= 0.8) strengths.push('High-quality user-generated content');
  
  return strengths;
}
