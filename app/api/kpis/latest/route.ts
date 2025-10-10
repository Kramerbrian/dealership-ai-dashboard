import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId');

    // Mock KPIs data - replace with actual database queries
    const kpis = {
      aiv_metrics: {
        current_aiv: 78.5,
        previous_aiv: 75.2,
        delta_aiv: 3.3,
        aiv_trend: 'up',
        confidence_interval: [76.1, 80.9]
      },
      roi_metrics: {
        current_roi: 15.2,
        previous_roi: 12.8,
        delta_roi: 2.4,
        roi_trend: 'up',
        projected_monthly_gain: 12500
      },
      ad_efficiency: {
        current_cpl: 45.2,
        previous_cpl: 52.8,
        delta_cpl: -7.6,
        efficiency_trend: 'improving',
        spend_reduction: 18.5
      },
      lead_metrics: {
        current_leads: 245,
        previous_leads: 198,
        delta_leads: 47,
        lead_trend: 'up',
        conversion_rate: 12.3
      },
      model_performance: {
        r2: 0.847,
        rmse: 3.2,
        mape: 4.1,
        last_training: new Date().toISOString(),
        model_version: 'v1.0'
      },
      last_updated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      kpis,
      dealer_id: dealerId,
      refresh_status: 'completed',
      next_refresh: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    });

  } catch (error) {
    console.error('Get KPIs error:', error);
    return NextResponse.json(
      { error: "Failed to get latest KPIs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, dealerId } = body;

    if (action === 'refresh') {
      // Trigger dashboard refresh
      const refreshResults = {
        refresh_id: crypto.randomUUID(),
        refresh_time: new Date().toISOString(),
        status: 'completed',
        updated_metrics: [
          'aiv_metrics',
          'roi_metrics', 
          'ad_efficiency',
          'lead_metrics',
          'model_performance'
        ],
        cache_cleared: true
      };

      return NextResponse.json({
        success: true,
        message: "Dashboard refresh completed successfully",
        refresh_results: refreshResults
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: refresh" },
      { status: 400 }
    );

  } catch (error) {
    console.error('Refresh dashboard error:', error);
    return NextResponse.json(
      { error: "Failed to refresh dashboard" },
      { status: 500 }
    );
  }
}
