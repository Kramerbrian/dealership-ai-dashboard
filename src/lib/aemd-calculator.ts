// AEMD Calculator - AI Enhanced Marketing Data
// Answer Engine Market Dominance Analysis

export interface AEMDInputs {
  fsCaptureShare: number; // Featured Snippet capture share (0-1)
  aioCitationShare: number; // AI Overview citation share (0-1)
  paaBoxOwnership: number; // PAA Box ownership count (≥0)
  competitorAEMDAvg: number; // Competitor average AEMD score (0-100)
  defensiveWeight: number; // Defensive weight multiplier (1.0-2.0)
  eEATTrustAlpha: number; // E-E-A-T trust factor (0-1)
}

export interface AEMDCalculation {
  rawScore: number;
  aemdScore: number; // Final score (0-100)
  componentScores: {
    fsScore: number;
    aioScore: number;
    paaScore: number;
  };
}

export interface PrescriptiveAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string[];
  expectedImpact: string;
  timeframe: string;
}

export interface AEMDAnalysis {
  calculation: AEMDCalculation;
  prescriptiveActions: PrescriptiveAction[];
  competitivePosition: 'dominant' | 'competitive' | 'behind';
  recommendations: string[];
  nextSteps: string[];
}

export function analyzeAEMD(inputs: AEMDInputs): AEMDAnalysis {
  // Calculate component scores
  const fsScore = inputs.fsCaptureShare * 100;
  const aioScore = inputs.aioCitationShare * 100;
  const paaScore = Math.min(inputs.paaBoxOwnership * 20, 100); // Cap at 100

  // Calculate raw score
  const rawScore = (fsScore * 0.4) + (aioScore * 0.4) + (paaScore * 0.2);

  // Apply defensive weight
  const defensiveScore = rawScore * inputs.defensiveWeight;

  // Apply E-E-A-T trust factor
  const finalScore = defensiveScore * inputs.eEATTrustAlpha;

  // Cap at 100
  const aemdScore = Math.min(finalScore, 100);

  const calculation: AEMDCalculation = {
    rawScore,
    aemdScore,
    componentScores: {
      fsScore,
      aioScore,
      paaScore
    }
  };

  // Determine competitive position
  let competitivePosition: 'dominant' | 'competitive' | 'behind';
  if (aemdScore > inputs.competitorAEMDAvg + 10) {
    competitivePosition = 'dominant';
  } else if (aemdScore >= inputs.competitorAEMDAvg - 10) {
    competitivePosition = 'competitive';
  } else {
    competitivePosition = 'behind';
  }

  // Generate prescriptive actions
  const prescriptiveActions: PrescriptiveAction[] = [];

  if (fsScore < 60) {
    prescriptiveActions.push({
      action: 'Improve Featured Snippet Capture',
      priority: 'high',
      description: 'Optimize content structure and formatting for featured snippets',
      implementation: [
        'Use question-answer format in content',
        'Add structured data markup',
        'Optimize for long-tail keywords',
        'Create comprehensive FAQ sections'
      ],
      expectedImpact: 'Increase featured snippet capture by 20-30%',
      timeframe: '2-4 weeks'
    });
  }

  if (aioScore < 60) {
    prescriptiveActions.push({
      action: 'Enhance AI Overview Citations',
      priority: 'high',
      description: 'Improve content authority and citation potential',
      implementation: [
        'Create authoritative, comprehensive content',
        'Build high-quality backlinks',
        'Optimize for E-E-A-T factors',
        'Use expert quotes and citations'
      ],
      expectedImpact: 'Increase AI Overview citations by 25-40%',
      timeframe: '4-6 weeks'
    });
  }

  if (paaScore < 40) {
    prescriptiveActions.push({
      action: 'Increase PAA Box Ownership',
      priority: 'medium',
      description: 'Target People Also Ask questions with optimized content',
      implementation: [
        'Research PAA questions for target keywords',
        'Create dedicated content for each PAA question',
        'Use question-answer format',
        'Optimize for featured snippet eligibility'
      ],
      expectedImpact: 'Increase PAA ownership by 15-25%',
      timeframe: '3-5 weeks'
    });
  }

  if (inputs.eEATTrustAlpha < 0.7) {
    prescriptiveActions.push({
      action: 'Strengthen E-E-A-T Trust Signals',
      priority: 'high',
      description: 'Improve expertise, experience, authoritativeness, and trustworthiness',
      implementation: [
        'Add author bios and credentials',
        'Include case studies and testimonials',
        'Display industry certifications',
        'Add contact information and business details'
      ],
      expectedImpact: 'Improve trust signals and AI confidence',
      timeframe: '2-3 weeks'
    });
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (aemdScore < 50) {
    recommendations.push('Focus on foundational SEO improvements before advanced AEO strategies');
  } else if (aemdScore < 75) {
    recommendations.push('Implement targeted AEO optimizations for specific high-value queries');
  } else {
    recommendations.push('Maintain current performance and explore advanced AI search features');
  }

  if (competitivePosition === 'behind') {
    recommendations.push('Prioritize competitive analysis and gap identification');
  }

  // Generate next steps
  const nextSteps: string[] = [
    'Review and prioritize prescriptive actions based on business goals',
    'Set up monitoring and tracking for AEMD metrics',
    'Schedule regular competitive analysis reviews',
    'Implement content optimization based on AI search patterns'
  ];

  return {
    calculation,
    prescriptiveActions,
    competitivePosition,
    recommendations,
    nextSteps
  };
}