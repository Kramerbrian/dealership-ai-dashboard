import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * API Endpoint: /api/explain/shap
 * Provides SHAP-style explainability for AIV model decisions
 * Uses GPT to analyze model weights and generate actionable insights
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SHAPDriver {
  factor: string;
  impact_percent: number;
  direction: 'positive' | 'negative';
  current_value: number;
  recommendation: string;
  actionable_steps: string[];
  confidence_score: number;
}

export async function POST(request: NextRequest) {
  try {
    const { dealerId, timeWindow = '8_weeks' } = await request.json();

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing required field: dealerId' },
        { status: 400 }
      );
    }

    console.log(`🧠 Generating SHAP-style explanation for dealer: ${dealerId}`);

    // Get model weights and recent performance data
    const { data: modelWeights, error: weightsError } = await supabase
      .from('model_weights')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    if (weightsError) {
      console.error('❌ Error fetching model weights:', weightsError);
      return NextResponse.json(
        { error: 'Failed to fetch model weights', details: weightsError.message },
        { status: 500 }
      );
    }

    // Get recent audit data for trend analysis
    const { data: auditData, error: auditError } = await supabase
      .from('model_audit')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('run_date', { ascending: false })
      .limit(8);

    if (auditError) {
      console.error('❌ Error fetching audit data:', auditError);
    }

    // Get recent AIV component scores
    const { data: aivScores, error: scoresError } = await supabase
      .from('aiv_scores')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .limit(30); // Last 30 days

    if (scoresError) {
      console.error('❌ Error fetching AIV scores:', scoresError);
    }

    // Prepare data for GPT analysis
    const analysisData = {
      model_weights: modelWeights,
      recent_performance: auditData?.[0] || null,
      performance_trends: calculateTrends(auditData || []),
      aiv_components: aivScores || [],
      time_window: timeWindow
    };

    // Generate SHAP-style explanation using GPT
    const explanation = await generateSHAPExplanation(analysisData);

    return NextResponse.json({
      success: true,
      dealerId,
      explanation,
      data_summary: {
        model_version: modelWeights?.version || '1.0',
        last_updated: modelWeights?.updated_at,
        analysis_period: timeWindow,
        data_points: auditData?.length || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ SHAP explanation API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate SHAP explanation', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generate SHAP-style explanation using GPT
 */
async function generateSHAPExplanation(data: any): Promise<SHAPDriver[]> {
  const prompt = `
You are an AI analyst specializing in algorithmic visibility optimization for automotive dealerships. 

Given the following model data, analyze the top 5 factors that most significantly impact AI Visibility (AIV) performance:

MODEL WEIGHTS:
- SEO Visibility: ${data.model_weights?.seo_visibility || 0.30}
- AEO Visibility: ${data.model_weights?.aeo_visibility || 0.35}  
- GEO Visibility: ${data.model_weights?.geo_visibility || 0.35}
- Experience: ${data.model_weights?.experience || 0.25}
- Expertise: ${data.model_weights?.expertise || 0.25}
- Authoritativeness: ${data.model_weights?.authoritativeness || 0.25}
- Trustworthiness: ${data.model_weights?.trustworthiness || 0.25}

RECENT PERFORMANCE:
- R²: ${data.recent_performance?.r2 || 'N/A'}
- RMSE: ${data.recent_performance?.rmse || 'N/A'}
- Accuracy Gain: ${data.recent_performance?.accuracy_gain_percent || 'N/A'}%
- ROI Gain: ${data.recent_performance?.roi_gain_percent || 'N/A'}%

PERFORMANCE TRENDS:
- R² Trend: ${data.performance_trends?.r2_trend || 0}%
- RMSE Trend: ${data.performance_trends?.rmse_trend || 0}%
- Accuracy Trend: ${data.performance_trends?.accuracy_trend || 0}%
- ROI Trend: ${data.performance_trends?.roi_trend || 0}%

For each of the top 5 factors, provide:
1. Factor name (specific, actionable)
2. Impact percentage (how much it affects AIV)
3. Direction (positive/negative influence)
4. Current value/status
5. Specific recommendation
6. 2-3 actionable steps
7. Confidence score (0-100)

Focus on factors that dealerships can actually control and improve. Prioritize high-impact, actionable insights.

Return as JSON array with this exact structure:
[
  {
    "factor": "Local SEO Optimization",
    "impact_percent": 23.5,
    "direction": "positive",
    "current_value": 67.2,
    "recommendation": "Optimize Google My Business profile and local citations",
    "actionable_steps": [
      "Update GMB hours, photos, and services",
      "Claim and optimize local directory listings",
      "Encourage customer reviews with photos"
    ],
    "confidence_score": 87
  }
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert AI analyst for automotive dealership visibility optimization. Provide precise, actionable insights based on model data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from GPT');
    }

    // Parse JSON response
    const drivers = JSON.parse(responseText);
    
    // Validate and enhance the response
    return drivers.map((driver: any, index: number) => ({
      factor: driver.factor || `Factor ${index + 1}`,
      impact_percent: Math.max(0, Math.min(100, driver.impact_percent || 0)),
      direction: driver.direction || 'positive',
      current_value: driver.current_value || 0,
      recommendation: driver.recommendation || 'No specific recommendation available',
      actionable_steps: Array.isArray(driver.actionable_steps) ? driver.actionable_steps : [],
      confidence_score: Math.max(0, Math.min(100, driver.confidence_score || 0))
    }));

  } catch (error) {
    console.error('❌ Error generating GPT explanation:', error);
    
    // Fallback to rule-based explanation
    return generateFallbackExplanation(data);
  }
}

/**
 * Generate fallback explanation when GPT fails
 */
function generateFallbackExplanation(data: any): SHAPDriver[] {
  const weights = data.model_weights || {};
  
  return [
    {
      factor: "AEO Visibility Optimization",
      impact_percent: (weights.aeo_visibility || 0.35) * 100,
      direction: "positive",
      current_value: 75.0,
      recommendation: "Focus on AI platform presence and citation quality",
      actionable_steps: [
        "Optimize for ChatGPT and Claude queries",
        "Improve answer completeness in AI responses",
        "Monitor sentiment across AI platforms"
      ],
      confidence_score: 85
    },
    {
      factor: "GEO Visibility Enhancement",
      impact_percent: (weights.geo_visibility || 0.35) * 100,
      direction: "positive",
      current_value: 68.0,
      recommendation: "Improve local search and Google SGE presence",
      actionable_steps: [
        "Optimize for Google SGE and featured snippets",
        "Enhance local pack visibility",
        "Improve zero-click search dominance"
      ],
      confidence_score: 82
    },
    {
      factor: "SEO Foundation Strengthening",
      impact_percent: (weights.seo_visibility || 0.30) * 100,
      direction: "positive",
      current_value: 72.0,
      recommendation: "Build stronger organic search foundation",
      actionable_steps: [
        "Improve organic rankings for target keywords",
        "Increase branded search volume share",
        "Build high-authority backlinks"
      ],
      confidence_score: 80
    },
    {
      factor: "Trustworthiness Signals",
      impact_percent: (weights.trustworthiness || 0.25) * 100,
      direction: "positive",
      current_value: 65.0,
      recommendation: "Enhance trust and credibility signals",
      actionable_steps: [
        "Improve review authenticity and response rate",
        "Enhance BBB rating and complaint resolution",
        "Strengthen security and transparency"
      ],
      confidence_score: 78
    },
    {
      factor: "Experience Documentation",
      impact_percent: (weights.experience || 0.25) * 100,
      direction: "positive",
      current_value: 70.0,
      recommendation: "Better showcase customer experience",
      actionable_steps: [
        "Add more verified customer testimonials",
        "Document dealership tenure and history",
        "Create authentic photo and video content"
      ],
      confidence_score: 75
    }
  ];
}

/**
 * Calculate performance trends from audit data
 */
function calculateTrends(auditData: any[]) {
  if (auditData.length < 2) {
    return {
      r2_trend: 0,
      rmse_trend: 0,
      accuracy_trend: 0,
      roi_trend: 0
    };
  }

  const latest = auditData[0];
  const previous = auditData[1];

  return {
    r2_trend: previous.r2 ? ((latest.r2 - previous.r2) / previous.r2) * 100 : 0,
    rmse_trend: previous.rmse ? ((latest.rmse - previous.rmse) / previous.rmse) * 100 : 0,
    accuracy_trend: latest.accuracy_gain_percent || 0,
    roi_trend: latest.roi_gain_percent || 0
  };
}

/**
 * API Endpoint: GET /api/explain/shap
 * Get cached SHAP explanation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing dealerId parameter' },
        { status: 400 }
      );
    }

    // Check for cached explanation
    const { data: cachedExplanation, error } = await supabase
      .from('shap_explanations')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !cachedExplanation) {
      return NextResponse.json(
        { error: 'No cached explanation found. Use POST to generate one.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dealerId,
      explanation: cachedExplanation.explanation_data,
      cached_at: cachedExplanation.created_at,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching cached explanation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch explanation', details: error.message },
      { status: 500 }
    );
  }
}
