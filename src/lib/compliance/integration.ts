import { complianceEngine } from './assessment-engine';
import { getDealershipScores } from '../scoring-engine';

/**
 * Integration between Compliance Assessment and AI Visibility Scoring
 * Extends the existing DealershipAI scoring system with compliance metrics
 */

export interface ComplianceEnhancedScores {
  // Original AI visibility scores
  ai_visibility: number;
  zero_click: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
  overall: number;
  timestamp: string;
  
  // New compliance metrics
  compliance_score: number;
  security_compliance: number;
  seo_compliance: number;
  aeo_compliance: number;
  ai_visibility_compliance: number;
  
  // Risk assessment
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_confidence: number;
  
  // Recommendations
  compliance_recommendations: string[];
}

/**
 * Enhanced scoring function that includes compliance assessment
 */
export async function getComplianceEnhancedScores(
  domain: string,
  tenant_id: string,
  dealer_id?: string
): Promise<ComplianceEnhancedScores> {
  // Get original AI visibility scores
  const originalScores = await getDealershipScores(domain);
  
  // Run compliance assessments for different areas
  const complianceAssessments = await Promise.all([
    // Security compliance assessment
    assessSecurityCompliance(domain, tenant_id, dealer_id),
    
    // SEO compliance assessment
    assessSEOCompliance(domain, tenant_id, dealer_id),
    
    // AEO compliance assessment
    assessAEOCompliance(domain, tenant_id, dealer_id),
    
    // AI Visibility compliance assessment
    assessAIVisibilityCompliance(domain, tenant_id, dealer_id),
  ]);
  
  // Calculate compliance scores
  const security_compliance = complianceAssessments[0].compliant === 'yes' ? 100 : 0;
  const seo_compliance = complianceAssessments[1].compliant === 'yes' ? 100 : 0;
  const aeo_compliance = complianceAssessments[2].compliant === 'yes' ? 100 : 0;
  const ai_visibility_compliance = complianceAssessments[3].compliant === 'yes' ? 100 : 0;
  
  // Calculate overall compliance score (weighted average)
  const compliance_score = Math.round(
    (security_compliance * 0.3) +
    (seo_compliance * 0.25) +
    (aeo_compliance * 0.25) +
    (ai_visibility_compliance * 0.2)
  );
  
  // Calculate average confidence
  const compliance_confidence = complianceAssessments.reduce(
    (sum, assessment) => sum + assessment.confidence_score, 0
  ) / complianceAssessments.length;
  
  // Determine overall risk level
  const overall_risk_level = determineOverallRiskLevel(complianceAssessments);
  
  // Collect all recommendations
  const compliance_recommendations = complianceAssessments
    .flatMap(assessment => assessment.recommendations || [])
    .filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates
  
  return {
    ...originalScores,
    compliance_score,
    security_compliance,
    seo_compliance,
    aeo_compliance,
    ai_visibility_compliance,
    overall_risk_level,
    compliance_confidence,
    compliance_recommendations,
  };
}

/**
 * Assess security compliance for a dealership
 */
async function assessSecurityCompliance(
  domain: string,
  tenant_id: string,
  dealer_id?: string
) {
  // This would typically analyze the dealership's security practices
  // For now, we'll use a mock assessment based on the examples provided
  
  const securityQuestions = [
    {
      messages: [{
        role: 'user' as const,
        content: 'Do you have a dedicated security team?'
      }],
      compliant: 'yes' as const,
      explanation: 'A dedicated security team follows strict protocols for handling incidents.'
    }
  ];
  
  return await complianceEngine.assessCompliance(
    securityQuestions[0],
    {
      tenant_id,
      dealer_id,
      question_type: 'security',
      assessed_by: 'system',
    }
  );
}

/**
 * Assess SEO compliance for a dealership
 */
async function assessSEOCompliance(
  domain: string,
  tenant_id: string,
  dealer_id?: string
) {
  // This would analyze the dealership's SEO practices
  // For now, we'll use a mock assessment
  
  const seoQuestions = [
    {
      messages: [{
        role: 'user' as const,
        content: 'What SEO practices do you implement?'
      }],
      compliant: 'yes' as const,
      explanation: 'Comprehensive SEO practices including meta tags, structured data, and content optimization are implemented.'
    }
  ];
  
  return await complianceEngine.assessCompliance(
    seoQuestions[0],
    {
      tenant_id,
      dealer_id,
      question_type: 'seo',
      assessed_by: 'system',
    }
  );
}

/**
 * Assess AEO compliance for a dealership
 */
async function assessAEOCompliance(
  domain: string,
  tenant_id: string,
  dealer_id?: string
) {
  // This would analyze the dealership's AEO practices
  // For now, we'll use a mock assessment
  
  const aeoQuestions = [
    {
      messages: [{
        role: 'user' as const,
        content: 'How do you optimize for answer engines?'
      }],
      compliant: 'yes' as const,
      explanation: 'Answer engine optimization includes FAQ schema, structured data, and content formatted for featured snippets.'
    }
  ];
  
  return await complianceEngine.assessCompliance(
    aeoQuestions[0],
    {
      tenant_id,
      dealer_id,
      question_type: 'aeo',
      assessed_by: 'system',
    }
  );
}

/**
 * Assess AI Visibility compliance for a dealership
 */
async function assessAIVisibilityCompliance(
  domain: string,
  tenant_id: string,
  dealer_id?: string
) {
  // This would analyze the dealership's AI visibility practices
  // Based on the example provided
  
  const aiVisibilityQuestions = [
    {
      messages: [{
        role: 'user' as const,
        content: 'How do you measure and improve AI search visibility?'
      }],
      compliant: 'yes' as const,
      explanation: 'A search engine agent for SEO, AEO, AIO, and Generative Search constantly improves the measurement and calculation of AI search visibility.'
    }
  ];
  
  return await complianceEngine.assessCompliance(
    aiVisibilityQuestions[0],
    {
      tenant_id,
      dealer_id,
      question_type: 'ai_visibility',
      assessed_by: 'system',
    }
  );
}

/**
 * Determine overall risk level based on compliance assessments
 */
function determineOverallRiskLevel(assessments: any[]): 'low' | 'medium' | 'high' | 'critical' {
  const riskLevels = assessments.map(a => a.risk_level);
  
  if (riskLevels.includes('critical')) return 'critical';
  if (riskLevels.includes('high')) return 'high';
  if (riskLevels.includes('medium')) return 'medium';
  return 'low';
}

/**
 * Get compliance-enhanced scores for multiple dealerships
 */
export async function getBulkComplianceEnhancedScores(
  domains: string[],
  tenant_id: string
): Promise<ComplianceEnhancedScores[]> {
  return Promise.all(
    domains.map(domain => getComplianceEnhancedScores(domain, tenant_id))
  );
}

/**
 * Calculate compliance trends over time
 */
export async function getComplianceTrends(
  domain: string,
  tenant_id: string,
  days: number = 30
): Promise<{
  date: string;
  compliance_score: number;
  risk_level: string;
}[]> {
  // This would typically query historical compliance data
  // For now, return mock trend data

  const trends: Array<{
    date: string;
    compliance_score: number;
    risk_level: string;
  }> = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    trends.push({
      date: date.toISOString().split('T')[0],
      compliance_score: 85 + Math.random() * 10, // Mock data
      risk_level: Math.random() > 0.8 ? 'medium' : 'low',
    });
  }

  return trends;
}
