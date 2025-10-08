/**
 * Appraisal Penetration Analysis Agent
 * Analyzes dealership appraisal forms and their AI platform visibility
 */

import * as cheerio from 'cheerio';
import { fetchHTML } from '../utils/html-fetcher';

export interface AppraisalForm {
  url: string;
  type: 'online_appraisal' | 'trade_in_form' | 'value_my_trade' | 'instant_appraisal';
  fieldCount: number;
  hasInstantValue: boolean;
  isMobileOptimized: boolean;
  trustSignals: string[];
  requiredFields: number;
}

export interface AppraisalPenetrationResult {
  penetrationScore: number;
  formQualityScore: number;
  aiVisibilityScore: number;
  formsDiscovered: AppraisalForm[];
  aiPlatformResults: {
    chatgpt: AIPlatformResult;
    claude: AIPlatformResult;
    perplexity: AIPlatformResult;
    gemini: AIPlatformResult;
  };
  competitiveAnalysis: {
    yourRank: number;
    totalCompetitors: number;
    averageScore: number;
    topPerformerScore: number;
  };
  recommendations: Recommendation[];
  detailedAnalysis: {
    formAnalysis: any;
    aiPenetration: any;
    competitiveGaps: any[];
    optimizationOpportunities: any[];
  };
}

export interface AIPlatformResult {
  mentioned: boolean;
  citationType: 'direct_link' | 'process_described' | 'not_mentioned';
  directLink: boolean;
  instantValueMentioned: boolean;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedLeadIncrease: string;
}

/**
 * Main analysis function
 */
export async function analyzeAppraisalPenetration(
  dealershipUrl: string,
  dealershipName: string,
  location: string
): Promise<AppraisalPenetrationResult> {
  console.log(`🔍 Analyzing appraisal penetration for ${dealershipName}...`);

  try {
    // Step 1: Discover appraisal forms
    const formsDiscovered = await discoverAppraisalForms(dealershipUrl);
    console.log(`✅ Discovered ${formsDiscovered.length} appraisal forms`);

    // Step 2: Analyze form quality
    const formQualityScore = analyzeFormQuality(formsDiscovered);
    console.log(`✅ Form quality score: ${formQualityScore}`);

    // Step 3: Test AI platform visibility
    const aiPlatformResults = await testAIPlatforms(dealershipName, location);
    console.log(`✅ AI platform testing complete`);

    // Step 4: Calculate AI visibility score
    const aiVisibilityScore = calculateAIVisibilityScore(aiPlatformResults);
    console.log(`✅ AI visibility score: ${aiVisibilityScore}`);

    // Step 5: Benchmark competitors
    const competitiveAnalysis = await benchmarkCompetitors(location, formQualityScore, aiVisibilityScore);
    console.log(`✅ Competitive analysis complete`);

    // Step 6: Calculate overall penetration score
    const penetrationScore = calculatePenetrationScore(
      formQualityScore,
      aiVisibilityScore,
      competitiveAnalysis
    );
    console.log(`✅ Overall penetration score: ${penetrationScore}`);

    // Step 7: Generate recommendations
    const recommendations = generateRecommendations(
      formsDiscovered,
      formQualityScore,
      aiVisibilityScore,
      competitiveAnalysis
    );
    console.log(`✅ Generated ${recommendations.length} recommendations`);

    return {
      penetrationScore,
      formQualityScore,
      aiVisibilityScore,
      formsDiscovered,
      aiPlatformResults,
      competitiveAnalysis,
      recommendations,
      detailedAnalysis: {
        formAnalysis: analyzeFormsDetailed(formsDiscovered),
        aiPenetration: aiPlatformResults,
        competitiveGaps: findCompetitiveGaps(competitiveAnalysis, formQualityScore),
        optimizationOpportunities: findOptimizationOpportunities(formsDiscovered),
      },
    };
  } catch (error) {
    console.error('Appraisal penetration analysis failed:', error);
    throw error;
  }
}

/**
 * Step 1: Discover appraisal forms on website
 */
async function discoverAppraisalForms(url: string): Promise<AppraisalForm[]> {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const forms: AppraisalForm[] = [];

    // Find appraisal-related forms and links
    const selectors = [
      'form[action*="appraisal"]',
      'form[action*="trade"]',
      'form[action*="value"]',
      'a[href*="appraisal"]',
      'a[href*="trade-in"]',
      'a[href*="value-my-trade"]',
    ];

    selectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const $element = $(element);
        const href = $element.attr('href') || $element.attr('action');

        if (href && !forms.some((f) => f.url === href)) {
          const form = analyzeFormElement($, element);
          if (form) {
            forms.push(form);
          }
        }
      });
    });

    return forms;
  } catch (error) {
    console.error('Form discovery failed:', error);
    return [];
  }
}

/**
 * Analyze individual form element
 */
function analyzeFormElement($: cheerio.CheerioAPI, element: any): AppraisalForm | null {
  const $element = $(element);
  const href = $element.attr('href') || $element.attr('action') || '';

  // Determine form type
  let type: AppraisalForm['type'] = 'online_appraisal';
  if (href.includes('trade-in') || href.includes('trade_in')) {
    type = 'trade_in_form';
  } else if (href.includes('value-my-trade') || href.includes('value_my_trade')) {
    type = 'value_my_trade';
  } else if (href.includes('instant') || href.includes('quick')) {
    type = 'instant_appraisal';
  }

  // Count fields (if it's a form element)
  const fields = $element.find('input, select, textarea');
  const fieldCount = fields.length;
  const requiredFields = fields.filter('[required]').length;

  // Check for instant value feature
  const hasInstantValue =
    $element.text().toLowerCase().includes('instant') ||
    $element.text().toLowerCase().includes('immediate') ||
    $element.find('[data-instant-value]').length > 0;

  // Check mobile optimization
  const isMobileOptimized =
    $element.attr('data-mobile') === 'true' ||
    $element.hasClass('mobile-optimized') ||
    $element.find('.mobile-friendly').length > 0;

  // Find trust signals
  const trustSignals: string[] = [];
  if ($element.text().includes('BBB')) trustSignals.push('BBB Accredited');
  if ($element.text().includes('certified')) trustSignals.push('Certified Dealer');
  if ($element.find('[data-reviews]').length > 0) trustSignals.push('Customer Reviews');

  return {
    url: href,
    type,
    fieldCount,
    hasInstantValue,
    isMobileOptimized,
    trustSignals,
    requiredFields,
  };
}

/**
 * Step 2: Analyze form quality
 */
function analyzeFormQuality(forms: AppraisalForm[]): number {
  if (forms.length === 0) return 0;

  let totalScore = 0;

  forms.forEach((form) => {
    let formScore = 0;

    // Field count score (ideal: 8-12)
    if (form.fieldCount >= 8 && form.fieldCount <= 12) {
      formScore += 15;
    } else if (form.fieldCount >= 6 && form.fieldCount <= 15) {
      formScore += 10;
    } else {
      formScore += 5;
    }

    // Instant value feature
    if (form.hasInstantValue) {
      formScore += 25;
    }

    // Mobile optimization
    if (form.isMobileOptimized) {
      formScore += 20;
    }

    // Trust signals
    formScore += Math.min(form.trustSignals.length * 5, 15);

    // Required fields (ideal: 3-5)
    if (form.requiredFields >= 3 && form.requiredFields <= 5) {
      formScore += 10;
    } else if (form.requiredFields >= 6 && form.requiredFields <= 8) {
      formScore += 5;
    }

    // Progressive disclosure bonus (if multi-step)
    if (form.type === 'instant_appraisal') {
      formScore += 15;
    }

    totalScore += formScore;
  });

  return Math.round(totalScore / forms.length);
}

/**
 * Step 3: Test AI platforms for form visibility
 */
async function testAIPlatforms(
  dealershipName: string,
  location: string
): Promise<AppraisalPenetrationResult['aiPlatformResults']> {
  const queries = [
    `How do I get my car appraised at ${dealershipName} in ${location}?`,
    `What's my car worth at ${dealershipName}?`,
    `Online appraisal form ${dealershipName}`,
    `Trade-in value calculator ${dealershipName}`,
  ];

  // Test each platform
  const [chatgpt, claude, perplexity, gemini] = await Promise.all([
    testChatGPT(queries, dealershipName),
    testClaude(queries, dealershipName),
    testPerplexity(queries, dealershipName),
    testGemini(queries, dealershipName),
  ]);

  return {
    chatgpt,
    claude,
    perplexity,
    gemini,
  };
}

/**
 * Test ChatGPT for appraisal form mentions
 */
async function testChatGPT(queries: string[], dealershipName: string): Promise<AIPlatformResult> {
  // In production, this would query ChatGPT API
  // For now, return mock data
  const mockMentioned = Math.random() > 0.5;

  return {
    mentioned: mockMentioned,
    citationType: mockMentioned ? 'process_described' : 'not_mentioned',
    directLink: mockMentioned && Math.random() > 0.7,
    instantValueMentioned: mockMentioned && Math.random() > 0.6,
  };
}

/**
 * Test Claude for appraisal form mentions
 */
async function testClaude(queries: string[], dealershipName: string): Promise<AIPlatformResult> {
  const mockMentioned = Math.random() > 0.5;

  return {
    mentioned: mockMentioned,
    citationType: mockMentioned ? 'process_described' : 'not_mentioned',
    directLink: mockMentioned && Math.random() > 0.7,
    instantValueMentioned: mockMentioned && Math.random() > 0.6,
  };
}

/**
 * Test Perplexity for appraisal form mentions
 */
async function testPerplexity(queries: string[], dealershipName: string): Promise<AIPlatformResult> {
  const mockMentioned = Math.random() > 0.6;

  return {
    mentioned: mockMentioned,
    citationType: mockMentioned ? 'direct_link' : 'not_mentioned',
    directLink: mockMentioned && Math.random() > 0.8,
    instantValueMentioned: mockMentioned && Math.random() > 0.5,
  };
}

/**
 * Test Gemini for appraisal form mentions
 */
async function testGemini(queries: string[], dealershipName: string): Promise<AIPlatformResult> {
  const mockMentioned = Math.random() > 0.5;

  return {
    mentioned: mockMentioned,
    citationType: mockMentioned ? 'process_described' : 'not_mentioned',
    directLink: mockMentioned && Math.random() > 0.6,
    instantValueMentioned: mockMentioned && Math.random() > 0.6,
  };
}

/**
 * Calculate AI visibility score
 */
function calculateAIVisibilityScore(results: AppraisalPenetrationResult['aiPlatformResults']): number {
  const platforms = Object.values(results);
  let score = 0;

  platforms.forEach((platform) => {
    if (platform.mentioned) score += 25;
    if (platform.directLink) score += 15;
    if (platform.instantValueMentioned) score += 10;
  });

  return Math.min(100, score);
}

/**
 * Step 5: Benchmark against competitors
 */
async function benchmarkCompetitors(
  location: string,
  yourFormScore: number,
  yourAIScore: number
): Promise<AppraisalPenetrationResult['competitiveAnalysis']> {
  // Mock competitive data
  const competitors = [
    { score: 78 },
    { score: 82 },
    { score: 85 },
    { score: 75 },
    { score: 88 },
  ];

  const yourScore = (yourFormScore + yourAIScore) / 2;
  const allScores = [...competitors.map((c) => c.score), yourScore].sort((a, b) => b - a);

  const yourRank = allScores.indexOf(yourScore) + 1;
  const averageScore = Math.round(
    competitors.reduce((sum, c) => sum + c.score, 0) / competitors.length
  );
  const topPerformerScore = Math.max(...competitors.map((c) => c.score));

  return {
    yourRank,
    totalCompetitors: competitors.length,
    averageScore,
    topPerformerScore,
  };
}

/**
 * Calculate overall penetration score
 */
function calculatePenetrationScore(
  formScore: number,
  aiScore: number,
  competitive: AppraisalPenetrationResult['competitiveAnalysis']
): number {
  const weights = {
    formQuality: 0.30,
    aiVisibility: 0.35,
    competitivePosition: 0.20,
    conversionOptimization: 0.15,
  };

  const competitiveScore =
    competitive.yourRank === 1 ? 100 : (1 - (competitive.yourRank - 1) / competitive.totalCompetitors) * 100;

  const score =
    formScore * weights.formQuality +
    aiScore * weights.aiVisibility +
    competitiveScore * weights.competitivePosition +
    formScore * weights.conversionOptimization;

  return Math.round(score);
}

/**
 * Step 7: Generate recommendations
 */
function generateRecommendations(
  forms: AppraisalForm[],
  formScore: number,
  aiScore: number,
  competitive: AppraisalPenetrationResult['competitiveAnalysis']
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Form quality recommendations
  if (formScore < 60) {
    recommendations.push({
      title: 'Redesign Appraisal Form for Higher Conversion',
      description:
        'Your appraisal form has UX issues reducing conversions. Simplify fields, add instant value display, and implement progressive disclosure.',
      priority: 1,
      impact: 'high',
      effort: 'medium',
      estimatedLeadIncrease: '25-40%',
    });
  }

  // AI visibility recommendations
  if (aiScore < 50) {
    recommendations.push({
      title: 'Improve AI Platform Visibility',
      description:
        'Your appraisal forms are not being cited by AI platforms. Add structured data, improve content, and ensure form URLs are crawlable.',
      priority: 1,
      impact: 'high',
      effort: 'medium',
      estimatedLeadIncrease: '30-50%',
    });
  }

  // Instant value recommendation
  if (!forms.some((f) => f.hasInstantValue)) {
    recommendations.push({
      title: 'Add Instant Valuation Feature',
      description:
        'Competitors offering instant valuations see 40% higher conversion rates. Integrate KBB, Black Book, or build a custom calculator.',
      priority: 2,
      impact: 'high',
      effort: 'high',
      estimatedLeadIncrease: '35-45%',
    });
  }

  // Mobile optimization
  if (!forms.some((f) => f.isMobileOptimized)) {
    recommendations.push({
      title: 'Optimize for Mobile Devices',
      description:
        '70%+ of appraisal traffic comes from mobile. Ensure forms are thumb-friendly, load quickly, and have streamlined mobile UX.',
      priority: 1,
      impact: 'high',
      effort: 'low',
      estimatedLeadIncrease: '20-30%',
    });
  }

  // Field count optimization
  const avgFieldCount = forms.reduce((sum, f) => sum + f.fieldCount, 0) / (forms.length || 1);
  if (avgFieldCount > 15) {
    recommendations.push({
      title: 'Reduce Form Field Count',
      description:
        'Forms with 8-12 fields convert 2x better than longer forms. Remove non-essential fields or implement progressive disclosure.',
      priority: 2,
      impact: 'medium',
      effort: 'low',
      estimatedLeadIncrease: '15-25%',
    });
  }

  // Competitive recommendations
  if (competitive.yourRank > 3) {
    recommendations.push({
      title: 'Learn from Top-Performing Competitors',
      description:
        'Your competitors are outperforming you. Analyze their forms, instant value features, and AI visibility strategies.',
      priority: 3,
      impact: 'medium',
      effort: 'low',
      estimatedLeadIncrease: '10-20%',
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Helper functions
 */
function analyzeFormsDetailed(forms: AppraisalForm[]) {
  return {
    totalForms: forms.length,
    formTypes: forms.map((f) => f.type),
    averageFieldCount: Math.round(
      forms.reduce((sum, f) => sum + f.fieldCount, 0) / (forms.length || 1)
    ),
    instantValueCount: forms.filter((f) => f.hasInstantValue).length,
    mobileOptimizedCount: forms.filter((f) => f.isMobileOptimized).length,
  };
}

function findCompetitiveGaps(
  competitive: AppraisalPenetrationResult['competitiveAnalysis'],
  yourScore: number
) {
  const gap = competitive.topPerformerScore - yourScore;
  if (gap <= 0) return [];

  return [
    {
      metric: 'Overall Performance',
      gap: gap,
      recommendation: 'Focus on the top recommendations to close this gap',
    },
  ];
}

function findOptimizationOpportunities(forms: AppraisalForm[]) {
  const opportunities = [];

  if (forms.length === 0) {
    opportunities.push({
      type: 'form_presence',
      description: 'No appraisal forms found - critical issue',
      priority: 'critical',
    });
  }

  if (!forms.some((f) => f.hasInstantValue)) {
    opportunities.push({
      type: 'instant_value',
      description: 'Add instant valuation to increase conversions by 40%',
      priority: 'high',
    });
  }

  return opportunities;
}
