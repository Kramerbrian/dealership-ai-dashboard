import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/forecast-scenario
 * 
 * Generate scenario-based forecasts (best case, worst case, base case)
 * 
 * Body:
 * {
 *   currentKPIs: { AIV, ATI, CVI, ORI, GRI, DPI },
 *   scenario: "best" | "worst" | "base" | "custom",
 *   customMultipliers?: { AIV: 1.05, ... } // Optional for custom scenario
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentKPIs, scenario, customMultipliers } = body;

    if (!currentKPIs) {
      return NextResponse.json(
        { error: "Missing required field: currentKPIs" },
        { status: 400 }
      );
    }

    // Define scenario multipliers
    const scenarios = {
      best: {
        AIV: 1.08,  // 8% growth
        ATI: 1.06,
        CVI: 1.08,
        ORI: 1.05,
        GRI: 1.06,
      },
      worst: {
        AIV: 0.94,  // 6% decline
        ATI: 0.96,
        CVI: 0.94,
        ORI: 0.97,
        GRI: 0.96,
      },
      base: {
        AIV: 1.01,  // 1% growth (conservative)
        ATI: 1.00,
        CVI: 1.01,
        ORI: 0.99,
        GRI: 1.01,
      },
      custom: customMultipliers || {
        AIV: 1.01,
        ATI: 1.00,
        CVI: 1.01,
        ORI: 0.99,
        GRI: 1.01,
      },
    };

    const multipliers = scenarios[scenario as keyof typeof scenarios] || scenarios.base;

    // Calculate forecasted KPIs
    const forecasted: Record<string, number> = {};
    const kpis = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI'];

    kpis.forEach((kpi) => {
      const current = currentKPIs[kpi] || 0;
      const multiplier = multipliers[kpi as keyof typeof multipliers] || 1.0;
      forecasted[kpi] = Math.min(100, Math.max(0, current * multiplier));
    });

    // Calculate DPI
    forecasted.DPI = 
      0.25 * forecasted.AIV +
      0.20 * forecasted.ATI +
      0.25 * forecasted.CVI +
      0.20 * forecasted.ORI +
      0.10 * forecasted.GRI;

    // Calculate revenue impact
    const leadsNow = 450;
    const elasticity = 0.008;
    const deltaPct =
      (forecasted.AIV - currentKPIs.AIV) * elasticity +
      (forecasted.CVI - currentKPIs.CVI) * elasticity;
    const leadsForecast = Math.round(leadsNow * (1 + deltaPct));
    const revenueForecast = Math.round(leadsForecast * 1200);

    // Calculate changes
    const changes: Record<string, { absolute: number; percent: number }> = {};
    kpis.forEach((kpi) => {
      const current = currentKPIs[kpi] || 0;
      const forecast = forecasted[kpi];
      changes[kpi] = {
        absolute: forecast - current,
        percent: current > 0 ? ((forecast - current) / current) * 100 : 0,
      };
    });

    return NextResponse.json({
      scenario,
      forecasted,
      changes,
      leadsForecast,
      revenueForecast,
      revenueImpact: revenueForecast - (leadsNow * 1200),
      multipliers: multipliers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Scenario forecast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate scenario forecast" },
      { status: 500 }
    );
  }
}

