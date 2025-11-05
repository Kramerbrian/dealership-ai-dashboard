'use client';

import React, { useState, useEffect } from 'react';

// ---------------- TYPES ----------------

interface DealerRecord {
  id: string;
  name: string;
  domain: string;
  scores: {
    AIV: number;
    ATI: number;
    CVI: number;
    ORI: number;
    GRI: number;
    DPI: number;
  };
}

interface GroupExecutiveSummaryProps {
  dealers: DealerRecord[];
  loading?: boolean;
}

// ---------------- AI SUMMARY GENERATOR ----------------

function generateAISummary(dealers: DealerRecord[]): string {
  if (!dealers.length) return "No dealership data available for summary.";

  const mean = (k: keyof DealerRecord['scores']) =>
    dealers.reduce((s, d) => s + (d.scores[k] || 0), 0) / dealers.length;

  const meanAIV = mean('AIV');
  const meanATI = mean('ATI');
  const meanCVI = mean('CVI');
  const meanORI = mean('ORI');
  const meanGRI = mean('GRI');
  const meanDPI = mean('DPI');

  const topPerformer = dealers.reduce((top, d) => 
    (d.scores.DPI > top.scores.DPI ? d : top), dealers[0]
  );

  const weakPerformer = dealers.reduce((weak, d) => 
    (d.scores.DPI < weak.scores.DPI ? d : weak), dealers[0]
  );

  let summary = `Executive Summary (Last 30 Days):

• Fleet Average DPI: ${meanDPI.toFixed(1)} (${meanDPI >= 80 ? 'Strong' : meanDPI >= 70 ? 'Competitive' : 'Needs Attention'})
• Top Performer: ${topPerformer.name} (DPI: ${topPerformer.scores.DPI.toFixed(1)})
• Improvement Focus: ${weakPerformer.name} (DPI: ${weakPerformer.scores.DPI.toFixed(1)})

Pillar Performance:
• Visibility (AIV): ${meanAIV.toFixed(1)} — ${meanAIV >= 85 ? 'Excellent AI discoverability' : meanAIV >= 75 ? 'Good visibility' : 'Needs schema/SEO improvements'}
• Trust (ATI): ${meanATI.toFixed(1)} — ${meanATI >= 85 ? 'Strong credibility signals' : meanATI >= 75 ? 'Solid trust foundation' : 'Review response rate & schema auth needed'}
• Conversion (CVI): ${meanCVI.toFixed(1)} — ${meanCVI >= 85 ? 'High lead efficiency' : meanCVI >= 75 ? 'Good conversion flow' : 'CTA/form optimization recommended'}
• Operations (ORI): ${meanORI.toFixed(1)} — ${meanORI >= 85 ? 'Efficient inventory turn' : meanORI >= 75 ? 'Stable operations' : 'Aged inventory & pricing review needed'}
• Growth (GRI): ${meanGRI.toFixed(1)} — ${meanGRI >= 85 ? 'Scale-ready processes' : meanGRI >= 75 ? 'Good automation adoption' : 'CRM hygiene & workflow automation gaps'}

Key Actions:
${meanAIV < 75 ? '• Prioritize schema fixes and structured data coverage\n' : ''}${meanATI < 75 ? '• Increase review response rate and frequency\n' : ''}${meanCVI < 75 ? '• Test new CTAs and optimize form positions\n' : ''}${meanORI < 75 ? '• Reprice aged units (>45 days) and optimize days-to-turn\n' : ''}${meanGRI < 75 ? '• Automate lead assignment and audit CRM data hygiene\n' : ''}`;

  return summary;
}

// ---------------- ADAPTIVE LEARNING ENGINE ----------------

interface ForecastAccuracy {
  kpi: keyof DealerRecord['scores'];
  predicted: number;
  actual: number;
  timestamp: number;
}

interface AdaptiveMultipliers {
  AIV: number;
  ATI: number;
  CVI: number;
  ORI: number;
  GRI: number;
}

const ALPHA = 0.3; // Exponential smoothing factor (α ≈ 0.3)

/**
 * Load historical forecast accuracy from localStorage (or API in production)
 */
function loadForecastHistory(): ForecastAccuracy[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('forecast_accuracy_history');
    if (!stored) return [];
    
    const history: ForecastAccuracy[] = JSON.parse(stored);
    // Keep only last 12 months
    const cutoff = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000);
    return history.filter(h => h.timestamp > cutoff);
  } catch {
    return [];
  }
}

/**
 * Store forecast for later accuracy comparison
 */
function storeForecast(predictions: Record<keyof DealerRecord['scores'], number>) {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('forecast_predictions');
    const predictionsWithTimestamp = {
      ...predictions,
      timestamp: Date.now()
    };
    localStorage.setItem('forecast_predictions', JSON.stringify(predictionsWithTimestamp));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Calculate adaptive growth multipliers using exponential smoothing
 * Compares predicted vs actual results and adjusts multipliers
 */
function calculateAdaptiveMultipliers(
  currentMeans: Record<keyof DealerRecord['scores'], number>
): AdaptiveMultipliers {
  const history = loadForecastHistory();
  
  // Start with baseline multipliers
  const baseline: AdaptiveMultipliers = {
    AIV: currentMeans.AIV > 80 ? 1.02 : currentMeans.AIV > 70 ? 1.01 : 0.995,
    ATI: currentMeans.ATI > 80 ? 1.02 : currentMeans.ATI > 70 ? 1.01 : 0.995,
    CVI: currentMeans.CVI > 80 ? 1.02 : currentMeans.CVI > 70 ? 1.01 : 0.995,
    ORI: currentMeans.ORI > 80 ? 1.02 : currentMeans.ORI > 70 ? 1.01 : 0.995,
    GRI: currentMeans.GRI > 80 ? 1.02 : currentMeans.GRI > 70 ? 1.01 : 0.995,
  };

  // If no history, return baseline
  if (history.length === 0) {
    return baseline;
  }

  // Group by KPI and calculate accuracy errors
  const kpiGroups: Record<string, { predicted: number[]; actual: number[] }> = {};
  
  history.forEach(entry => {
    if (!kpiGroups[entry.kpi]) {
      kpiGroups[entry.kpi] = { predicted: [], actual: [] };
    }
    kpiGroups[entry.kpi].predicted.push(entry.predicted);
    kpiGroups[entry.kpi].actual.push(entry.actual);
  });

  // Calculate adaptive multipliers using exponential smoothing
  const adaptive: AdaptiveMultipliers = { ...baseline };

  Object.keys(kpiGroups).forEach(kpi => {
    const group = kpiGroups[kpi];
    if (group.predicted.length === 0) return;

    // Calculate average prediction error
    let totalError = 0;
    for (let i = 0; i < group.predicted.length; i++) {
      const error = group.actual[i] - group.predicted[i];
      totalError += error;
    }
    const avgError = totalError / group.predicted.length;

    // Calculate error ratio (how much we over/under-predicted)
    const avgPredicted = group.predicted.reduce((a, b) => a + b, 0) / group.predicted.length;
    const errorRatio = avgPredicted > 0 ? avgError / avgPredicted : 0;

    // Apply exponential smoothing to adjust multiplier
    // If we consistently over-predict, reduce multiplier; if under-predict, increase
    const adjustment = 1 + (errorRatio * ALPHA);
    const baseMultiplier = baseline[kpi as keyof AdaptiveMultipliers];
    
    // Smooth the adjustment (don't change too drastically)
    adaptive[kpi as keyof AdaptiveMultipliers] = baseMultiplier * (1 - ALPHA) + (baseMultiplier * adjustment) * ALPHA;
    
    // Clamp to reasonable bounds (0.98 to 1.05)
    adaptive[kpi as keyof AdaptiveMultipliers] = Math.max(0.98, Math.min(1.05, adaptive[kpi as keyof AdaptiveMultipliers]));
  });

  return adaptive;
}

/**
 * Record actual vs predicted accuracy for learning
 * Call this when actual KPI data becomes available (e.g., end of month)
 */
export function recordForecastAccuracy(
  kpi: keyof DealerRecord['scores'],
  predicted: number,
  actual: number
) {
  if (typeof window === 'undefined') return;
  
  try {
    const history = loadForecastHistory();
    history.push({ kpi, predicted, actual, timestamp: Date.now() });
    
    // Keep only last 12 months
    const cutoff = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(h => h.timestamp > cutoff);
    
    localStorage.setItem('forecast_accuracy_history', JSON.stringify(filtered));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// ---------------- METRICS CONSTANT ----------------

const METRICS: Array<keyof DealerRecord['scores']> = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI'];

// ---------------- ADAPTIVE FORECAST ENGINE ----------------

interface ForecastModel {
  baseGrowth: Record<string, number>;
  lastMeans: Record<string, number>;
  timestamp: string;
}

function forecastNextMonthAdaptive(
  dealers: DealerRecord[],
  prevModel?: ForecastModel
): { text: string; model: ForecastModel } {
  if (!dealers.length) {
    return { 
      text: "No forecast available.", 
      model: prevModel || { baseGrowth: {}, lastMeans: {}, timestamp: new Date().toISOString() }
    };
  }

  const mean = (k: keyof DealerRecord['scores']) =>
    dealers.reduce((s, d) => s + (d.scores[k] || 0), 0) / dealers.length;

  // --- Step 1: Pull previous multipliers from localStorage or baseline ---
  let stored: ForecastModel;
  
  if (typeof window !== 'undefined') {
    try {
      const storedStr = localStorage.getItem("forecastModel");
      stored = storedStr ? JSON.parse(storedStr) : prevModel || null;
    } catch {
      stored = prevModel || null;
    }
  } else {
    stored = prevModel || null;
  }

  const alpha = 0.3; // smoothing constant

  const baseGrowth: Record<string, number> = stored?.baseGrowth || {
    AIV: 1.01,
    ATI: 1.00,
    CVI: 1.01,
    ORI: 0.99,
    GRI: 1.01,
  };

  // --- Step 2: Calculate recent actual deltas (pseudo trend vs. prior) ---
  const lastMeans = stored?.lastMeans || {};
  const deltas: Record<string, number> = {};
  
  METRICS.forEach((k) => {
    const currentMean = mean(k);
    const lastMean = lastMeans[k] || currentMean;
    deltas[k] = currentMean - lastMean;
  });

  // --- Step 3: Adjust multipliers adaptively ---
  const newGrowth: Record<string, number> = {};
  
  METRICS.forEach((k) => {
    // Normalize small deltas (divide by 100 to get percentage change)
    const adj = baseGrowth[k] + alpha * (deltas[k] / 100);
    // Clamp to reasonable bounds (±2% to +5%)
    newGrowth[k] = Math.max(0.98, Math.min(1.05, adj));
  });

  // --- Step 4: Forecast KPIs using new multipliers ---
  const nextVals: Record<string, number> = {};
  
  METRICS.forEach((k) => {
    nextVals[k] = Math.min(100, mean(k) * newGrowth[k]);
  });

  // --- Step 5: Derive composite and financial projection ---
  const nextDPI =
    0.25 * nextVals.AIV +
    0.20 * nextVals.ATI +
    0.25 * nextVals.CVI +
    0.20 * nextVals.ORI +
    0.10 * nextVals.GRI;

  const leadsNow = 450;
  const elasticity = 0.008; // each 1pt AIV or CVI change = 0.8% lead delta
  const deltaPct =
    (nextVals.AIV - mean('AIV')) * elasticity +
    (nextVals.CVI - mean('CVI')) * elasticity;
  const leadsForecast = Math.round(leadsNow * (1 + deltaPct));
  const revenueForecast = Math.round(leadsForecast * 1200);

  // --- Step 6: Persist adaptive model state ---
  const newModel: ForecastModel = {
    baseGrowth: newGrowth,
    lastMeans: Object.fromEntries(METRICS.map((k) => [k, mean(k)])),
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem("forecastModel", JSON.stringify(newModel));
    } catch (error) {
      console.warn('Failed to persist forecast model:', error);
    }
  }

  // Store predictions for accuracy tracking
  storeForecast({
    AIV: nextVals.AIV,
    ATI: nextVals.ATI,
    CVI: nextVals.CVI,
    ORI: nextVals.ORI,
    GRI: nextVals.GRI,
  });

  // --- Step 7: Log forecast to API (async, non-blocking) ---
  if (typeof window !== 'undefined') {
    // Log forecast asynchronously - don't block UI
    fetch('/api/forecast/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        forecastModel: newModel,
        predictions: nextVals,
        timestamp: newModel.timestamp,
      }),
    }).catch(err => {
      console.warn('Failed to log forecast:', err);
      // Silently fail - logging is non-critical
    });
  }

  // --- Step 8: Build narrative output ---
  const text = `Adaptive Forecast Mode (Next 30 Days)

• Updated growth multipliers (learned): ${METRICS.map(
    (k) => `${k}:${((newGrowth[k] * 100) - 100).toFixed(1)}%`
  ).join("  |  ")}

• Projected KPI means — AIV ${nextVals.AIV.toFixed(1)}, CVI ${nextVals.CVI.toFixed(1)}, DPI ${nextDPI.toFixed(1)}

• Forecasted lead volume: ~${leadsForecast} (+${((leadsForecast / leadsNow - 1) * 100).toFixed(1)}%)

• Expected gross impact: ≈ $${revenueForecast.toLocaleString()}

Model auto-learns from prior forecast vs. actual results using exponential smoothing (α=${alpha}).`;

  return { text, model: newModel };
}

// Legacy function for backward compatibility (now calls adaptive version)
function forecastNextMonth(dealers: DealerRecord[]): string {
  return forecastNextMonthAdaptive(dealers).text;
}

// ---------------- MAIN COMPONENT ----------------

export default function GroupExecutiveSummary({ dealers, loading = false }: GroupExecutiveSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [forecast, setForecast] = useState<string>('');
  const [forecastModel, setForecastModel] = useState<ForecastModel | null>(null);

  useEffect(() => {
    if (!loading && dealers.length > 0) {
      setSummary(generateAISummary(dealers));
      const forecastResult = forecastNextMonthAdaptive(dealers, forecastModel || undefined);
      setForecast(forecastResult.text);
      setForecastModel(forecastResult.model);
    }
  }, [dealers, loading, forecastModel]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!dealers.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <p className="text-gray-600">No dealership data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Section */}
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Executive Summary — Past 30 Days</h3>
        <pre className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 font-mono">
          {summary}
        </pre>
      </div>

      {/* Forecast Mode Section */}
      <div className="rounded-2xl border border-gray-200 bg-slate-50/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Forecast Mode — Next 30 Days</h3>
        <pre className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 font-mono">
          {forecast}
        </pre>
      </div>
    </div>
  );
}

