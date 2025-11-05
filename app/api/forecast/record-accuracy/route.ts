import { NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';

/**
 * POST /api/forecast/record-accuracy
 * 
 * Records actual vs predicted KPI values for adaptive learning
 * This endpoint should be called at the end of each month/period
 * when actual KPI data becomes available.
 */
export const POST = createApiRoute(
  {
    endpoint: '/api/forecast/record-accuracy',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { kpi, predicted, actual, tenantId } = body;

      // Validate inputs
      if (!kpi || typeof predicted !== 'number' || typeof actual !== 'number') {
        return NextResponse.json(
          { error: 'Invalid input. Required: kpi, predicted (number), actual (number)' },
          { status: 400 }
        );
      }

      const validKPIs = ['AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI'];
      if (!validKPIs.includes(kpi)) {
        return NextResponse.json(
          { error: `Invalid KPI. Must be one of: ${validKPIs.join(', ')}` },
          { status: 400 }
        );
      }

      // In production, store in database (e.g., forecast_accuracy_history table)
      // For now, we'll return success and let the client handle localStorage
      // TODO: Implement database storage
      // await db.insert('forecast_accuracy_history', {
      //   tenant_id: tenantId || auth.user.tenantId,
      //   kpi,
      //   predicted,
      //   actual,
      //   error: actual - predicted,
      //   error_pct: ((actual - predicted) / predicted) * 100,
      //   recorded_at: new Date(),
      // });

      return NextResponse.json({
        success: true,
        message: 'Forecast accuracy recorded',
        accuracy: {
          kpi,
          predicted,
          actual,
          error: actual - predicted,
          errorPct: ((actual - predicted) / predicted) * 100,
        },
      });
    } catch (error: any) {
      console.error('Error recording forecast accuracy:', error);
      return NextResponse.json(
        { error: 'Failed to record forecast accuracy', details: error.message },
        { status: 500 }
      );
    }
  }
);

