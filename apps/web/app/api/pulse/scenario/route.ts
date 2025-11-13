/**
 * POST /api/pulse/scenario - Run scenario modeling
 * Executes Monte Carlo simulation for what-if scenario analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScenario, type ScenarioInput } from '@/lib/pulse/scenario';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      );
    }

    if (!body.currentSignals) {
      return NextResponse.json(
        { error: 'currentSignals is required' },
        { status: 400 }
      );
    }

    if (!body.actions || !Array.isArray(body.actions) || body.actions.length === 0) {
      return NextResponse.json(
        { error: 'actions array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate signals
    const requiredSignals = ['aiv', 'ati', 'zero_click', 'ugc_health', 'geo_trust'];
    for (const signal of requiredSignals) {
      if (typeof body.currentSignals[signal] !== 'number') {
        return NextResponse.json(
          { error: 'currentSignals.' + signal + ' must be a number' },
          { status: 400 }
        );
      }
    }

    // Validate actions
    for (let i = 0; i < body.actions.length; i++) {
      const action = body.actions[i];
      
      if (!action.type || !['improve_aiv', 'improve_ati', 'improve_zero_click', 'improve_ugc', 'improve_geo'].includes(action.type)) {
        return NextResponse.json(
          { error: 'actions[' + i + '].type must be a valid action type' },
          { status: 400 }
        );
      }

      if (typeof action.magnitude !== 'number' || action.magnitude < 0 || action.magnitude > 100) {
        return NextResponse.json(
          { error: 'actions[' + i + '].magnitude must be a number between 0 and 100' },
          { status: 400 }
        );
      }

      if (typeof action.confidence !== 'number' || action.confidence < 0 || action.confidence > 1) {
        return NextResponse.json(
          { error: 'actions[' + i + '].confidence must be a number between 0 and 1' },
          { status: 400 }
        );
      }

      if (typeof action.timeframe !== 'number' || action.timeframe < 1) {
        return NextResponse.json(
          { error: 'actions[' + i + '].timeframe must be a positive number (days)' },
          { status: 400 }
        );
      }
    }

    const scenarioInput: ScenarioInput = {
      dealerId: body.dealerId,
      currentSignals: body.currentSignals,
      actions: body.actions,
      simulations: body.simulations || 1000,
    };

    // Run scenario simulation
    const result = await runScenario(scenarioInput);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        simulationsRun: scenarioInput.simulations,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Scenario endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run scenario simulation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
