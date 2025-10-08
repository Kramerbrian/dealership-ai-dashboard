import { z } from 'zod';

/**
 * Compliance Assessment Engine for DealershipAI
 * Handles security and search visibility compliance evaluations
 */

// Schema for compliance assessment input
export const ComplianceAssessmentSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  compliant: z.enum(['yes', 'no']),
  explanation: z.string(),
});

// Schema for assessment result
export const ComplianceResultSchema = z.object({
  assessment_id: z.string(),
  tenant_id: z.string(),
  dealer_id: z.string().optional(),
  question_type: z.enum(['security', 'seo', 'aeo', 'ai_visibility', 'general']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  compliant: z.enum(['yes', 'no']),
  explanation: z.string(),
  confidence_score: z.number().min(0).max(1),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  recommendations: z.array(z.string()).optional(),
  timestamp: z.date(),
  assessed_by: z.string(), // user_id or 'system'
});

export type ComplianceAssessment = z.infer<typeof ComplianceAssessmentSchema>;
export type ComplianceResult = z.infer<typeof ComplianceResultSchema>;

export interface ComplianceMetrics {
  total_assessments: number;
  compliant_percentage: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  average_confidence: number;
  last_assessment: Date;
}

export class ComplianceAssessmentEngine {
  private cache: Map<string, ComplianceResult> = new Map();

  /**
   * Assess compliance for a given input
   */
  async assessCompliance(
    input: ComplianceAssessment,
    context: {
      tenant_id: string;
      dealer_id?: string;
      question_type: 'security' | 'seo' | 'aeo' | 'ai_visibility' | 'general';
      assessed_by: string;
    }
  ): Promise<ComplianceResult> {
    // Validate input
    const validatedInput = ComplianceAssessmentSchema.parse(input);

    // Generate assessment ID
    const assessment_id = this.generateAssessmentId();

    // Calculate confidence score based on explanation quality
    const confidence_score = this.calculateConfidenceScore(validatedInput.explanation);

    // Determine risk level based on compliance and confidence
    const risk_level = this.determineRiskLevel(validatedInput.compliant, confidence_score);

    // Generate recommendations if non-compliant
    const recommendations = this.generateRecommendations(
      validatedInput.compliant,
      context.question_type,
      validatedInput.explanation
    );

    const result: ComplianceResult = {
      assessment_id,
      tenant_id: context.tenant_id,
      dealer_id: context.dealer_id,
      question_type: context.question_type,
      messages: validatedInput.messages,
      compliant: validatedInput.compliant,
      explanation: validatedInput.explanation,
      confidence_score,
      risk_level,
      recommendations,
      timestamp: new Date(),
      assessed_by: context.assessed_by,
    };

    // Cache result
    this.cache.set(assessment_id, result);

    return result;
  }

  /**
   * Calculate confidence score based on explanation quality
   */
  private calculateConfidenceScore(explanation: string): number {
    // Simple heuristic - can be enhanced with ML model
    const factors = {
      length: Math.min(explanation.length / 100, 1), // Longer explanations generally better
      keywords: this.countComplianceKeywords(explanation) / 5, // Max 5 keywords
      structure: this.assessExplanationStructure(explanation),
    };

    return Math.min(
      (factors.length * 0.3 + factors.keywords * 0.4 + factors.structure * 0.3),
      1
    );
  }

  /**
   * Count compliance-related keywords in explanation
   */
  private countComplianceKeywords(explanation: string): number {
    const keywords = [
      'protocol', 'procedure', 'policy', 'standard', 'guideline',
      'security', 'compliance', 'audit', 'monitoring', 'validation',
      'encryption', 'authentication', 'authorization', 'access control',
      'data protection', 'privacy', 'gdpr', 'sox', 'pci'
    ];

    const lowerExplanation = explanation.toLowerCase();
    return keywords.filter(keyword => lowerExplanation.includes(keyword)).length;
  }

  /**
   * Assess explanation structure quality
   */
  private assessExplanationStructure(explanation: string): number {
    let score = 0.5; // Base score

    // Check for structured elements
    if (explanation.includes('.')) score += 0.1; // Has sentences
    if (explanation.length > 50) score += 0.1; // Sufficient length
    if (explanation.includes('because') || explanation.includes('due to')) score += 0.1; // Has reasoning
    if (explanation.includes('follows') || explanation.includes('implements')) score += 0.1; // Shows action
    if (explanation.includes('ensures') || explanation.includes('provides')) score += 0.1; // Shows benefit

    return Math.min(score, 1);
  }

  /**
   * Determine risk level based on compliance and confidence
   */
  private determineRiskLevel(
    compliant: 'yes' | 'no',
    confidence: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (compliant === 'yes') {
      if (confidence >= 0.8) return 'low';
      if (confidence >= 0.6) return 'medium';
      return 'high';
    } else {
      if (confidence >= 0.8) return 'critical';
      if (confidence >= 0.6) return 'high';
      return 'medium';
    }
  }

  /**
   * Generate recommendations based on assessment
   */
  private generateRecommendations(
    compliant: 'yes' | 'no',
    questionType: string,
    explanation: string
  ): string[] {
    const recommendations: string[] = [];

    if (compliant === 'no') {
      switch (questionType) {
        case 'security':
          recommendations.push('Implement comprehensive security protocols');
          recommendations.push('Conduct regular security audits');
          recommendations.push('Establish incident response procedures');
          break;
        case 'seo':
          recommendations.push('Optimize website structure and content');
          recommendations.push('Implement proper meta tags and schema markup');
          recommendations.push('Improve page loading speed and mobile responsiveness');
          break;
        case 'aeo':
          recommendations.push('Optimize content for answer engine queries');
          recommendations.push('Implement FAQ schema and structured data');
          recommendations.push('Focus on featured snippet optimization');
          break;
        case 'ai_visibility':
          recommendations.push('Enhance AI assistant visibility through content optimization');
          recommendations.push('Implement proper structured data for AI consumption');
          recommendations.push('Monitor and improve AI platform citations');
          break;
        default:
          recommendations.push('Review and improve current practices');
          recommendations.push('Implement industry best practices');
      }
    } else {
      // Even if compliant, suggest improvements
      if (explanation.length < 100) {
        recommendations.push('Provide more detailed documentation of compliance measures');
      }
      recommendations.push('Consider implementing additional monitoring and validation');
    }

    return recommendations;
  }

  /**
   * Generate unique assessment ID
   */
  private generateAssessmentId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get compliance metrics for a tenant
   */
  async getComplianceMetrics(tenant_id: string): Promise<ComplianceMetrics> {
    // This would typically query the database
    // For now, return mock data
    return {
      total_assessments: 0,
      compliant_percentage: 0,
      risk_distribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      average_confidence: 0,
      last_assessment: new Date(),
    };
  }

  /**
   * Get cached assessment result
   */
  getCachedAssessment(assessment_id: string): ComplianceResult | undefined {
    return this.cache.get(assessment_id);
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const complianceEngine = new ComplianceAssessmentEngine();
