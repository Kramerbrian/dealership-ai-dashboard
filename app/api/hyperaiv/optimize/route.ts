import { NextRequest, NextResponse } from 'next/server';
import HyperAIVOptimizer from '@/lib/hyperaiv-optimizer';
import { revalidatePath } from 'next/cache';

/**
 * API Endpoint: /api/hyperaiv/optimize
 * Main HyperAIV™ Optimizer workflow execution endpoint
 * 
 * This endpoint executes the complete HyperAIV continuous-learning workflow:
 * 1. Ingest datasets from Supabase
 * 2. Calibrate model with 8-week rolling regression
 * 3. Reinforce weights using reinforcement learning
 * 4. Predict 4-week AIV trajectory
 * 5. Optimize marketing spend allocation
 * 6. Generate benchmark report
 */
export async function POST(request: NextRequest) {
  try {
    const { dealerId } = await request.json();
    
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing required field: dealerId' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting HyperAIV™ Optimizer for dealer: ${dealerId}`);

    // Initialize HyperAIV Optimizer
    const optimizer = new HyperAIVOptimizer();

    // Execute the complete workflow
    const result = await optimizer.executeWorkflow();

    if (!result.success) {
      return NextResponse.json(
        { error: 'HyperAIV optimization failed', details: result.results },
        { status: 500 }
      );
    }

    // Trigger Vercel ISR revalidation for dashboard updates
    revalidatePath('/dashboard');
    revalidatePath('/api/kpis/latest');
    revalidatePath('/api/history');

    // Log successful completion
    console.log(`✅ HyperAIV™ Optimizer completed for dealer: ${dealerId}`);
    console.log(`📊 Benchmark Results:`, result.benchmark);

    return NextResponse.json({
      success: true,
      message: 'HyperAIV™ optimization completed successfully',
      dealerId,
      benchmark: result.benchmark,
      results: result.results,
      timestamp: new Date().toISOString(),
      workflow_version: '1.0'
    });

  } catch (error) {
    console.error('❌ HyperAIV Optimizer API error:', error);
    return NextResponse.json(
      { 
        error: 'HyperAIV optimization failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * API Endpoint: GET /api/hyperaiv/optimize
 * Get HyperAIV optimizer status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');

    const optimizer = new HyperAIVOptimizer();
    const currentWeights = await optimizer.getCurrentWeights();

    return NextResponse.json({
      success: true,
      dealerId: dealerId || 'default',
      status: 'active',
      current_weights: currentWeights,
      configuration: {
        id: 'hyperAIV_optimizer',
        version: '1.0',
        namespace: 'dealershipAI.workflow',
        frequency: 'weekly',
        last_run: new Date().toISOString()
      },
      expected_outcomes: {
        correlation_aiv_geo: '≥ 0.85',
        mean_latency_days: '≤ 6',
        elasticity_confidence_r2: '≥ 0.8',
        ad_spend_reduction: '≥ 15%',
        lead_volume_increase: '≥ 20%'
      },
      success_criteria: 'ΔAccuracy ≥ 10% MoM and ΔAdEfficiency ≥ 15% MoM with stable R² ≥ 0.8'
    });

  } catch (error) {
    console.error('❌ Error getting HyperAIV status:', error);
    return NextResponse.json(
      { error: 'Failed to get HyperAIV status', details: error.message },
      { status: 500 }
    );
  }
}
