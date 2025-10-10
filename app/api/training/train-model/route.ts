import { NextRequest, NextResponse } from "next/server";
import { aivModelTrainer } from "@/lib/model-training";
import { AIVTrainingData } from "@/types/training";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trainingData, config } = body;

    if (!trainingData || !Array.isArray(trainingData)) {
      return NextResponse.json(
        { error: "Training data is required and must be an array" },
        { status: 400 }
      );
    }

    // Validate training data structure
    const validatedData: AIVTrainingData[] = trainingData.map((item: any) => ({
      dealer_id: item.dealer_id,
      date: item.date,
      seo: item.seo || 0,
      aeo: item.aeo || 0,
      geo: item.geo || 0,
      ugc: item.ugc || 0,
      geolocal: item.geolocal || 0,
      observed_aiv: item.observed_aiv || 0,
      observed_rar: item.observed_rar || 0
    }));

    // Train the model
    const modelWeights = await aivModelTrainer.trainModel(validatedData);

    return NextResponse.json({
      success: true,
      model_weights: modelWeights,
      training_samples: validatedData.length,
      message: "Model training completed successfully"
    });

  } catch (error) {
    console.error('Model training error:', error);
    return NextResponse.json(
      { error: "Failed to train model", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get training status or latest model info
    const url = new URL(req.url);
    const modelVersion = url.searchParams.get('version');

    // Mock response - replace with actual database query
    const mockModelWeights = {
      id: crypto.randomUUID(),
      asof_date: new Date().toISOString().split('T')[0],
      model_version: modelVersion || 'v1.0',
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
      model_weights: mockModelWeights
    });

  } catch (error) {
    console.error('Get model error:', error);
    return NextResponse.json(
      { error: "Failed to get model information" },
      { status: 500 }
    );
  }
}
