import { NextRequest, NextResponse } from 'next/server';

// Import types (not hooks - edge runtime doesn't support React hooks)
interface AIVInputs {
  dealerId: string;
  platform_scores: Record<string, number>;
  google_aio_inclusion_rate: number;
  ugc_health_score: number;
  schema_coverage_ratio: number;
  semantic_clarity_score: number;
  silo_integrity_score: number;
  authority_depth_index: number;
  temporal_weight: number;
  entity_confidence: number;
  crawl_budget_mult: number;
  inventory_truth_mult: number;
  ctr_delta: number;
  conversion_delta: number;
  avg_gross_per_unit: number;
  monthly_opportunities: number;
}

/**
 * Chat Agent Visibility API
 * 
 * Provides AIV™ context for conversational AI responses.
 * Injects chat_summary into LLM prompt context for contextual responses.
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface VisibilityRequest {
  dealerId: string;
  query?: string;
}

interface VisibilityResponse {
  dealerId: string;
  AIV_summary: string;
  AIV_score: number;
  AIVR_score: number;
  Revenue_at_Risk_USD: number;
  context: {
    platform_scores?: Record<string, number>;
    recommendations?: string[];
  };
  response_template?: string;
}

/**
 * Calculate AIV metrics server-side (for edge runtime compatibility)
 */
function calculateAIV(inputs: AIVInputs) {
  // AIV_core proxy from platform visibility
  const platformScoreValues = Object.values(inputs.platform_scores);
  const avgPlatform = platformScoreValues.length > 0
    ? platformScoreValues.reduce((a, b) => a + b, 0) / platformScoreValues.length
    : 0;

  const AIV_core =
    0.25 * avgPlatform + // SEO
    0.3 * inputs.google_aio_inclusion_rate +
    0.25 * (inputs.ugc_health_score / 100) +
    0.1 * inputs.schema_coverage_ratio +
    0.05 * inputs.entity_confidence;

  const AIV_sel =
    0.35 * inputs.semantic_clarity_score +
    0.35 * inputs.silo_integrity_score +
    0.3 * inputs.schema_coverage_ratio;

  const AIV_mods =
    inputs.temporal_weight *
    inputs.entity_confidence *
    inputs.crawl_budget_mult *
    inputs.inventory_truth_mult;

  let AIV = AIV_core * AIV_mods * (1 + 0.25 * Math.min(1, AIV_sel));
  if (AIV > 1) AIV = 1; // clamp upper bound

  // ROI Layer
  const AIVR = AIV * (1 + inputs.ctr_delta + inputs.conversion_delta);
  const revenueAtRisk =
    ((1 - AIV) * inputs.monthly_opportunities * inputs.avg_gross_per_unit);

  const chatSummary = `Your current AIV™ is ${(AIV * 100).toFixed(
    1
  )}% and AIVR™ is ${(AIVR * 100).toFixed(
    1
  )}%, representing an estimated $${revenueAtRisk.toLocaleString()} in monthly revenue at risk.`;

  return {
    AIV_score: parseFloat(AIV.toFixed(3)),
    AIVR_score: parseFloat(AIVR.toFixed(3)),
    Revenue_at_Risk_USD: Math.round(revenueAtRisk),
    chat_summary: chatSummary,
  };
}

/**
 * GET /api/agent/visibility
 * 
 * Returns AIV context for chat agent
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dealerId = searchParams.get('dealerId') || 'current';

    // Fetch dealer data (you can replace this with your actual data source)
    let inputs: AIVInputs;

    try {
      // Try to fetch from your AI scores API
      const scoresResponse = await fetch(
        `${request.nextUrl.origin}/api/ai-scores?dealerId=${dealerId}`,
        {
          headers: {
            'Cookie': request.headers.get('Cookie') || '',
          },
        }
      );

      if (scoresResponse.ok) {
        const data = await scoresResponse.json();
        inputs = data as AIVInputs;
      } else {
        // Fallback to demo data
        inputs = getFallbackInputs(dealerId);
      }
    } catch (error) {
      console.error('Failed to fetch dealer data:', error);
      inputs = getFallbackInputs(dealerId);
    }

    // Calculate AIV metrics
    const results = calculateAIV(inputs);

    // Generate recommendations based on score
    const recommendations = generateRecommendations(results.AIV_score, inputs);

    const response: VisibilityResponse = {
      dealerId,
      AIV_summary: results.chat_summary,
      AIV_score: results.AIV_score,
      AIVR_score: results.AIVR_score,
      Revenue_at_Risk_USD: results.Revenue_at_Risk_USD,
      context: {
        platform_scores: inputs.platform_scores,
        recommendations,
      },
      response_template: `Your AI visibility health check shows: ${results.chat_summary}`,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Visibility API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch visibility context',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/visibility
 * 
 * Accepts custom inputs for AIV calculation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<AIVInputs>;
    const dealerId = body.dealerId || 'current';

    // Merge with defaults
    const inputs: AIVInputs = {
      dealerId,
      platform_scores: body.platform_scores || {},
      google_aio_inclusion_rate: body.google_aio_inclusion_rate || 0,
      ugc_health_score: body.ugc_health_score || 0,
      schema_coverage_ratio: body.schema_coverage_ratio || 0,
      semantic_clarity_score: body.semantic_clarity_score || 0,
      silo_integrity_score: body.silo_integrity_score || 0,
      authority_depth_index: body.authority_depth_index || 0,
      temporal_weight: body.temporal_weight || 1.0,
      entity_confidence: body.entity_confidence || 0.8,
      crawl_budget_mult: body.crawl_budget_mult || 1.0,
      inventory_truth_mult: body.inventory_truth_mult || 1.0,
      ctr_delta: body.ctr_delta || 0,
      conversion_delta: body.conversion_delta || 0,
      avg_gross_per_unit: body.avg_gross_per_unit || 1200,
      monthly_opportunities: body.monthly_opportunities || 450,
    };

    // Calculate AIV metrics
    const results = calculateAIV(inputs);

    // Generate recommendations
    const recommendations = generateRecommendations(results.AIV_score, inputs);

    const response: VisibilityResponse = {
      dealerId,
      AIV_summary: results.chat_summary,
      AIV_score: results.AIV_score,
      AIVR_score: results.AIVR_score,
      Revenue_at_Risk_USD: results.Revenue_at_Risk_USD,
      context: {
        platform_scores: inputs.platform_scores,
        recommendations,
      },
      response_template: `Your AI visibility health check shows: ${results.chat_summary}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Visibility API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate visibility metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on AIV score
 */
function generateRecommendations(AIV_score: number, inputs: AIVInputs): string[] {
  const recommendations: string[] = [];

  if (AIV_score < 0.6) {
    recommendations.push('Improve schema coverage to enhance AI platform visibility');
    recommendations.push('Optimize semantic clarity scores for better AI understanding');
    recommendations.push('Increase Google AIO inclusion rate through structured data');
  } else if (AIV_score < 0.8) {
    recommendations.push('Maintain current schema coverage and focus on UGC health');
    recommendations.push('Consider expanding platform-specific optimizations');
  } else {
    recommendations.push('Excellent visibility - maintain current optimization strategies');
    recommendations.push('Focus on ROI improvements through CTR and conversion optimization');
  }

  if (inputs.schema_coverage_ratio < 0.8) {
    recommendations.push('Schema coverage below optimal - implement missing structured data');
  }

  if (inputs.google_aio_inclusion_rate < 0.5) {
    recommendations.push('Google AI Overview inclusion rate needs improvement');
  }

  return recommendations;
}

/**
 * Fallback inputs for demo/error states
 */
function getFallbackInputs(dealerId: string): AIVInputs {
  return {
    dealerId,
    platform_scores: {
      chatgpt: 0.86,
      claude: 0.82,
      gemini: 0.84,
      perplexity: 0.78,
      copilot: 0.75,
      grok: 0.70,
    },
    google_aio_inclusion_rate: 0.62,
    ugc_health_score: 84,
    schema_coverage_ratio: 0.91,
    semantic_clarity_score: 0.88,
    silo_integrity_score: 0.82,
    authority_depth_index: 0.87,
    temporal_weight: 1.05,
    entity_confidence: 0.96,
    crawl_budget_mult: 0.98,
    inventory_truth_mult: 1.0,
    ctr_delta: 0.094,
    conversion_delta: 0.047,
    avg_gross_per_unit: 1200,
    monthly_opportunities: 450,
  };
}

