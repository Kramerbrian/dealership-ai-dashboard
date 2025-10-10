import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { defaultAssistant } from '@/lib/openai-assistant';
import { AIVMetrics } from '@/types/aiv';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, forceRecalculation = false } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning mock elasticity recomputation');
      
      // Call OpenAI Assistant to recompute elasticity with mock data
      const gptResponse = await defaultAssistant.recomputeElasticity(
        dealerId,
        [] // No historical data available
      );

      // Return mock response
      return NextResponse.json({
        success: true,
        metrics: {
          dealer_id: dealerId,
          aiv_score: gptResponse.aiv,
          ati_score: gptResponse.ati,
          crs_score: gptResponse.crs,
          elasticity_usd_per_pt: gptResponse.elasticity_usd_per_pt,
          r2_coefficient: gptResponse.r2,
          timestamp: new Date().toISOString(),
          metadata: {
            query_count: gptResponse.query_count || 1,
            confidence_score: gptResponse.confidence_score || 0.85,
            last_updated: new Date().toISOString(),
            recommendations: gptResponse.recommendations,
            calculation_method: 'openai_assistant_mock',
            historical_data_points: 0,
          },
        },
        message: 'Elasticity recomputed successfully (mock data)',
        processing_details: {
          historical_data_points: 0,
          confidence_score: gptResponse.confidence_score || 0.85,
          recommendations_count: gptResponse.recommendations.length,
        },
      });
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this dealer
    const { data: access, error: accessError } = await supabase
      .from('dealer_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('dealer_id', dealerId)
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Access denied to this dealer' },
        { status: 403 }
      );
    }

    // Check if recalculation is needed (unless forced)
    if (!forceRecalculation) {
      const { data: recentMetrics } = await supabase
        .from('aiv_weekly')
        .select('timestamp, elasticity_usd_per_pt')
        .eq('dealer_id', dealerId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (recentMetrics) {
        const lastUpdate = new Date(recentMetrics.timestamp);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        // Don't recalculate if updated within last 6 hours
        if (hoursSinceUpdate < 6) {
          return NextResponse.json({
            success: true,
            message: 'Elasticity recently calculated, skipping recalculation',
            metrics: recentMetrics,
            hours_since_update: Math.round(hoursSinceUpdate),
          });
        }
      }
    }

    // Fetch historical data for elasticity calculation
    const { data: historicalData, error: historyError } = await supabase
      .from('aiv_weekly')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('timestamp', { ascending: true })
      .limit(24); // Last 24 data points

    if (historyError) {
      console.error('Error fetching historical data:', historyError);
    }

    // Get dealer context for better calculations
    const { data: dealerData } = await supabase
      .from('dealers')
      .select('name, city, state, brand, website')
      .eq('id', dealerId)
      .single();

    // Call OpenAI Assistant to recompute elasticity
    const gptResponse = await defaultAssistant.recomputeElasticity(
      dealerId,
      historicalData as AIVMetrics[]
    );

    // Prepare updated metrics
    const updatedMetrics: AIVMetrics = {
      dealer_id: dealerId,
      aiv_score: gptResponse.aiv,
      ati_score: gptResponse.ati,
      crs_score: gptResponse.crs,
      elasticity_usd_per_pt: gptResponse.elasticity_usd_per_pt,
      r2_coefficient: gptResponse.r2,
      timestamp: new Date().toISOString(),
      metadata: {
        query_count: gptResponse.query_count || 1,
        confidence_score: gptResponse.confidence_score || 0.85,
        last_updated: new Date().toISOString(),
        recommendations: gptResponse.recommendations,
        calculation_method: 'openai_assistant',
        historical_data_points: historicalData?.length || 0,
      },
    };

    // Store updated metrics
    const { data: result, error: upsertError } = await supabase
      .from('aiv_weekly')
      .upsert(updatedMetrics, {
        onConflict: 'dealer_id,timestamp',
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    // Log the recalculation for audit purposes
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'elasticity_recomputed',
        resource_type: 'aiv_metrics',
        resource_id: dealerId,
        changes: {
          previous_elasticity: historicalData?.[historicalData.length - 1]?.elasticity_usd_per_pt,
          new_elasticity: gptResponse.elasticity_usd_per_pt,
          r2_coefficient: gptResponse.r2,
        },
        metadata: {
          force_recalculation: forceRecalculation,
          historical_points: historicalData?.length || 0,
        },
      });

    return NextResponse.json({
      success: true,
      metrics: result,
      message: 'Elasticity recomputed successfully',
      processing_details: {
        historical_data_points: historicalData?.length || 0,
        confidence_score: gptResponse.confidence_score || 0.85,
        recommendations_count: gptResponse.recommendations.length,
      },
    });

  } catch (error) {
    console.error('Elasticity Recompute Error:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Elasticity calculation timed out. Please try again.' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait before retrying.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to recompute elasticity' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId');
  
  if (!dealerId) {
    return NextResponse.json(
      { error: 'Dealer ID is required' },
      { status: 400 }
    );
  }

  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this dealer
    const { data: access, error: accessError } = await supabase
      .from('dealer_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('dealer_id', dealerId)
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Access denied to this dealer' },
        { status: 403 }
      );
    }

    // Get latest elasticity data
    const { data: metrics, error: metricsError } = await supabase
      .from('aiv_weekly')
      .select('elasticity_usd_per_pt, r2_coefficient, timestamp, metadata')
      .eq('dealer_id', dealerId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) {
      return NextResponse.json(
        { error: 'No elasticity data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dealerId,
      elasticity_usd_per_pt: metrics.elasticity_usd_per_pt,
      r2_coefficient: metrics.r2_coefficient,
      last_calculated: metrics.timestamp,
      confidence_score: metrics.metadata?.confidence_score || 0.85,
      recommendations: metrics.metadata?.recommendations || [],
    });

  } catch (error) {
    console.error('Elasticity Get Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elasticity data' },
      { status: 500 }
    );
  }
}
