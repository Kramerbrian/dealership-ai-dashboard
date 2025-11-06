import { NextRequest, NextResponse } from "next/server";
import { calculateReward } from "@/lib/orchestrator/autonomic-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/orchestrator/reward/calculate
 * 
 * Calculates RL reward using canonized formula: ΔVisibility * ΔRevenue - API_Cost
 * Body: { deltaVisibility: number, deltaRevenue: number, apiCost: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deltaVisibility, deltaRevenue, apiCost } = body;

    if (
      deltaVisibility === undefined ||
      deltaRevenue === undefined ||
      apiCost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: deltaVisibility, deltaRevenue, apiCost" },
        { status: 400 }
      );
    }

    const reward = calculateReward(deltaVisibility, deltaRevenue, apiCost);

    // Check against minimum reward threshold
    const minRewardThreshold = 1.2; // From governance config
    const meetsThreshold = reward >= minRewardThreshold;

    return NextResponse.json({
      reward,
      rewardFunction: "ΔVisibility * ΔRevenue - API_Cost",
      inputs: {
        deltaVisibility,
        deltaRevenue,
        apiCost,
      },
      meetsThreshold,
      minRewardThreshold,
      recommendation: meetsThreshold
        ? "Action approved - meets reward threshold"
        : "Action rejected - below reward threshold",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Reward calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate reward" },
      { status: 500 }
    );
  }
}

