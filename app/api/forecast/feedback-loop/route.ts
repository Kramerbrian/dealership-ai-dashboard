import { NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { calculateFeedbackLoop, calculateActualROI } from '@/lib/forecast-feedback-loop';
import type { ForecastRecord, PerformanceInputs } from '@/lib/forecast-feedback-loop';

/**
 * POST /api/forecast/feedback-loop
 * 
 * Processes forecast feedback loop to recalibrate confidence scores
 * based on actual vs predicted ROI results.
 */
export const POST = createApiRoute(
  {
    endpoint: '/api/forecast/feedback-loop',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { 
        forecast_records, 
        performance_inputs, 
        previous_confidence_score = 0.89 
      } = body;

      // Validate inputs
      if (!forecast_records || !Array.isArray(forecast_records) || forecast_records.length === 0) {
        return NextResponse.json(
          { error: 'Invalid input. Required: forecast_records (array)' },
          { status: 400 }
        );
      }

      if (!performance_inputs) {
        return NextResponse.json(
          { error: 'Invalid input. Required: performance_inputs' },
          { status: 400 }
        );
      }

      // Validate forecast records
      const records: ForecastRecord[] = forecast_records.map((record: any) => ({
        forecast_id: record.forecast_id || `forecast_${Date.now()}`,
        forecast_date: record.forecast_date || new Date().toISOString().split('T')[0],
        forecast_window_days: record.forecast_window_days || 30,
        predicted_roi: record.predicted_roi,
        actual_roi: record.actual_roi || calculateActualROI(performance_inputs),
        predicted_confidence: record.predicted_confidence || previous_confidence_score,
        role: record.role || 'GM',
      }));

      // Validate performance inputs
      const perfInputs: PerformanceInputs = {
        actual_lead_volume: performance_inputs.actual_lead_volume || 0,
        actual_close_rate: performance_inputs.actual_close_rate || 0,
        actual_avg_gross: performance_inputs.actual_avg_gross || 0,
        actual_engagement_velocity: performance_inputs.actual_engagement_velocity || 0,
        // Enhanced behavioral metrics
        alert_ack_rate: performance_inputs.alert_ack_rate,
        action_follow_through_rate: performance_inputs.action_follow_through_rate,
        avg_response_time_hours: performance_inputs.avg_response_time_hours,
        // Enhanced performance metrics
        DPI_trend: performance_inputs.DPI_trend,
        LEE_change: performance_inputs.LEE_change,
        DLOC_reduction: performance_inputs.DLOC_reduction,
        trend_direction: performance_inputs.trend_direction,
      };

      // Calculate feedback loop
      const result = calculateFeedbackLoop({
        forecast_records: records,
        performance_inputs: perfInputs,
        previous_confidence_score,
      });

      // In production, store feedback loop results in database
      // TODO: Implement database storage
      // await db.insert('forecast_feedback_loops', {
      //   tenant_id: auth.user.tenantId,
      //   forecast_records: records,
      //   performance_inputs: perfInputs,
      //   result: result,
      //   created_at: new Date(),
      // });

      return NextResponse.json({
        success: true,
        version: '3.6.3',
        namespace: 'forecast.feedback.loop',
        result,
      });
    } catch (error: any) {
      console.error('Error processing feedback loop:', error);
      return NextResponse.json(
        { error: 'Failed to process feedback loop', details: error.message },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/forecast/feedback-loop
 * 
 * Retrieves feedback loop history
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/forecast/feedback-loop',
    requireAuth: true,
    rateLimit: true,
  },
  async (req, auth) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '30');

      // TODO: Fetch from database
      // const history = await db.select('forecast_feedback_loops')
      //   .where('tenant_id', auth.user.tenantId)
      //   .orderBy('created_at', 'desc')
      //   .limit(limit);

      return NextResponse.json({
        success: true,
        history: [], // Placeholder
        message: 'Feedback loop history retrieved',
      });
    } catch (error: any) {
      console.error('Error fetching feedback loop history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback loop history', details: error.message },
        { status: 500 }
      );
    }
  }
);

