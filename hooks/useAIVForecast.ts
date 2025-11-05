import { useEffect, useState } from "react";
import type { AIVOutputs } from "@/hooks/useAIVCalculator";

export interface AIVForecastInputs extends AIVOutputs {
  historicalAIVR?: number[]; // last 3–6 AIVR values (0–1 scale)
  ctrTrend?: number[];       // optional CTR trend data
  convTrend?: number[];      // optional conversion trend data
  alpha?: number;            // smoothing factor, default 0.35
}

export interface AIVForecastOutputs {
  nextMonthAIVR: number;
  projectedRevenueGain: number;
  forecastSummary: string;
}

/**
 * Forecasts next-month AIVR™ and revenue recovery using exponential smoothing.
 * 
 * Formula:
 * AIVR_next = α * AIVR_current + (1 − α) * AIVR_smoothed_previous
 * RevenueGain = (AIVR_current − AIVR_smoothed_previous) × RevenueRisk × 1.2
 * 
 * Default α = 0.35 (medium responsiveness)
 */
export function useAIVForecast(inputs: AIVForecastInputs | null): AIVForecastOutputs {
  const [forecast, setForecast] = useState<AIVForecastOutputs>({
    nextMonthAIVR: 0,
    projectedRevenueGain: 0,
    forecastSummary: ""
  });

  useEffect(() => {
    if (!inputs || !inputs.historicalAIVR?.length) {
      // If no history, use current values with conservative projection
      if (inputs) {
        const nextAIVR = Math.min(1, inputs.AIVR_score * 1.01);
        const projectedRevenueGain = 0; // No trend to project
        
        setForecast({
          nextMonthAIVR: parseFloat(nextAIVR.toFixed(3)),
          projectedRevenueGain: 0,
          forecastSummary: `Based on your current AIVR™ of ${(inputs.AIVR_score * 100).toFixed(1)}%, we need more historical data to provide an accurate forecast.`
        });
      }
      return;
    }

    const alpha = inputs.alpha ?? 0.35;
    const hist = inputs.historicalAIVR;
    
    // Exponential smoothing
    let smoothed = hist[0];
    for (let i = 1; i < hist.length; i++) {
      smoothed = alpha * hist[i] + (1 - alpha) * smoothed;
    }

    // Project next-month value with slight upward bias if stable
    const trend = smoothed > hist[hist.length - 1] ? 1.02 : 1.01;
    const nextAIVR = Math.min(1, smoothed * trend);

    // Calculate revenue recovery potential
    const currentRevenue = inputs.Revenue_at_Risk_USD;
    const smoothedRevenue = (1 - smoothed) * inputs.monthly_opportunities * 
      (inputs.avg_gross_per_unit || 1200);
    const projectedRevenueGain = Math.max(0, 
      (currentRevenue - smoothedRevenue) * 1.2
    );

    const forecastSummary = `Based on your past ${hist.length} periods, AIVR™ is expected to rise to ${(nextAIVR * 100).toFixed(
      1
    )}%. That improvement could reduce monthly revenue risk by about $${Math.abs(
      Math.round(projectedRevenueGain)
    ).toLocaleString()}.`;

    setForecast({
      nextMonthAIVR: parseFloat(nextAIVR.toFixed(3)),
      projectedRevenueGain: Math.round(projectedRevenueGain),
      forecastSummary
    });
  }, [JSON.stringify(inputs)]);

  return forecast;
}

