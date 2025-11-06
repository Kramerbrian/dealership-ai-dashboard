import { NextRequest, NextResponse } from "next/server";
import { calculateDLOC, DLOCInputs } from "@/lib/analytics/d-loc-calculator";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/d-loc
 * 
 * Calculates Dealership Lost Opportunity Cost (D-LOC) based on provided inputs
 * Returns detailed breakdown by pillar and actionable recommendations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputs: DLOCInputs = body;

    // Validate required inputs
    const required = [
      "avgGrossProfitNew",
      "avgGrossProfitUsed",
      "avgFIPVR",
      "totalMonthlyAdSpend",
      "totalLeadsGenerated",
      "highIntentLeadRate",
      "highIntentConversionRate",
      "lowIntentConversionRate",
      "searchLostISBudget",
      "searchLostISRank",
      "websiteLoadSpeedLossRate",
      "avgLeadResponseTimeMinutes",
    ];

    for (const field of required) {
      if (inputs[field as keyof DLOCInputs] === undefined || inputs[field as keyof DLOCInputs] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set defaults for optional fields
    const defaults: Partial<DLOCInputs> = {
      newUsedRatio: 0.4, // 40% new, 60% used default
      serviceRetentionRate: 0.65, // 65% return for service
      avgServiceProfitPerCustomer3Years: 1350, // Industry average
      timeDecayAttributionFactor: 0.9, // 90% credit to primary channel
      geoInfluenceRadiusMiles: 10, // 10-mile default radius
    };

    const fullInputs: DLOCInputs = {
      ...defaults,
      ...inputs,
    } as DLOCInputs;

    // Calculate D-LOC
    const results = calculateDLOC(fullInputs);

    return NextResponse.json({
      success: true,
      inputs: fullInputs,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("D-LOC calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate D-LOC" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/d-loc?dealerId=xxx
 * 
 * Calculates D-LOC using stored dealership data
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get("dealerId");

    if (!dealerId) {
      return NextResponse.json(
        { error: "dealerId query parameter is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch actual dealership data from database
    // For now, return example structure
    return NextResponse.json({
      message: "Use POST endpoint with dealer data, or implement database lookup",
      example: {
        dealerId,
        endpoint: "POST /api/analytics/d-loc",
        body: {
          avgGrossProfitNew: 3284,
          avgGrossProfitUsed: 2337,
          avgFIPVR: 2000,
          newUsedRatio: 0.4,
          totalMonthlyAdSpend: 25000,
          totalLeadsGenerated: 1000,
          highIntentLeadRate: 0.35,
          highIntentConversionRate: 0.025,
          lowIntentConversionRate: 0.01,
          searchLostISBudget: 0.20,
          searchLostISRank: 0.10,
          websiteLoadSpeedLossRate: 0.30,
          avgLeadResponseTimeMinutes: 20,
          serviceRetentionRate: 0.65,
          avgServiceProfitPerCustomer3Years: 1350,
          timeDecayAttributionFactor: 0.9,
          geoInfluenceRadiusMiles: 10,
        },
      },
    });
  } catch (error: any) {
    console.error("D-LOC GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch D-LOC" },
      { status: 500 }
    );
  }
}

