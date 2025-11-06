import { NextRequest, NextResponse } from "next/server";
import { detectDrift } from "@/lib/orchestrator/autonomic-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/orchestrator/drift/check
 * 
 * Checks for drift in AI metrics using the canonized drift detection rule
 * Body: { featureStdDev: number, threshold?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { featureStdDev, threshold = 2.0 } = body;

    if (featureStdDev === undefined || featureStdDev === null) {
      return NextResponse.json(
        { error: "featureStdDev is required" },
        { status: 400 }
      );
    }

    const driftDetected = detectDrift(featureStdDev, threshold);

    // In production, this would:
    // 1. Log to audit trail
    // 2. Trigger RLController.retrain() if drift detected
    // 3. Pause AutoFixAgents if drift detected
    // 4. Send alerts to configured channels

    return NextResponse.json({
      driftDetected,
      featureStdDev,
      threshold,
      rule: "abs(std(feature)-1) > threshold",
      ruleResult: Math.abs(featureStdDev - 1),
      actions: driftDetected
        ? ["RLController.retrain()", "AutoFixAgents.pause()"]
        : [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Drift check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check drift" },
      { status: 500 }
    );
  }
}

