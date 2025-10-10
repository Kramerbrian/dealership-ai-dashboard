import { NextRequest, NextResponse } from "next/server";
import { hyperAIVOptimizer } from "@/lib/hyperaiv-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, updated_model_weights } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: "dealerId is required" },
        { status: 400 }
      );
    }

    // Execute the reinforcement learning step
    const results = await hyperAIVOptimizer.executeWorkflow(dealerId);

    return NextResponse.json({
      success: true,
      message: "Model weights reinforced successfully",
      updated_model_weights: results.updated_model_weights,
      calibration_metrics: results.calibration_metrics,
      evaluation_metrics: results.evaluation_metrics,
      execution_time_ms: results.execution_time_ms
    });

  } catch (error) {
    console.error('Reinforcement learning error:', error);
    return NextResponse.json(
      { error: "Failed to reinforce model weights", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId');

    // Get current model weights and status
    const mockWeights = {
      id: crypto.randomUUID(),
      asof_date: new Date().toISOString().split('T')[0],
      model_version: 'v1.0',
      seo_w: 0.35,
      aeo_w: 0.28,
      geo_w: 0.22,
      ugc_w: 0.10,
      geolocal_w: 0.05,
      intercept: 12.5,
      r2: 0.847,
      rmse: 3.2,
      mape: 4.1,
      training_samples: 1250,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      current_weights: mockWeights,
      reinforcement_status: 'active',
      last_reinforcement: new Date().toISOString(),
      next_scheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Get reinforcement status error:', error);
    return NextResponse.json(
      { error: "Failed to get reinforcement status" },
      { status: 500 }
    );
  }
}