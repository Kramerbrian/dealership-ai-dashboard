import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface ForecastRequest {
  dealerId: string;
  historicalAIVR?: number[];
  currentAIVR: number;
  currentRisk: number;
  alpha?: number;
}

interface ForecastResponse {
  dealerId: string;
  nextMonthAIVR: number;
  projectedRevenueGain: number;
  forecast_summary: string;
  confidence?: number;
}

/**
 * Exponential smoothing forecast for chat agent.
 * 
 * Formula:
 * AIVR_next = α * AIVR_current + (1 − α) * AIVR_smoothed_previous
 * RevenueGain = (AIVR_current − AIVR_smoothed_previous) × RevenueRisk × 1.2
 * 
 * @param history - Array of historical AIVR values (0-1 scale)
 * @param currentAIVR - Current AIVR score (0-1 scale)
 * @param currentRisk - Current revenue at risk (USD)
 * @param alpha - Smoothing factor (default 0.35)
 */
function forecastAIVR(
  history: number[] | undefined,
  currentAIVR: number,
  currentRisk: number,
  alpha: number = 0.35
): { next: number; gain: number; confidence: number } {
  // If no history, return conservative projection
  if (!history || history.length === 0) {
    const next = Math.min(1, currentAIVR * 1.01);
    return {
      next: parseFloat(next.toFixed(3)),
      gain: 0,
      confidence: 0.3 // Low confidence without history
    };
  }

  // Exponential smoothing
  let smoothed = history[0];
  for (let i = 1; i < history.length; i++) {
    smoothed = alpha * history[i] + (1 - alpha) * smoothed;
  }

  // Project next month with trend adjustment
  const trend = smoothed > history[history.length - 1] ? 1.02 : 1.01;
  const next = Math.min(1, smoothed * trend);

  // Calculate revenue recovery potential
  const smoothedRevenue = (1 - smoothed) * (currentRisk / (1 - currentAIVR)) * (1 - currentAIVR);
  const gain = Math.max(0, (currentRisk - smoothedRevenue) * 1.2);

  // Confidence based on history length and variance
  const variance = history.reduce((sum, val) => sum + Math.pow(val - smoothed, 2), 0) / history.length;
  const confidence = Math.min(0.95, 0.5 + (history.length / 10) * 0.3 - variance * 0.5);

  return {
    next: parseFloat(next.toFixed(3)),
    gain: Math.round(gain),
    confidence: parseFloat(confidence.toFixed(2))
  };
}

/**
 * POST /api/agent/forecast
 * 
 * Returns forecasted AIVR™ and revenue recovery for chat agent responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ForecastRequest;
    const { dealerId, historicalAIVR, currentAIVR, currentRisk, alpha } = body;

    if (currentAIVR === undefined || currentRisk === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: currentAIVR and currentRisk are required',
        },
        { status: 400 }
      );
    }

    const { next, gain, confidence } = forecastAIVR(
      historicalAIVR,
      currentAIVR,
      currentRisk,
      alpha
    );

    const summary = historicalAIVR && historicalAIVR.length > 0
      ? `If your current trend continues, your AIVR™ is expected to reach ${(next * 100).toFixed(
          1
        )}% next month — recovering roughly $${Math.round(
          gain
        ).toLocaleString()} in monthly revenue at risk.`
      : `Based on your current AIVR™ of ${(currentAIVR * 100).toFixed(1)}%, we need more historical data to provide an accurate forecast.`;

    const response: ForecastResponse = {
      dealerId: dealerId || 'current',
      nextMonthAIVR: next,
      projectedRevenueGain: gain,
      forecast_summary: summary,
      confidence
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate forecast',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/forecast
 * 
 * Returns forecast for a dealer (requires dealerId query param)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dealerId = searchParams.get('dealerId') || 'current';

    // Try to fetch current metrics from visibility API
    try {
      const visibilityResponse = await fetch(
        `${request.nextUrl.origin}/api/agent/visibility?dealerId=${dealerId}`,
        {
          headers: {
            'Cookie': request.headers.get('Cookie') || '',
          },
        }
      );

      if (visibilityResponse.ok) {
        const visibilityData = await visibilityResponse.json();
        
        // Try to fetch historical data (you can replace this with your actual data source)
        // For now, we'll use a mock or empty history
        const historicalAIVR: number[] = []; // TODO: Fetch from database

        const { next, gain, confidence } = forecastAIVR(
          historicalAIVR.length > 0 ? historicalAIVR : undefined,
          visibilityData.AIVR_score || 0,
          visibilityData.Revenue_at_Risk_USD || 0
        );

        const summary = historicalAIVR.length > 0
          ? `If your current trend continues, your AIVR™ is expected to reach ${(next * 100).toFixed(
              1
            )}% next month — recovering roughly $${Math.round(
              gain
            ).toLocaleString()} in monthly revenue at risk.`
          : `Based on your current AIVR™ of ${((visibilityData.AIVR_score || 0) * 100).toFixed(1)}%, we need more historical data to provide an accurate forecast.`;

        return NextResponse.json({
          dealerId,
          nextMonthAIVR: next,
          projectedRevenueGain: gain,
          forecast_summary: summary,
          confidence
        });
      }
    } catch (error) {
      console.error('Failed to fetch visibility data:', error);
    }

    // Fallback response
    return NextResponse.json(
      {
        error: 'Unable to fetch dealer metrics',
        message: 'Please provide currentAIVR and currentRisk in POST request',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate forecast',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

