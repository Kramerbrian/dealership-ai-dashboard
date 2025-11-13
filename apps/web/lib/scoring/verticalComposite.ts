import { algorithmicTrustScore, TrustInput, Vertical } from './algorithmicTrust';
import { qaiComposite, QAIInput } from './qaiComposite';
import { piqrRisk, PIQRInput } from './piqr';
import { aviComposite, AVIInput } from './aviComposite';

export interface VerticalBundleInputs {
  trustInputs: TrustInput;
  qaiInputs: QAIInput;
  piqrInputs: PIQRInput;
  aviInputs: AVIInput;
}

export interface VerticalBundleResult {
  vertical: Vertical;
  algorithmicTrust: number;
  QAI: number;
  PIQR: number;
  AVI: number;
  DTRI: number;
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
  strengths: string[];
}

export function computeVerticalBundle(inputs: VerticalBundleInputs, vertical: Vertical): VerticalBundleResult {
  const trust = algorithmicTrustScore(inputs.trustInputs, vertical);
  const qai = qaiComposite(inputs.qaiInputs);
  const piqr = piqrRisk(inputs.piqrInputs);
  const avi = aviComposite(inputs.aviInputs);

  const dtri = (trust * 0.5 + qai * 0.25 + avi * 0.15 - piqr * 0.1);

  // Generate insights and recommendations
  const insights = generateInsights(trust, qai, piqr, avi, dtri, vertical);
  const recommendations = generateRecommendations(trust, qai, piqr, avi, dtri, vertical);
  const riskFactors = generateRiskFactors(piqr, vertical);
  const opportunities = generateOpportunities(trust, qai, avi, vertical);
  const strengths = generateStrengths(trust, qai, avi, vertical);

  return {
    vertical,
    algorithmicTrust: trust,
    QAI: qai,
    PIQR: piqr,
    AVI: avi,
    DTRI: +(dtri).toFixed(2),
    insights,
    recommendations,
    riskFactors,
    opportunities,
    strengths
  };
}

function generateInsights(trust: number, qai: number, piqr: number, avi: number, dtri: number, vertical: Vertical): string[] {
  const insights = [];
  
  // DTRI insights
  if (dtri >= 80) {
    insights.push(`Excellent ${vertical} performance - industry leading DTRI score`);
  } else if (dtri >= 70) {
    insights.push(`Strong ${vertical} performance - above industry average`);
  } else if (dtri >= 60) {
    insights.push(`Good ${vertical} performance - room for optimization`);
  } else {
    insights.push(`Below average ${vertical} performance - requires immediate attention`);
  }
  
  // Trust insights
  if (trust >= 85) {
    insights.push('High algorithmic trust - strong brand reputation');
  } else if (trust < 70) {
    insights.push('Low algorithmic trust - reputation improvement needed');
  }
  
  // QAI insights
  if (qai >= 0.8) {
    insights.push('Strong authority position - dominant market presence');
  } else if (qai < 0.6) {
    insights.push('Weak authority position - focus on domain building');
  }
  
  // PIQR insights
  if (piqr <= 20) {
    insights.push('Low risk profile - stable performance indicators');
  } else if (piqr >= 50) {
    insights.push('High risk profile - immediate action required');
  }
  
  // AVI insights
  if (avi >= 80) {
    insights.push('Dominant visibility - excellent search and AI presence');
  } else if (avi < 65) {
    insights.push('Vulnerable visibility - significant optimization needed');
  }
  
  return insights;
}

function generateRecommendations(trust: number, qai: number, piqr: number, avi: number, dtri: number, vertical: Vertical): string[] {
  const recommendations = [];
  
  // Priority recommendations based on scores
  if (trust < 75) {
    recommendations.push(`Improve ${vertical} trust through enhanced E-E-A-T signals and reputation management`);
  }
  
  if (qai < 0.7) {
    recommendations.push('Strengthen domain authority through quality backlinks and content optimization');
  }
  
  if (piqr > 30) {
    recommendations.push('Address performance risks through improved UX and content consistency');
  }
  
  if (avi < 70) {
    recommendations.push('Enhance visibility through SEO optimization and AI overview strategies');
  }
  
  // Vertical-specific recommendations
  if (vertical === 'acquisition') {
    recommendations.push('Optimize acquisition funnel with trust signals and authority content');
  } else if (vertical === 'service') {
    recommendations.push('Enhance service reputation through customer experience improvements');
  } else if (vertical === 'parts') {
    recommendations.push('Improve parts visibility through technical SEO and inventory optimization');
  }
  
  return recommendations;
}

function generateRiskFactors(piqr: number, vertical: Vertical): string[] {
  const riskFactors = [];
  
  if (piqr > 40) {
    riskFactors.push('High performance risk - potential revenue impact');
  }
  
  if (piqr > 30) {
    riskFactors.push('Moderate risk - monitor key performance indicators');
  }
  
  if (piqr <= 20) {
    riskFactors.push('Low risk - stable performance profile');
  }
  
  return riskFactors;
}

function generateOpportunities(trust: number, qai: number, avi: number, vertical: Vertical): string[] {
  const opportunities = [];
  
  if (trust < 80) {
    opportunities.push(`Trust optimization opportunity in ${vertical} vertical`);
  }
  
  if (qai < 0.8) {
    opportunities.push('Authority building opportunity through content and backlinks');
  }
  
  if (avi < 80) {
    opportunities.push('Visibility enhancement opportunity through SEO and AI optimization');
  }
  
  return opportunities;
}

function generateStrengths(trust: number, qai: number, avi: number, vertical: Vertical): string[] {
  const strengths = [];
  
  if (trust >= 80) {
    strengths.push(`Strong ${vertical} trust foundation`);
  }
  
  if (qai >= 0.8) {
    strengths.push('High domain authority and brand trust');
  }
  
  if (avi >= 80) {
    strengths.push('Excellent search and AI visibility');
  }
  
  return strengths;
}

export function validateVerticalBundleInputs(inputs: VerticalBundleInputs): boolean {
  // Import validation functions
  const { validateTrustInput } = require('./algorithmicTrust');
  const { validateQAIInput } = require('./qaiComposite');
  const { validatePIQRInput } = require('./piqr');
  const { validateAVIInput } = require('./aviComposite');
  
  return (
    validateTrustInput(inputs.trustInputs) &&
    validateQAIInput(inputs.qaiInputs) &&
    validatePIQRInput(inputs.piqrInputs) &&
    validateAVIInput(inputs.aviInputs)
  );
}

export function getVerticalWeights(vertical: Vertical) {
  return {
    acquisition: { trust: 0.5, qai: 0.25, avi: 0.15, piqr: 0.1 },
    service: { trust: 0.5, qai: 0.25, avi: 0.15, piqr: 0.1 },
    parts: { trust: 0.5, qai: 0.25, avi: 0.15, piqr: 0.1 }
  }[vertical];
}
