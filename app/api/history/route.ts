/**
 * History API endpoint for returning 8-week trend data for charts
 * Provides historical AIV metrics with smoothing and analysis
 * Part of the closed-loop analytics system
 */

import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client only if environment variables are available
let supabase: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.warn('Supabase client initialization failed:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const weeks = parseInt(searchParams.get('weeks') || '8');
    const includeSmoothing = searchParams.get('smoothing') !== 'false';
    const includeAnalysis = searchParams.get('analysis') === 'true';

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId parameter is required' },
        { status: 400 }
      );
    }

    if (weeks < 1 || weeks > 52) {
      return NextResponse.json(
        { error: 'Weeks must be between 1 and 52' },
        { status: 400 }
      );
    }

    // Get historical data
    let historicalData: any[] = [];
    
    if (supabase) {
      const { data, error: dataError } = await supabase
        .from('aiv_raw_signals')
        .select('*')
        .eq('dealer_id', dealerId)
        .gte('date', new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dataError) {
        console.error('Error fetching historical data:', dataError);
        return NextResponse.json(
          { error: 'Failed to fetch historical data' },
          { status: 500 }
        );
      }
      
      historicalData = data || [];
    } else {
      // Mock historical data when Supabase is not configured
      historicalData = generateMockHistoricalData(weeks);
    }

    if (historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found' },
        { status: 404 }
      );
    }

    // Get model weights for AIV calculation
    const { data: currentWeights, error: weightsError } = await supabase
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

    // Process historical data
    const processedData = processHistoricalData(historicalData, currentWeights);

    // Apply smoothing if requested
    let smoothedData = processedData;
    if (includeSmoothing && processedData.length > 3) {
      smoothedData = applyKalmanSmoothing(processedData);
    }

    // Generate trend analysis if requested
    let trendAnalysis = null;
    if (includeAnalysis) {
      trendAnalysis = generateTrendAnalysis(smoothedData);
    }

    // Calculate summary statistics
    const summaryStats = calculateSummaryStatistics(smoothedData);

    // Get recent model performance for context
    const { data: recentAudit } = await supabase
      .from('model_audit')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('run_date', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        dealer_id: dealerId,
        time_series: smoothedData,
        summary_statistics: summaryStats,
        trend_analysis: trendAnalysis,
        data_quality: {
          total_points: historicalData.length,
          date_range: {
            start: historicalData[0].date,
            end: historicalData[historicalData.length - 1].date,
            weeks_covered: weeks
          },
          completeness: calculateDataCompleteness(historicalData),
          smoothing_applied: includeSmoothing
        },
        model_context: {
          weights_used: {
            seo: currentWeights.seo_w,
            aeo: currentWeights.aeo_w,
            geo: currentWeights.geo_w,
            ugc: currentWeights.ugc_w,
            geolocal: currentWeights.geolocal_w
          },
          model_performance: recentAudit ? {
            r2: recentAudit.r2,
            rmse: recentAudit.rmse,
            last_evaluation: recentAudit.run_date
          } : null
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model_version: 'hyperAIV-v1.0',
        data_processing: {
          smoothing_method: includeSmoothing ? 'kalman_filter' : 'none',
          analysis_included: includeAnalysis,
          weeks_requested: weeks,
          points_returned: smoothedData.length
        }
      }
    });

  } catch (error) {
    console.error('Error in /api/history:', error);
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
 * Process historical data and calculate AIV metrics
 */
function processHistoricalData(historicalData: any[], weights: any) {
  return historicalData.map((point, index) => {
    // Calculate AIV using current model weights
    const aiv = 
      (point.seo || 0) * weights.seo_w +
      (point.aeo || 0) * weights.aeo_w +
      (point.geo || 0) * weights.geo_w +
      (point.ugc || 0) * weights.ugc_w +
      (point.geolocal || 0) * weights.geolocal_w;

    const ati = point.aeo || 0;
    const crs = (aiv + ati) / 2;

    return {
      date: point.date,
      timestamp: new Date(point.date).getTime(),
      week_number: index + 1,
      aiv: Math.round(aiv * 100) / 100,
      ati: Math.round(ati * 100) / 100,
      crs: Math.round(crs * 100) / 100,
      rar: point.observed_rar || 0,
      elasticity: point.elasticity_usd_per_pt || 0,
      raw_metrics: {
        seo: point.seo || 0,
        aeo: point.aeo || 0,
        geo: point.geo || 0,
        ugc: point.ugc || 0,
        geolocal: point.geolocal || 0
      },
      confidence_score: point.confidence_score || 0.85
    };
  });
}

/**
 * Apply Kalman smoothing to time series data
 */
function applyKalmanSmoothing(data: any[]) {
  if (data.length < 3) return data;

  const aivValues = data.map(d => d.aiv);
  const n = aivValues.length;

  // Kalman filter parameters
  let x = aivValues[0]; // state estimate
  let p = 1; // error covariance
  const q = 0.1; // process noise
  const r = 1.0; // measurement noise

  const smoothedValues: number[] = [];

  // Apply Kalman filter
  for (let i = 0; i < n; i++) {
    const z = aivValues[i]; // measurement
    
    // Prediction step
    const xPred = x;
    const pPred = p + q;
    
    // Update step
    const k = pPred / (pPred + r); // Kalman gain
    x = xPred + k * (z - xPred);
    p = (1 - k) * pPred;
    
    smoothedValues.push(x);
  }

  // Return smoothed data
  return data.map((point, index) => ({
    ...point,
    aiv: Math.round(smoothedValues[index] * 100) / 100,
    aiv_raw: point.aiv, // Keep original for comparison
    smoothing_applied: true
  }));
}

/**
 * Generate trend analysis
 */
function generateTrendAnalysis(data: any[]) {
  if (data.length < 3) return null;

  const aivValues = data.map(d => d.aiv);
  const rarValues = data.map(d => d.rar);
  const dates = data.map(d => new Date(d.date));

  // Calculate trends
  const aivTrend = calculateLinearTrend(aivValues);
  const rarTrend = calculateLinearTrend(rarValues);

  // Calculate volatility
  const aivVolatility = calculateVolatility(aivValues);
  const rarVolatility = calculateVolatility(rarValues);

  // Calculate correlation
  const correlation = calculateCorrelation(aivValues, rarValues);

  // Identify patterns
  const patterns = identifyPatterns(data);

  // Calculate momentum
  const momentum = calculateMomentum(aivValues);

  return {
    trends: {
      aiv: {
        direction: aivTrend.slope > 0.1 ? 'increasing' : aivTrend.slope < -0.1 ? 'decreasing' : 'stable',
        slope: aivTrend.slope,
        r2: aivTrend.r2,
        significance: aivTrend.r2 > 0.7 ? 'high' : aivTrend.r2 > 0.4 ? 'medium' : 'low'
      },
      rar: {
        direction: rarTrend.slope > 0.1 ? 'increasing' : rarTrend.slope < -0.1 ? 'decreasing' : 'stable',
        slope: rarTrend.slope,
        r2: rarTrend.r2,
        significance: rarTrend.r2 > 0.7 ? 'high' : rarTrend.r2 > 0.4 ? 'medium' : 'low'
      }
    },
    volatility: {
      aiv: aivVolatility,
      rar: rarVolatility,
      stability: aivVolatility < 0.1 ? 'high' : aivVolatility < 0.2 ? 'medium' : 'low'
    },
    correlation: {
      aiv_rar: correlation,
      strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
      direction: correlation > 0 ? 'positive' : 'negative'
    },
    patterns: patterns,
    momentum: {
      current: momentum.current,
      average: momentum.average,
      direction: momentum.current > momentum.average ? 'accelerating' : 'decelerating'
    }
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummaryStatistics(data: any[]) {
  if (data.length === 0) return null;

  const aivValues = data.map(d => d.aiv);
  const rarValues = data.map(d => d.rar);

  return {
    aiv: {
      current: aivValues[aivValues.length - 1],
      average: aivValues.reduce((a, b) => a + b, 0) / aivValues.length,
      min: Math.min(...aivValues),
      max: Math.max(...aivValues),
      median: calculateMedian(aivValues),
      std_dev: calculateStandardDeviation(aivValues)
    },
    rar: {
      current: rarValues[rarValues.length - 1],
      average: rarValues.reduce((a, b) => a + b, 0) / rarValues.length,
      min: Math.min(...rarValues),
      max: Math.max(...rarValues),
      median: calculateMedian(rarValues),
      std_dev: calculateStandardDeviation(rarValues)
    },
    performance: {
      total_change: aivValues[aivValues.length - 1] - aivValues[0],
      percent_change: ((aivValues[aivValues.length - 1] - aivValues[0]) / aivValues[0]) * 100,
      best_week: data.findIndex(d => d.aiv === Math.max(...aivValues)) + 1,
      worst_week: data.findIndex(d => d.aiv === Math.min(...aivValues)) + 1
    }
  };
}

/**
 * Calculate data completeness
 */
function calculateDataCompleteness(data: any[]): number {
  const totalFields = 5; // seo, aeo, geo, ugc, geolocal
  let totalPossible = data.length * totalFields;
  let totalPresent = 0;

  data.forEach(point => {
    if (point.seo !== null && point.seo !== undefined) totalPresent++;
    if (point.aeo !== null && point.aeo !== undefined) totalPresent++;
    if (point.geo !== null && point.geo !== undefined) totalPresent++;
    if (point.ugc !== null && point.ugc !== undefined) totalPresent++;
    if (point.geolocal !== null && point.geolocal !== undefined) totalPresent++;
  });

  return totalPossible > 0 ? totalPresent / totalPossible : 0;
}

/**
 * Calculate linear trend
 */
function calculateLinearTrend(values: number[]) {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  return { slope, intercept, r2 };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const returns = values.slice(1).map((value, i) => (value - values[i]) / values[i]);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

  return Math.sqrt(variance);
}

/**
 * Calculate correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Identify patterns in the data
 */
function identifyPatterns(data: any[]): string[] {
  const patterns: string[] = [];
  const aivValues = data.map(d => d.aiv);

  // Check for upward trend
  if (aivValues.length >= 3) {
    const firstThird = aivValues.slice(0, Math.floor(aivValues.length / 3));
    const lastThird = aivValues.slice(-Math.floor(aivValues.length / 3));
    const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

    if (lastAvg > firstAvg * 1.1) {
      patterns.push('upward_trend');
    } else if (lastAvg < firstAvg * 0.9) {
      patterns.push('downward_trend');
    }
  }

  // Check for volatility
  const volatility = calculateVolatility(aivValues);
  if (volatility > 0.15) {
    patterns.push('high_volatility');
  } else if (volatility < 0.05) {
    patterns.push('low_volatility');
  }

  // Check for recent acceleration
  if (aivValues.length >= 4) {
    const recent = aivValues.slice(-2);
    const previous = aivValues.slice(-4, -2);
    const recentChange = recent[1] - recent[0];
    const previousChange = previous[1] - previous[0];

    if (Math.abs(recentChange) > Math.abs(previousChange) * 1.5) {
      patterns.push('recent_acceleration');
    }
  }

  return patterns;
}

/**
 * Calculate momentum
 */
function calculateMomentum(values: number[]) {
  if (values.length < 2) return { current: 0, average: 0 };

  const recent = values.slice(-3);
  const previous = values.slice(-6, -3);

  const currentMomentum = recent.length > 1 ? recent[recent.length - 1] - recent[0] : 0;
  const averageMomentum = previous.length > 1 ? previous[previous.length - 1] - previous[0] : 0;

  return {
    current: currentMomentum,
    average: averageMomentum
  };
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
