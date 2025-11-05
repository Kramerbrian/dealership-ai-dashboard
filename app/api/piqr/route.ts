/**
 * GET /api/piqr
 * 
 * PIQR (Perceptual Intelligence & Quality Reliability) data endpoint
 * Returns comprehensive PIQR metrics including AIV, ATI, CRS, and forecast data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { dashboardQuerySchema } from '@/lib/validation/schemas';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache-tags';

interface PIQRResponse {
  success: boolean;
  data: {
    piqr_overall: number;
    aiv_score: number;
    ati_score: number;
    crs_score: number;
    zero_click_rate: number;
    consensus_reliability: number;
    
    // AIV breakdown
    aiv: {
      seo_score: number;
      aeo_score: number;
      geo_score: number;
      ugc_score: number;
      geolocal_score: number;
      overall: number;
    };
    
    // ATI breakdown
    ati: {
      schema_consistency: number;
      review_legitimacy: number;
      topical_authority: number;
      source_credibility: number;
      overall: number;
    };
    
    // CRS (Composite Reputation Score)
    crs: {
      score: number;
      variance_aiv: number;
      variance_ati: number;
      weights: {
        w1: number;
        w2: number;
      };
    };
    
    // Forecast data
    forecast: {
      piqr_forecast_next_14d: Array<{
        date: string;
        value: number;
        lower_bound: number;
        upper_bound: number;
      }>;
      confidence_interval: number;
      model: string;
    };
    
    // RankEmbed map
    rankembed_map: Array<{
      url: string;
      scs: number; // Semantic Clarity Score
      sis: number; // Semantic Integrity Score
      scr: number; // Semantic Correlation Ratio
      aiv_sel: number; // AIV clarity layer
    }>;
    
    // Historical data for trend analysis
          historical: Array<{
            date: string;
            piqr_overall: number;
            aiv_score: number;
            ati_score: number;
            crs_score: number;
            ugc_health: number;
            zero_click_rate: number;
            consensus_reliability: number;
          }>;
    
    // Agentic recommendations
    agentic_rca: Array<{
      scenario: string;
      expected_gain: {
        aiv_score: string;
        ati_score: string;
        crs_score: string;
      };
      confidence_level: number;
      description: string;
    }>;
  };
  meta: {
    dealerId: string;
    timestamp: string;
    refresh_interval_sec: number;
  };
}

/**
 * Calculate ARIMA(1,1,1) forecast
 * Simplified ARIMA implementation for PIQR forecasting
 */
function calculateARIMAForecast(
  historical: Array<{ 
    date: string; 
    piqr_overall: number; 
    aiv_score: number; 
    ati_score: number;
    crs_score: number;
  }>,
  days: number = 14
): Array<{ date: string; value: number; lower_bound: number; upper_bound: number }> {
  if (historical.length < 7) {
    // Not enough data for forecast
    return [];
  }

  // ARIMA(1,1,1) parameters
  // Simplified: AR(1) coefficient, differencing (1), MA(1) coefficient
  const phi = 0.6; // AR(1) coefficient
  const theta = 0.3; // MA(1) coefficient
  
  // Get last 7 days for input series
  const piqr_7d = historical.slice(-7).map(h => h.piqr_overall);
  const aiv_7d = historical.slice(-7).map(h => h.aiv_score);
  const ati_7d = historical.slice(-7).map(h => h.ati_score);
  
  // Calculate first differences
  const diff_piqr = [];
  const diff_aiv = [];
  const diff_ati = [];
  
  for (let i = 1; i < piqr_7d.length; i++) {
    diff_piqr.push(piqr_7d[i] - piqr_7d[i - 1]);
    diff_aiv.push(aiv_7d[i] - aiv_7d[i - 1]);
    diff_ati.push(ati_7d[i] - ati_7d[i - 1]);
  }
  
  // Calculate mean and variance of differences
  const meanDiff = diff_piqr.reduce((a, b) => a + b, 0) / diff_piqr.length;
  const variance = diff_piqr.reduce((sum, val) => sum + Math.pow(val - meanDiff, 2), 0) / diff_piqr.length;
  const stdDev = Math.sqrt(variance);
  
  // Forecast using ARIMA(1,1,1) model
  // y_t = phi * y_{t-1} + theta * e_{t-1} + e_t
  const forecast = [];
  const lastDate = new Date(historical[historical.length - 1].date);
  const lastValue = piqr_7d[piqr_7d.length - 1];
  const lastDiff = diff_piqr[diff_piqr.length - 1];
  const confidenceInterval = 1.96; // 95% CI
  
  let prevDiff = lastDiff;
  let prevError = lastDiff - meanDiff;
  
  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // ARIMA(1,1,1) forecast
    const forecastDiff = phi * prevDiff + theta * prevError + meanDiff;
    const forecastValue = lastValue + forecastDiff * i;
    
    // Confidence bounds widen over time
    const horizonFactor = Math.sqrt(i);
    const lower = forecastValue - (confidenceInterval * stdDev * horizonFactor);
    const upper = forecastValue + (confidenceInterval * stdDev * horizonFactor);
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      value: Math.max(0, Math.min(100, forecastValue)),
      lower_bound: Math.max(0, Math.min(100, lower)),
      upper_bound: Math.max(0, Math.min(100, upper)),
    });
    
    // Update for next iteration
    prevDiff = forecastDiff;
    prevError = forecastDiff - meanDiff;
  }

  return forecast;
}

/**
 * Calculate CRS (Composite Reputation Score)
 */
function calculateCRS(aiv: number, ati: number, varianceAIV: number, varianceATI: number): {
  score: number;
  variance_aiv: number;
  variance_ati: number;
  weights: { w1: number; w2: number };
} {
  // Variance-weighted fusion: w1 = 1/variance(AIV), w2 = 1/variance(ATI)
  const w1 = varianceAIV > 0 ? 1 / varianceAIV : 1;
  const w2 = varianceATI > 0 ? 1 / varianceATI : 1;
  const totalWeight = w1 + w2;

  const normalizedW1 = w1 / totalWeight;
  const normalizedW2 = w2 / totalWeight;

  const crsScore = (normalizedW1 * aiv + normalizedW2 * ati);

  return {
    score: Math.max(0, Math.min(100, crsScore)),
    variance_aiv: varianceAIV,
    variance_ati: varianceATI,
    weights: {
      w1: normalizedW1,
      w2: normalizedW2,
    },
  };
}

export const GET = createApiRoute(
  {
    endpoint: '/api/piqr',
    requireAuth: false, // Public endpoint for now
    validateQuery: dashboardQuerySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const { searchParams } = new URL(req.url);
      const dealerId = searchParams.get('dealerId') || 'current';
      const range = searchParams.get('range') || '30d';

      // Calculate days from range
      const daysMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
      };
      const days = daysMap[range] || 30;

      // Fetch or calculate PIQR metrics
      // In production, this would fetch from your scoring engines
      const aivScore = 80 + Math.random() * 15;
      const atiScore = 78 + Math.random() * 12;
      const ugcHealth = 82 + Math.random() * 10;
      const zeroClickRate = 35 + Math.random() * 15;
      const consensusReliability = 0.82 + Math.random() * 0.10;
      
      // Calculate PIQR using v3 formula system:
      // PIQR_v2.3 = (0.30 × Performance) + (0.25 × Intelligence) + (0.25 × Quality) + (0.20 × Readiness)
      // PIQR_v3 = (0.35 × Data Completeness) + (0.30 × AI Confidence) + (0.20 × Trust Integrity) + (0.15 × System Harmony)
      // PIQR_custom = f(KPI_alignment, Hovercard_accuracy, DPI_correlation)
      // PIQR_score = (0.25 × PIQR_v2.3) + (0.50 × PIQR_v3) + (0.25 × PIQR_custom)
      
      // Map existing metrics to new formula inputs
      const v2_3_inputs = {
        performance: ugcHealth, // DMS uptime logs, API metrics
        intelligence: aivScore * 0.8 + atiScore * 0.2, // AI inference telemetry
        quality: atiScore, // Schema validators, Search APIs
        readiness: zeroClickRate * 2, // CRM logs, Automation coverage
      };
      
      const v3_inputs = {
        dataCompleteness: aivScore, // VIN registry, OEM feeds
        aiConfidence: consensusReliability * 100, // Model outputs
        trustIntegrity: atiScore, // Review APIs, GBP consistency
        systemHarmony: 85 + Math.random() * 10, // SSE + dashboard diff telemetry
      };
      
      const custom_inputs = {
        kpiAlignment: 80 + Math.random() * 15,
        hovercardAccuracy: 75 + Math.random() * 20,
        dpiCorrelation: 82 + Math.random() * 12,
      };
      
      // Import and use new calculation
      const { calculatePIQR } = await import('@/lib/scoring/piqr-v3');
      const piqrResult = calculatePIQR(v2_3_inputs, v3_inputs, custom_inputs, 100);
      const piqrOverall = piqrResult.piqr_score;

      // Generate historical data
      const historical = [];
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const histAIV = aivScore + (Math.random() - 0.5) * 8;
        const histATI = atiScore + (Math.random() - 0.5) * 6;
        const histUGC = ugcHealth + (Math.random() - 0.5) * 5;
        const histZeroClick = zeroClickRate + (Math.random() - 0.5) * 10;
        const histConsensus = consensusReliability + (Math.random() - 0.5) * 0.05;
        const histCRS = calculateCRS(histAIV, histATI, varianceAIV, varianceATI);
        const histPIQR = (histAIV * 0.35 + histATI * 0.25 + histCRS.score * 0.20 + histUGC * 0.10 + histZeroClick * 0.05) * (1 + histConsensus * 0.1);
        
        historical.push({
          date: date.toISOString().split('T')[0],
          piqr_overall: Math.max(0, Math.min(100, histPIQR)),
          aiv_score: histAIV,
          ati_score: histATI,
          crs_score: histCRS.score,
          ugc_health: histUGC,
          zero_click_rate: histZeroClick,
          consensus_reliability: histConsensus,
        });
      }

      // Calculate variances for CRS
      const aivValues = historical.map(h => h.aiv_score);
      const atiValues = historical.map(h => h.ati_score);
      const aivAvg = aivValues.reduce((a, b) => a + b, 0) / aivValues.length;
      const atiAvg = atiValues.reduce((a, b) => a + b, 0) / atiValues.length;
      const varianceAIV = aivValues.reduce((sum, val) => sum + Math.pow(val - aivAvg, 2), 0) / aivValues.length;
      const varianceATI = atiValues.reduce((sum, val) => sum + Math.pow(val - atiAvg, 2), 0) / atiValues.length;

      // Calculate CRS for each historical point
      historical.forEach(h => {
        const crs = calculateCRS(h.aiv_score, h.ati_score, varianceAIV, varianceATI);
        h.crs_score = crs.score;
      });

      // Get current CRS
      const currentCRS = calculateCRS(aivScore, atiScore, varianceAIV, varianceATI);

      // Generate forecast
      const forecast = calculateARIMAForecast(historical, 14);

      // Generate RankEmbed map (simulated)
      const rankembedMap = [
        { url: '/home', scs: 0.85, sis: 0.82, scr: 0.88, aiv_sel: 0.87 },
        { url: '/inventory', scs: 0.78, sis: 0.75, scr: 0.80, aiv_sel: 0.79 },
        { url: '/about', scs: 0.92, sis: 0.90, scr: 0.91, aiv_sel: 0.92 },
        { url: '/contact', scs: 0.88, sis: 0.85, scr: 0.87, aiv_sel: 0.86 },
      ];

      // Generate agentic RCA recommendations
      const agenticRCA = [
        {
          scenario: 'add_FAQ_schema',
          expected_gain: {
            aiv_score: '+5-8%',
            ati_score: '+3%',
            crs_score: '+4%',
          },
          confidence_level: 0.85,
          description: 'Adding FAQ schema markup will improve semantic clarity and topical authority.',
        },
        {
          scenario: 'review_refresh',
          expected_gain: {
            aiv_score: '+2-4%',
            ati_score: '+5-7%',
            crs_score: '+3-5%',
          },
          confidence_level: 0.78,
          description: 'Refreshing stale reviews will improve review legitimacy and trust signals.',
        },
        {
          scenario: 'voice_content_patch',
          expected_gain: {
            aiv_score: '+3-5%',
            ati_score: '+2-3%',
            crs_score: '+2-4%',
          },
          confidence_level: 0.72,
          description: 'Adding voice-optimized content will improve semantic clarity and AEO performance.',
        },
      ];

      // Calculate final CRS for PIQR formula
      const finalCRS = calculateCRS(aivScore, atiScore, varianceAIV, varianceATI);
      const finalPIQR = (aivScore * 0.35 + atiScore * 0.25 + finalCRS.score * 0.20 + ugcHealth * 0.10 + zeroClickRate * 0.05) * (1 + consensusReliability * 0.1);

      const response: PIQRResponse = {
        success: true,
        data: {
          piqr_overall: Math.max(0, Math.min(100, finalPIQR)),
          aiv_score: aivScore,
          ati_score: atiScore,
          crs_score: finalCRS.score,
          zero_click_rate: zeroClickRate,
          consensus_reliability: consensusReliability,
          
          aiv: {
            seo_score: 82 + Math.random() * 10,
            aeo_score: 78 + Math.random() * 12,
            geo_score: 85 + Math.random() * 8,
            ugc_score: ugcHealth, // Use calculated UGC health
            geolocal_score: 83 + Math.random() * 9,
            overall: aivScore,
          },
          
          ati: {
            schema_consistency: 88 + Math.random() * 8,
            review_legitimacy: 85 + Math.random() * 10,
            topical_authority: 82 + Math.random() * 12,
            source_credibility: 90 + Math.random() * 6,
            overall: atiScore,
          },
          
          crs: currentCRS,
          
          forecast: {
            piqr_forecast_next_14d: forecast,
            confidence_interval: 0.95,
            model: 'ARIMA(1,1,1)',
          },
          
          rankembed_map: rankembedMap,
          historical,
          agentic_rca: agenticRCA,
        },
        meta: {
          dealerId,
          timestamp: new Date().toISOString(),
          refresh_interval_sec: 60,
        },
      };

      await logger.info('PIQR data fetched', {
        dealerId,
        range,
        piqr_overall: response.data.piqr_overall,
      });

      return cachedResponse(response, {
        tags: [CACHE_TAGS.PIQR_DATA, `${CACHE_TAGS.DEALER}:${dealerId}`],
        revalidate: 60, // 1 minute cache
      });
    } catch (error) {
      await logger.error('PIQR API error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return errorResponse('Failed to fetch PIQR data', 500);
    }
  }
);

