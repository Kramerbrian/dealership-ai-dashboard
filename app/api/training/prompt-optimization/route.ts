import { NextRequest, NextResponse } from "next/server";
import { promptOptimizer } from "@/lib/prompt-optimization";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, promptId, variants, modelUsed } = body;

    switch (action) {
      case 'run_experiment':
        if (!promptId || !variants || !Array.isArray(variants)) {
          return NextResponse.json(
            { error: "promptId and variants array are required" },
            { status: 400 }
          );
        }

        const results = await promptOptimizer.runPromptExperiment(
          promptId,
          variants,
          modelUsed || 'gpt-4'
        );

        return NextResponse.json({
          success: true,
          results,
          message: "Prompt experiment completed successfully"
        });

      case 'optimize':
        if (!promptId) {
          return NextResponse.json(
            { error: "promptId is required" },
            { status: 400 }
          );
        }

        const optimizedPrompt = await promptOptimizer.optimizePrompt(promptId);

        return NextResponse.json({
          success: true,
          optimized_prompt: optimizedPrompt,
          message: "Prompt optimization completed successfully"
        });

      case 'ab_test':
        if (!promptId || !body.variantA || !body.variantB) {
          return NextResponse.json(
            { error: "promptId, variantA, and variantB are required" },
            { status: 400 }
          );
        }

        const abTestResults = await promptOptimizer.runABTest(
          promptId,
          body.variantA,
          body.variantB,
          body.sampleSize || 100
        );

        return NextResponse.json({
          success: true,
          ab_test_results: abTestResults,
          message: "A/B test completed successfully"
        });

      case 'monitor':
        if (!promptId) {
          return NextResponse.json(
            { error: "promptId is required" },
            { status: 400 }
          );
        }

        const monitoringResults = await promptOptimizer.monitorPromptPerformance(promptId);

        return NextResponse.json({
          success: true,
          monitoring_results: monitoringResults,
          message: "Prompt monitoring completed successfully"
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: run_experiment, optimize, ab_test, monitor" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Prompt optimization error:', error);
    return NextResponse.json(
      { error: "Failed to process prompt optimization request", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const promptId = url.searchParams.get('promptId');
    const days = parseInt(url.searchParams.get('days') || '30');

    if (!promptId) {
      return NextResponse.json(
        { error: "promptId is required" },
        { status: 400 }
      );
    }

    const performanceAnalysis = await promptOptimizer.getPromptPerformanceAnalysis(promptId, days);

    return NextResponse.json({
      success: true,
      performance_analysis: performanceAnalysis,
      prompt_id: promptId,
      analysis_period_days: days
    });

  } catch (error) {
    console.error('Get prompt performance error:', error);
    return NextResponse.json(
      { error: "Failed to get prompt performance analysis" },
      { status: 500 }
    );
  }
}
