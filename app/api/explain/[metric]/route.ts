import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Metric definitions and explanations
const METRIC_DEFINITIONS: Record<string, {
  name: string;
  description: string;
  formula?: string;
  interpretation: string[];
  recommendations: string[];
  benchmarks?: { poor: string; average: string; excellent: string };
}> = {
  'ai-visibility-score': {
    name: 'AI Visibility Score',
    description: 'Composite score measuring your dealership\'s presence across major AI platforms (ChatGPT, Claude, Perplexity, Gemini)',
    formula: '(ChatGPT_rank + Claude_rank + Perplexity_rank + Gemini_rank) / 4 * 100',
    interpretation: [
      'Scores 80-100: Excellent visibility across all AI platforms',
      'Scores 60-79: Good visibility with room for improvement',
      'Scores 40-59: Moderate visibility, optimization needed',
      'Scores below 40: Poor visibility, immediate action required'
    ],
    recommendations: [
      'Improve online review quantity and quality',
      'Ensure NAP (Name, Address, Phone) consistency across all platforms',
      'Create high-quality content that answers common customer questions',
      'Build authoritative backlinks from automotive industry sources',
      'Optimize Google Business Profile with complete information'
    ],
    benchmarks: {
      poor: '< 40',
      average: '40-79',
      excellent: '80-100'
    }
  },

  'chatgpt-ranking': {
    name: 'ChatGPT Ranking',
    description: 'Your dealership\'s ranking when users ask ChatGPT for car dealership recommendations in your area',
    interpretation: [
      'Rank 1-3: Excellent - You\'re a top recommendation',
      'Rank 4-7: Good - Visible but could improve',
      'Rank 8-10: Moderate - Need optimization',
      'Not ranked: Poor - Critical visibility issues'
    ],
    recommendations: [
      'Increase Google review count to 200+',
      'Maintain 4.5+ star average rating',
      'Respond to all reviews within 24 hours',
      'Create FAQ content addressing common buyer questions',
      'Build local citations and business listings'
    ]
  },

  'revenue-at-risk': {
    name: 'Revenue at Risk',
    description: 'Estimated monthly revenue lost due to poor AI search visibility',
    formula: 'AI_search_volume * conversion_rate * avg_deal_value * visibility_gap',
    interpretation: [
      'Based on local market AI search volume',
      'Calculated using your current visibility score vs. top performers',
      'Assumes industry-average conversion rates (2-4%)',
      'Uses your dealership\'s average vehicle sale price'
    ],
    recommendations: [
      'Prioritize high-ROI optimization tactics first',
      'Track improvements monthly to measure ROI',
      'Focus on platforms with highest search volume in your market',
      'Consider this vs. traditional advertising costs'
    ],
    benchmarks: {
      poor: '> $50,000/mo',
      average: '$20,000-$50,000/mo',
      excellent: '< $20,000/mo'
    }
  },

  'review-sentiment': {
    name: 'Review Sentiment Score',
    description: 'AI-powered analysis of customer sentiment in your online reviews',
    formula: '(Positive_mentions - Negative_mentions) / Total_mentions * 100',
    interpretation: [
      'Scores 80-100: Overwhelmingly positive customer sentiment',
      'Scores 60-79: Generally positive with some concerns',
      'Scores 40-59: Mixed sentiment, improvement needed',
      'Scores below 40: Negative sentiment, urgent action required'
    ],
    recommendations: [
      'Address negative feedback patterns immediately',
      'Train staff on common customer pain points',
      'Implement post-sale follow-up process',
      'Showcase positive reviews in marketing',
      'Use feedback to improve processes'
    ]
  },

  'response-rate': {
    name: 'Review Response Rate',
    description: 'Percentage of customer reviews you\'ve responded to',
    formula: 'Responded_reviews / Total_reviews * 100',
    interpretation: [
      '90-100%: Excellent engagement',
      '70-89%: Good engagement',
      '50-69%: Needs improvement',
      'Below 50%: Poor engagement'
    ],
    recommendations: [
      'Respond to all reviews within 24 hours',
      'Thank positive reviewers personally',
      'Address negative reviews professionally and offer solutions',
      'Use review responses to showcase customer service',
      'Set up automated alerts for new reviews'
    ],
    benchmarks: {
      poor: '< 50%',
      average: '50-89%',
      excellent: '90-100%'
    }
  },

  'avg-response-time': {
    name: 'Average Response Time',
    description: 'How quickly you respond to customer reviews',
    interpretation: [
      '< 24 hours: Excellent',
      '24-48 hours: Good',
      '48-72 hours: Fair',
      '> 72 hours: Poor'
    ],
    recommendations: [
      'Set up real-time review notifications',
      'Assign team member responsible for review responses',
      'Create response templates for common scenarios',
      'Prioritize negative reviews for immediate response',
      'Use automation tools for faster response times'
    ]
  },

  'citation-consistency': {
    name: 'Citation Consistency',
    description: 'How consistent your NAP (Name, Address, Phone) information is across the web',
    formula: 'Matching_citations / Total_citations * 100',
    interpretation: [
      '95-100%: Excellent consistency',
      '85-94%: Good consistency',
      '75-84%: Inconsistencies present',
      'Below 75%: Major inconsistencies hurting visibility'
    ],
    recommendations: [
      'Audit all business listings',
      'Standardize business name format',
      'Use consistent phone number format',
      'Ensure address matches exactly across all platforms',
      'Claim and update all directory listings'
    ]
  },

  'trust-score': {
    name: 'Algorithmic Trust Score',
    description: 'How much the AI ecosystem believes what your dealership publishes, based on E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)',
    formula: 'Weighted average of schema accuracy, citation consistency, review authenticity, content quality, and backlink authority',
    interpretation: [
      'Scores 90-100: Excellent - AI platforms highly trust your information',
      'Scores 75-89: Good - Strong trust signals with minor improvement areas',
      'Scores 60-74: Moderate - Trust issues affecting AI recommendations',
      'Scores below 60: Poor - Critical trust deficits hurting visibility'
    ],
    recommendations: [
      'Implement accurate AutoDealer schema markup on all pages',
      'Ensure NAP consistency across 100+ citation sources',
      'Maintain authentic, non-incentivized customer reviews',
      'Create expert content demonstrating automotive knowledge',
      'Build authoritative backlinks from industry publications',
      'Keep business information updated in real-time',
      'Respond professionally to all customer feedback'
    ],
    benchmarks: {
      poor: '< 60',
      average: '60-89',
      excellent: '90-100'
    }
  }
};

/**
 * Metric Explanation Endpoint
 * GET /api/explain/[metric]
 */
export async function GET(
  req: Request,
  { params }: { params: { metric: string } }
) {
  try {
    const { metric } = params;
    const normalizedMetric = metric.toLowerCase();

    // Check if metric exists
    const metricData = METRIC_DEFINITIONS[normalizedMetric];

    if (!metricData) {
      // Return available metrics if not found
      const availableMetrics = Object.keys(METRIC_DEFINITIONS);
      return NextResponse.json({
        error: 'Metric not found',
        available_metrics: availableMetrics,
        message: `Valid metrics: ${availableMetrics.join(', ')}`
      }, { status: 404 });
    }

    return NextResponse.json({
      metric: normalizedMetric,
      ...metricData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Explain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Get all available metrics
 * GET /api/explain
 */
export async function OPTIONS() {
  const metrics = Object.entries(METRIC_DEFINITIONS).map(([key, value]) => ({
    metric: key,
    name: value.name,
    description: value.description
  }));

  return NextResponse.json({
    available_metrics: metrics,
    count: metrics.length
  });
}
