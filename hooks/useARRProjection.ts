import { useEffect, useState } from "react";

export interface ARRProjectionInputs {
  dealers: {
    dealerId: string;
    currentAIVR: number;
    nextMonthAIVR: number;
    monthlyRevenueRisk: number;
  }[];
  avgGrossPerUnit: number;
  avgMonthlyOpportunities: number;
  smoothingFactor?: number; // default 0.4 for growth moderation
}

export interface ARRProjectionOutputs {
  quarterlyARRGain: number;
  projectedARR: number;
  arrSummary: string;
}

/**
 * Converts portfolio AIVR™ growth into ARR forecast for executives.
 * 
 * This hook takes dealer portfolio data and computes:
 * - Quarterly ARR gain from AIVR improvements
 * - Annualized ARR projection
 * - Executive summary string
 */
export function useARRProjection(inputs: ARRProjectionInputs): ARRProjectionOutputs {
  const [projection, setProjection] = useState<ARRProjectionOutputs>({
    quarterlyARRGain: 0,
    projectedARR: 0,
    arrSummary: ""
  });

  useEffect(() => {
    if (!inputs || !inputs.dealers?.length) {
      setProjection({
        quarterlyARRGain: 0,
        projectedARR: 0,
        arrSummary: "No dealer data available for ARR projection."
      });
      return;
    }

    const k = inputs.smoothingFactor ?? 0.4;
    const totalDealers = inputs.dealers.length;

    // Compute weighted revenue risk and growth
    const totalRisk = inputs.dealers.reduce(
      (sum, d) => sum + d.monthlyRevenueRisk,
      0
    );

    const avgGrowth =
      inputs.dealers.reduce(
        (sum, d) => sum + (d.nextMonthAIVR - d.currentAIVR),
        0
      ) / totalDealers;

    // ARR projection (annualized)
    const monthlyGain = totalRisk * avgGrowth * k;
    const quarterlyARRGain = monthlyGain * 3;
    const projectedARR = quarterlyARRGain * 4; // annualized estimate

    const arrSummary = `Based on ${totalDealers} rooftops, projected quarterly ARR uplift is $${Math.round(
      quarterlyARRGain
    ).toLocaleString()}, driven by an average AIVR™ growth of ${(avgGrowth * 100).toFixed(
      1
    )}%. If sustained, annual ARR impact would reach approximately $${Math.round(
      projectedARR
    ).toLocaleString()}.`;

    setProjection({
      quarterlyARRGain: Math.round(quarterlyARRGain),
      projectedARR: Math.round(projectedARR),
      arrSummary
    });
  }, [JSON.stringify(inputs)]);

  return projection;
}

