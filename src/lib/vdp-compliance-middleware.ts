/**
 * VDP Compliance Middleware
 * 
 * This middleware validates VDP content against PIQR and HRP requirements
 * before allowing it to be published or cached.
 */

import { VDPContentSections, VDPContextData, VDPComplianceMetrics } from './vdp-top-protocol';

export interface ComplianceCheckResult {
  isCompliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  canPublish: boolean;
  requiresReview: boolean;
}

export interface ComplianceThresholds {
  minPIQRScore: number;      // Maximum allowed PIQR (lower is better)
  maxHRPScore: number;       // Maximum allowed HRP (lower is better)
  minVAIScore: number;       // Minimum required VAI (higher is better)
  maxComplianceFails: number; // Maximum compliance failures allowed
  maxWarningSignals: number;  // Maximum warning signals allowed
}

// Default compliance thresholds
export const DEFAULT_COMPLIANCE_THRESHOLDS: ComplianceThresholds = {
  minPIQRScore: 1.2,        // Allow up to 20% penalty
  maxHRPScore: 0.3,         // Allow up to 30% trust penalty
  minVAIScore: 70,          // Minimum 70 VAI score
  maxComplianceFails: 2,    // Allow up to 2 compliance failures
  maxWarningSignals: 3,     // Allow up to 3 warning signals
};

/**
 * Comprehensive compliance checker for VDP content
 */
export function checkVDPCompliance(
  content: VDPContentSections,
  context: VDPContextData,
  compliance: VDPComplianceMetrics,
  thresholds: ComplianceThresholds = DEFAULT_COMPLIANCE_THRESHOLDS
): ComplianceCheckResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let canPublish = true;
  let requiresReview = false;

  // Check PIQR compliance
  if (compliance.piqrScore > thresholds.minPIQRScore) {
    issues.push(`PIQR score ${compliance.piqrScore.toFixed(2)} exceeds threshold ${thresholds.minPIQRScore}`);
    canPublish = false;
    requiresReview = true;
  }

  // Check HRP compliance
  if (compliance.hrpScore > thresholds.maxHRPScore) {
    issues.push(`HRP score ${compliance.hrpScore.toFixed(2)} exceeds threshold ${thresholds.maxHRPScore}`);
    canPublish = false;
    requiresReview = true;
  }

  // Check VAI compliance
  if (compliance.vaiScore < thresholds.minVAIScore) {
    issues.push(`VAI score ${compliance.vaiScore.toFixed(2)} below threshold ${thresholds.minVAIScore}`);
    canPublish = false;
    requiresReview = true;
  }

  // Check compliance failures
  if (compliance.complianceFails.length > thresholds.maxComplianceFails) {
    issues.push(`Too many compliance failures: ${compliance.complianceFails.length} > ${thresholds.maxComplianceFails}`);
    canPublish = false;
    requiresReview = true;
  }

  // Check warning signals
  if (compliance.warningSignals.length > thresholds.maxWarningSignals) {
    issues.push(`Too many warning signals: ${compliance.warningSignals.length} > ${thresholds.maxWarningSignals}`);
    canPublish = false;
    requiresReview = true;
  }

  // Content-specific checks
  const aeoWordCount = content.AEO_Snippet_Block.split(' ').length;
  if (aeoWordCount > 40) {
    issues.push(`AEO snippet exceeds 40 words (${aeoWordCount} words)`);
    recommendations.push('Reduce AEO snippet to 40 words or less');
  }

  const geoWordCount = content.GEO_Authority_Block.split(' ').length;
  if (geoWordCount < 80 || geoWordCount > 120) {
    issues.push(`GEO authority block word count ${geoWordCount} outside optimal range (80-120)`);
    recommendations.push('Adjust GEO authority block to 80-120 words');
  }

  const seoWordCount = content.SEO_Descriptive_Block.split(' ').length;
  if (seoWordCount < 200 || seoWordCount > 300) {
    issues.push(`SEO descriptive block word count ${seoWordCount} outside optimal range (200-300)`);
    recommendations.push('Adjust SEO descriptive block to 200-300 words');
  }

  // Check for required internal links
  if (content.Internal_Link_Block.length < 3) {
    issues.push(`Insufficient internal links: ${content.Internal_Link_Block.length} < 3`);
    recommendations.push('Add at least 3 internal links to high-authority pages');
  }

  // Check for verifiable facts in GEO block
  const geoText = content.GEO_Authority_Block.toLowerCase();
  const hasInspection = geoText.includes('inspection') || geoText.includes('certified');
  const hasTechReference = geoText.includes(context.dealerData.masterTechName.toLowerCase());
  const hasServiceReference = geoText.includes('service') || geoText.includes('technician');

  if (!hasInspection) {
    recommendations.push('Add reference to vehicle inspection or certification process');
  }
  if (!hasTechReference) {
    recommendations.push(`Include Master Technician ${context.dealerData.masterTechName} reference`);
  }
  if (!hasServiceReference) {
    recommendations.push('Reference dealer service capabilities or expertise');
  }

  // Check for deceptive pricing language
  const allText = Object.values(content).join(' ').toLowerCase();
  const deceptiveTerms = [
    'requires financing',
    'trade-in required',
    'with approved credit',
    'subject to credit approval',
    'dealer financing only',
    'must finance through dealer'
  ];

  deceptiveTerms.forEach(term => {
    if (allText.includes(term)) {
      issues.push(`Deceptive pricing language detected: "${term}"`);
      recommendations.push(`Remove or rephrase: "${term}"`);
      canPublish = false;
    }
  });

  // Check for brand consistency
  const brandMentions = (allText.match(new RegExp(context.vinDecodedSpecs.make.toLowerCase(), 'g')) || []).length;
  if (brandMentions < 2) {
    recommendations.push(`Increase brand mentions (${context.vinDecodedSpecs.make}) for better SEO`);
  }

  // Calculate overall compliance score
  const maxIssues = 10; // Maximum possible issues
  const issuePenalty = Math.min(issues.length / maxIssues, 1);
  const score = Math.round((1 - issuePenalty) * 100);

  return {
    isCompliant: issues.length === 0,
    score,
    issues,
    recommendations,
    canPublish,
    requiresReview
  };
}

/**
 * Pre-publish validation middleware
 */
export function validateBeforePublish(
  content: VDPContentSections,
  context: VDPContextData,
  compliance: VDPComplianceMetrics,
  customThresholds?: Partial<ComplianceThresholds>
): ComplianceCheckResult {
  const thresholds = { ...DEFAULT_COMPLIANCE_THRESHOLDS, ...customThresholds };
  
  const result = checkVDPCompliance(content, context, compliance, thresholds);
  
  // Log compliance check for monitoring
  console.log('VDP Compliance Check', {
    vin: context.vin,
    clusterId: context.vcoClusterId,
    isCompliant: result.isCompliant,
    score: result.score,
    canPublish: result.canPublish,
    requiresReview: result.requiresReview,
    issueCount: result.issues.length,
    recommendationCount: result.recommendations.length,
    piqrScore: compliance.piqrScore,
    hrpScore: compliance.hrpScore,
    vaiScore: compliance.vaiScore
  });

  return result;
}

/**
 * Batch compliance checker for multiple VDPs
 */
export function batchComplianceCheck(
  vdpContents: Array<{
    content: VDPContentSections;
    context: VDPContextData;
    compliance: VDPComplianceMetrics;
  }>,
  customThresholds?: Partial<ComplianceThresholds>
): {
  results: ComplianceCheckResult[];
  summary: {
    total: number;
    compliant: number;
    publishable: number;
    requiresReview: number;
    averageScore: number;
  };
} {
  const results = vdpContents.map(({ content, context, compliance }) =>
    validateBeforePublish(content, context, compliance, customThresholds)
  );

  const summary = {
    total: results.length,
    compliant: results.filter(r => r.isCompliant).length,
    publishable: results.filter(r => r.canPublish).length,
    requiresReview: results.filter(r => r.requiresReview).length,
    averageScore: Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    )
  };

  return { results, summary };
}

/**
 * Compliance monitoring and alerting
 */
export function generateComplianceReport(
  batchResults: ReturnType<typeof batchComplianceCheck>
): {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  actions: string[];
} {
  const { summary } = batchResults;
  const complianceRate = (summary.compliant / summary.total) * 100;
  const publishRate = (summary.publishable / summary.total) * 100;

  let status: 'healthy' | 'warning' | 'critical';
  let message: string;
  const actions: string[] = [];

  if (complianceRate >= 90 && publishRate >= 95) {
    status = 'healthy';
    message = `VDP compliance is healthy: ${complianceRate.toFixed(1)}% compliant, ${publishRate.toFixed(1)}% publishable`;
  } else if (complianceRate >= 70 && publishRate >= 80) {
    status = 'warning';
    message = `VDP compliance needs attention: ${complianceRate.toFixed(1)}% compliant, ${publishRate.toFixed(1)}% publishable`;
    actions.push('Review non-compliant VDPs and update content');
    actions.push('Check compliance thresholds and adjust if needed');
  } else {
    status = 'critical';
    message = `VDP compliance is critical: ${complianceRate.toFixed(1)}% compliant, ${publishRate.toFixed(1)}% publishable`;
    actions.push('Immediate review of all VDP content required');
    actions.push('Update VDP generation prompts and validation rules');
    actions.push('Consider manual review process for all new VDPs');
  }

  if (summary.requiresReview > 0) {
    actions.push(`${summary.requiresReview} VDPs require manual review`);
  }

  return { status, message, actions };
}
