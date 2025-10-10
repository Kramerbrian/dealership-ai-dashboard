import { NextRequest, NextResponse } from "next/server";
import { aivModelTrainer } from "@/lib/model-training";
import { AIVTrainingData } from "@/types/training";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelVersion, validationData } = body;

    if (!modelVersion) {
      return NextResponse.json(
        { error: "Model version is required" },
        { status: 400 }
      );
    }

    if (!validationData || !Array.isArray(validationData)) {
      return NextResponse.json(
        { error: "Validation data is required and must be an array" },
        { status: 400 }
      );
    }

    // Validate data structure
    const validatedData: AIVTrainingData[] = validationData.map((item: any) => ({
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

    // Validate the model
    const audit = await aivModelTrainer.validateModel(modelVersion, validatedData);

    return NextResponse.json({
      success: true,
      audit,
      validation_samples: validatedData.length,
      message: "Model validation completed successfully"
    });

  } catch (error) {
    console.error('Model validation error:', error);
    return NextResponse.json(
      { error: "Failed to validate model", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const modelVersion = url.searchParams.get('version');

    // Mock response - replace with actual database query
    const mockAudit = {
      run_id: crypto.randomUUID(),
      run_date: new Date().toISOString(),
      model_version: modelVersion || 'v1.0',
      rmse: 3.2,
      mape: 4.1,
      r2: 0.847,
      delta_accuracy: 0.024,
      delta_roi: 240.0,
      training_time_seconds: 45,
      validation_samples: 250,
      notes: `Validation run for ${modelVersion || 'v1.0'}`
    };

    return NextResponse.json({
      success: true,
      audit: mockAudit
    });

  } catch (error) {
    console.error('Get validation error:', error);
    return NextResponse.json(
      { error: "Failed to get validation information" },
      { status: 500 }
    );
  }
}
