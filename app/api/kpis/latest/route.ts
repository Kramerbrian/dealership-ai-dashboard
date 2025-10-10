/**
 * API endpoint for serving current AIV/ATI/CRS/Elasticity for dashboard tiles
 * Part of the closed-loop analytics system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with fallback
let supabase: any = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (error) {
  console.warn('Supabase client creation failed in KPIs API:', error);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId parameter is required' },
        { status: 400 }
      );
    }

    // If Supabase is not available, return mock data
    if (!supabase) {
      const mockResponse = {
        success: true,
        data: {
          dealer_id: dealerId,
          current_metrics: {
            aiv: 78.5,
            ati: 82.3,
            crs: 80.4,
            elasticity_usd_per_pt: 145.2,
            confidence_score: 0.87
          },
          model_weights: {
            seo: 0.30,
            aeo: 0.35,
            geo: 0.35,
            ugc: 0.15,
            geolocal: 0.10
          },
          model_performance: {
            r2: 0.87,
            rmse: 12.5,
            mape: 0.08,
            last_updated: new Date().toISOString()
          },
          history: includeHistory ? generateMockHistory() : undefined,
          audit_info: {
            last_evaluation: new Date().toISOString(),
            accuracy_gain_mom: 12.5,
            model_version: 'v1.0'
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          model_version: 'hyperAIV-v1.0',
          data_freshness: new Date().toISOString(),
          mock_data: true
        }
      };

      return NextResponse.json(mockResponse, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      });
    }

    // Get latest model weights
    const { data: weights, error: weightsError } = await supabase
      .from('model_weights')
      .select('*')
      .order('asof_date', { ascending: false })
      .limit(1)
      .single();

    if (weightsError) {
      console.error('Error fetching model weights:', weightsError);
      return NextResponse.json(
        { error: 'Failed to fetch model weights' },
        { status: 500 }
      );
    }

    // Get latest AIV signals for the dealer
    const { data: latestSignals, error: signalsError } = await supabase
      .from('aiv_raw_signals')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (signalsError && signalsError.code !== 'PGRST116') {
      console.error('Error fetching latest signals:', signalsError);
      return NextResponse.json(
        { error: 'Failed to fetch latest signals' },
        { status: 500 }
      );
    }

    // Calculate current AIV using model weights
    let currentAIV = 0;
    let currentATI = 0;
    let currentCRS = 0;
    let currentElasticity = 0;

    if (latestSignals) {
      currentAIV = 
        (latestSignals.seo || 0) * weights.seo_w +
        (latestSignals.aeo || 0) * weights.aeo_w +
        (latestSignals.geo || 0) * weights.geo_w +
        (latestSignals.ugc || 0) * weights.ugc_w +
        (latestSignals.geolocal || 0) * weights.geolocal_w;

      currentATI = latestSignals.aeo || 0; // Answer Engine Intelligence
      currentCRS = (currentAIV + currentATI) / 2; // Citation Relevance Score
      currentElasticity = latestSignals.elasticity_usd_per_pt || 0;
    }

    // Get 8-week history if requested
    let history = [];
    if (includeHistory) {
      const { data: historyData, error: historyError } = await supabase
        .from('aiv_raw_signals')
        .select('*')
        .eq('dealer_id', dealerId)
        .gte('date', new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!historyError && historyData) {
        history = historyData.map(signal => ({
          date: signal.date,
          aiv: 
            (signal.seo || 0) * weights.seo_w +
            (signal.aeo || 0) * weights.aeo_w +
            (signal.geo || 0) * weights.geo_w +
            (signal.ugc || 0) * weights.ugc_w +
            (signal.geolocal || 0) * weights.geolocal_w,
          ati: signal.aeo || 0,
          crs: ((signal.seo || 0) * weights.seo_w + (signal.aeo || 0) * weights.aeo_w + (signal.geo || 0) * weights.geo_w + (signal.ugc || 0) * weights.ugc_w + (signal.geolocal || 0) * weights.geolocal_w + (signal.aeo || 0)) / 2,
          elasticity: signal.elasticity_usd_per_pt || 0,
          rar: signal.observed_rar || 0
        }));
      }
    }

    // Get latest model performance metrics
    const { data: latestAudit, error: auditError } = await supabase
      .from('model_audit')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(1)
      .single();

    const response = {
      success: true,
      data: {
        dealer_id: dealerId,
        current_metrics: {
          aiv: Math.round(currentAIV * 100) / 100,
          ati: Math.round(currentATI * 100) / 100,
          crs: Math.round(currentCRS * 100) / 100,
          elasticity_usd_per_pt: Math.round(currentElasticity * 100) / 100,
          confidence_score: latestSignals?.confidence_score || 0.85
        },
        model_weights: {
          seo: weights.seo_w,
          aeo: weights.aeo_w,
          geo: weights.geo_w,
          ugc: weights.ugc_w,
          geolocal: weights.geolocal_w
        },
        model_performance: {
          r2: weights.r2 || 0.85,
          rmse: weights.rmse || 2.5,
          mape: weights.mape || 0.08,
          last_updated: weights.updated_at
        },
        history: includeHistory ? history : undefined,
        audit_info: latestAudit ? {
          last_evaluation: latestAudit.run_date,
          accuracy_gain_mom: latestAudit.accuracy_gain_mom || 0,
          model_version: latestAudit.model_version || 'v1.0'
        } : undefined
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model_version: 'hyperAIV-v1.0',
        data_freshness: latestSignals?.updated_at || new Date().toISOString()
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error in /api/kpis/latest:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate mock history data for 8 weeks
 */
function generateMockHistory() {
  const history = [];
  const now = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    
    const baseAIV = 75 + Math.sin(i * 0.5) * 10 + Math.random() * 5;
    const baseATI = 70 + Math.sin(i * 0.3) * 8 + Math.random() * 4;
    const baseCRS = (baseAIV + baseATI) / 2;
    
    history.push({
      date: date.toISOString().split('T')[0],
      aiv: Math.max(0, Math.min(100, baseAIV)),
      ati: Math.max(0, Math.min(100, baseATI)),
      crs: Math.max(0, Math.min(100, baseCRS)),
      elasticity: 120 + Math.random() * 50,
      rar: 0.15 + Math.random() * 0.1
    });
  }
  
  return history;
}