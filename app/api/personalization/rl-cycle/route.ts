import { NextRequest, NextResponse } from 'next/server';
import {
  runRLCycle,
  getDefaultWeights,
  type ObservationData,
  type ReinforcementWeights,
} from '@/lib/personalization/reinforcement-learning';

export const dynamic = 'force-dynamic';

/**
 * POST /api/personalization/rl-cycle
 * 
 * Run a complete Reinforcement Learning cycle:
 * 1. Observe → Gather behavior + KPI signal metrics
 * 2. Evaluate → Compute confidence_score and classification tier
 * 3. Adapt → Modify forecast range, tone, and message depth
 * 4. Reinforce → Update weights via decay-adjusted learning rate every 14 days
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      predicted_roi,
      actual_roi,
      previous_confidence_score,
      weights,
      kpi_signals,
      behavior_metrics,
    } = body;

    // Validate required fields
    if (
      predicted_roi === undefined ||
      actual_roi === undefined ||
      previous_confidence_score === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: predicted_roi, actual_roi, previous_confidence_score' },
        { status: 400 }
      );
    }

    // Use provided weights or defaults
    const currentWeights: ReinforcementWeights = weights || getDefaultWeights();

    // Run complete RL cycle
    const result = runRLCycle(
      predicted_roi,
      actual_roi,
      previous_confidence_score,
      currentWeights,
      kpi_signals,
      behavior_metrics
    );

    return NextResponse.json({
      success: true,
      data: result,
      cycle_stage: 'complete',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('RL Cycle API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to run RL cycle' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/personalization/rl-cycle
 * 
 * Get current reinforcement learning weights and status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');

    // In production, fetch weights from database based on userId/storeId
    // For now, return default weights
    const weights = getDefaultWeights();

    // Calculate days until next update
    const now = new Date();
    const lastUpdate = new Date(weights.last_update);
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const daysUntilUpdate = Math.max(0, weights.update_cycle_days - daysSinceUpdate);

    return NextResponse.json({
      success: true,
      data: {
        weights,
        status: {
          days_since_update: Math.round(daysSinceUpdate * 100) / 100,
          days_until_next_update: Math.round(daysUntilUpdate * 100) / 100,
          ready_for_update: daysSinceUpdate >= weights.update_cycle_days,
        },
      },
    });
  } catch (error: any) {
    console.error('RL Cycle GET API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch RL weights' },
      { status: 500 }
    );
  }
}

