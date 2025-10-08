import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Service token for GPT system access
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// RBAC roles and capabilities
const ROLE_CAPABILITIES = {
  'role:admin': ['full'],
  'role:manager': ['read', 'prioritize'],
  'role:marketing': ['view_aoer', 'view_tasks'],
  'role:system': ['compute_metrics', 'access_tenant_data'], // GPT service token
} as const;

interface GPTRunRequest {
  prompt: string;
  tenantId: string;
  analysisType?: 'comprehensive' | 'aiv' | 'ati' | 'elasticity' | 'shap';
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export async function POST(request: NextRequest) {
  try {
    const body: GPTRunRequest = await request.json();
    const { prompt, tenantId, analysisType = 'comprehensive', reasoningEffort = 'medium' } = body;

    // Verify service token (GPT acts under role:system)
    const authHeader = request.headers.get('authorization');
    const serviceToken = request.headers.get('x-service-token');
    
    if (!serviceToken || serviceToken !== process.env.GPT_SERVICE_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid service token' },
        { status: 401 }
      );
    }

    console.log(`🤖 GPT service request for tenant ${tenantId}`);

    // Get tenant data with service token (bypasses RLS)
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenantData) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get AOER and AIV metrics for the tenant
    const { data: aoerData } = await supabase
      .from('aoer_summary')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    const { data: aivData } = await supabase
      .from('aiv_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    const { data: atiData } = await supabase
      .from('ati_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    const { data: elasticityData } = await supabase
      .from('elasticity_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    // Prepare context for GPT-5
    const context = {
      tenant: {
        id: tenantId,
        name: tenantData.name,
        type: tenantData.type,
        subscription_tier: tenantData.subscription_tier,
      },
      metrics: {
        aoer: aoerData,
        aiv: aivData,
        ati: atiData,
        elasticity: elasticityData,
      },
      analysisType,
      timestamp: new Date().toISOString(),
    };

    // Create comprehensive instructions for GPT-5
    const instructions = createGPT5Instructions(tenantId, context, analysisType);

    // Call GPT-5 with reasoning
    const run = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: { effort: reasoningEffort },
      instructions,
      metadata: {
        tenantId,
        analysisType,
        serviceToken: 'role:system',
        timestamp: new Date().toISOString(),
      },
    });

    // Parse GPT-5 response
    const analysis = parseGPT5Response(run.output_text);

    // Store the analysis results in Supabase
    const { error: storeError } = await supabase
      .from('gpt_analysis_results')
      .insert({
        tenant_id: tenantId,
        analysis_type: analysisType,
        prompt: prompt,
        gpt_response: run.output_text,
        reasoning: run.reasoning,
        computed_metrics: analysis.metrics,
        recommendations: analysis.recommendations,
        created_at: new Date().toISOString(),
      });

    if (storeError) {
      console.error('Error storing GPT analysis:', storeError);
    }

    // Return structured response
    const response = {
      data: {
        aiv: analysis.metrics.aiv || aivData?.final_aiv || 0,
        ati: analysis.metrics.ati || atiData?.final_ati || 0,
        crs: analysis.metrics.crs || ((analysis.metrics.aiv || 0) + (analysis.metrics.ati || 0)) / 2,
        elasticity: analysis.metrics.elasticity || elasticityData?.elasticity || 0,
        r2: analysis.metrics.r2 || elasticityData?.r_squared || 0,
        drivers: analysis.metrics.drivers || {
          aiv: [],
          ati: []
        },
        regime: analysis.metrics.regime || 'Normal',
        confidenceInterval: analysis.metrics.confidenceInterval || [0, 0],
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        tenantId,
        analysisType,
        reasoning: run.reasoning,
        gptModel: 'gpt-5',
        timestamp: new Date().toISOString(),
      }
    };

    console.log(`✅ GPT analysis completed for tenant ${tenantId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('GPT proxy error:', error);
    
    return NextResponse.json(
      {
        error: 'GPT analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function createGPT5Instructions(
  tenantId: string,
  context: any,
  analysisType: string
): string {
  return `
You are DealershipAI's proprietary Algorithmic Visibility Index™ strategist.
Analyze the provided tenant data and compute comprehensive metrics.

TENANT CONTEXT:
- ID: ${tenantId}
- Name: ${context.tenant.name}
- Type: ${context.tenant.type}
- Subscription: ${context.tenant.subscription_tier}

CURRENT METRICS:
- AOER: ${context.metrics.aoer?.aoer || 'N/A'}
- AIV: ${context.metrics.aiv?.final_aiv || 'N/A'}
- ATI: ${context.metrics.ati?.final_ati || 'N/A'}
- Elasticity: ${context.metrics.elasticity?.elasticity || 'N/A'}

PROPRIETARY MODELS:
- AIV™: SEO .25 + AEO .30 + GEO .25 + UGC .10 + GeoLocal .05
- ATI™: Schema + Reviews + Authority + Credibility with fraud protection
- CRS: Bayesian fusion of AIV and ATI
- Elasticity: ΔRaR / ΔAIV with 8-week rolling regression

ANALYSIS TYPE: ${analysisType}

REQUIREMENTS:
1. Compute and validate all metrics using proprietary formulas
2. Identify top 5 SHAP drivers for optimization
3. Provide specific, actionable recommendations
4. Include confidence intervals and R² validation
5. Flag any regime changes (Normal/Shift Detected/Quarantine)
6. Focus on maximizing $ impact per +1 AIV point

OUTPUT FORMAT (JSON):
{
  "metrics": {
    "aiv": 79.2,
    "ati": 81.3,
    "crs": 80.25,
    "elasticity": 5000,
    "r2": 0.85,
    "regime": "Normal",
    "confidenceInterval": [4200, 5800]
  },
  "drivers": {
    "aiv": [
      {"feature": "AEO Score", "impact": 25.5, "direction": "positive"}
    ],
    "ati": [
      {"feature": "Review Legitimacy", "impact": 18.75, "direction": "positive"}
    ]
  },
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ]
}

All models are proprietary trade secrets. Be factual and concise.
`;
}

function parseGPT5Response(outputText: string): {
  metrics: Record<string, any>;
  recommendations: string[];
} {
  try {
    // Look for JSON blocks in the response
    const jsonMatch = outputText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        metrics: parsed.metrics || {},
        recommendations: parsed.recommendations || []
      };
    }

    // Fallback: extract metrics using regex patterns
    const metrics: Record<string, any> = {};
    const recommendations: string[] = [];

    // Extract AIV score
    const aivMatch = outputText.match(/AIV[™]?[:\s]*(\d+(?:\.\d+)?)/i);
    if (aivMatch) metrics.aiv = parseFloat(aivMatch[1]);

    // Extract ATI score
    const atiMatch = outputText.match(/ATI[™]?[:\s]*(\d+(?:\.\d+)?)/i);
    if (atiMatch) metrics.ati = parseFloat(atiMatch[1]);

    // Extract CRS score
    const crsMatch = outputText.match(/CRS[:\s]*(\d+(?:\.\d+)?)/i);
    if (crsMatch) metrics.crs = parseFloat(crsMatch[1]);

    // Extract Elasticity
    const elasticityMatch = outputText.match(/Elasticity[:\s]*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (elasticityMatch) {
      metrics.elasticity = parseFloat(elasticityMatch[1].replace(/,/g, ''));
    }

    // Extract R²
    const r2Match = outputText.match(/R[²2][:\s]*(\d+(?:\.\d+)?)/i);
    if (r2Match) metrics.r2 = parseFloat(r2Match[1]);

    // Extract regime
    const regimeMatch = outputText.match(/Regime[:\s]*(Normal|Shift Detected|Quarantine)/i);
    if (regimeMatch) metrics.regime = regimeMatch[1];

    // Extract recommendations
    const recMatches = outputText.match(/(?:^|\n)[\s]*[-*•]\s*(.+)/gm);
    if (recMatches) {
      recommendations.push(...recMatches.map(match => match.replace(/^[\s]*[-*•]\s*/, '').trim()));
    }

    return { metrics, recommendations };

  } catch (error) {
    console.error('Error parsing GPT-5 response:', error);
    return { metrics: {}, recommendations: [] };
  }
}
