import { NextRequest, NextResponse } from "next/server";
import { hyperAIVOptimizer } from "@/lib/hyperaiv-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, reportPeriod = 'monthly' } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: "dealerId is required" },
        { status: 400 }
      );
    }

    // Execute HyperAIV workflow to generate ROI report
    const results = await hyperAIVOptimizer.executeWorkflow(dealerId);

    // Generate comprehensive ROI report
    const roiReport = {
      report_id: crypto.randomUUID(),
      report_type: 'roi_analysis',
      report_period: reportPeriod,
      generated_at: new Date().toISOString(),
      dealer_id: dealerId,
      
      executive_summary: {
        total_roi_improvement: results.evaluation_metrics.roi_gain_percent,
        projected_revenue_gain: results.forecast.projected_revenue_gain,
        ad_spend_savings: results.ad_spend_reallocation.projected_savings,
        lead_volume_increase: results.benchmark_report.outcomes.lead_volume_increase,
        model_accuracy: results.calibration_metrics.r2
      },

      detailed_metrics: {
        aiv_performance: {
          current_aiv: 78.5,
          target_aiv: 85.0,
          improvement_potential: 6.5,
          elasticity_usd_per_pt: results.calibration_metrics.elasticity_usd_per_pt
        },
        
        roi_breakdown: {
          organic_visibility_gain: results.forecast.projected_revenue_gain * 0.6,
          ad_efficiency_gain: results.ad_spend_reallocation.projected_savings,
          lead_quality_improvement: results.forecast.projected_revenue_gain * 0.3,
          cost_reduction: results.ad_spend_reallocation.projected_savings * 0.8
        },

        marketing_optimization: {
          current_ad_spend: results.ad_spend_reallocation.current_ad_spend,
          recommended_reallocation: results.ad_spend_reallocation.recommended_reallocation,
          inefficient_channels: results.ad_spend_reallocation.inefficient_channels.length,
          projected_savings: results.ad_spend_reallocation.projected_savings
        },

        model_performance: {
          accuracy_gain: results.evaluation_metrics.accuracy_gain_percent,
          r2_score: results.calibration_metrics.r2,
          rmse: results.calibration_metrics.rmse,
          correlation_aiv_geo: results.calibration_metrics.correlation_aiv_geo
        }
      },

      recommendations: [
        {
          priority: 'high',
          category: 'AIV Optimization',
          recommendation: 'Focus on GEO pillar optimization to achieve target AIV of 85.0',
          expected_impact: '$8,500 monthly revenue increase',
          effort_required: '2-3 weeks',
          cost: '$2,000'
        },
        {
          priority: 'high',
          category: 'Ad Spend Optimization',
          recommendation: 'Reallocate budget from inefficient channels to high-ROI activities',
          expected_impact: `$${results.ad_spend_reallocation.projected_savings} monthly savings`,
          effort_required: '1 week',
          cost: '$500'
        },
        {
          priority: 'medium',
          category: 'Model Enhancement',
          recommendation: 'Implement weekly model retraining for improved accuracy',
          expected_impact: '5-10% accuracy improvement',
          effort_required: '1 week',
          cost: '$1,000'
        }
      ],

      forecast: {
        next_4_weeks: results.forecast,
        confidence_level: 'high',
        risk_factors: [
          'Market competition changes',
          'Algorithm updates from AI platforms',
          'Seasonal demand fluctuations'
        ]
      },

      success_criteria: {
        target_accuracy_gain: '≥ 10%',
        target_ad_efficiency: '≥ 15%',
        target_r2_stability: '≥ 0.8',
        current_status: results.benchmark_report.success_criteria_met ? 'meeting' : 'below_target'
      }
    };

    return NextResponse.json({
      success: true,
      message: "ROI report generated successfully",
      roi_report: roiReport,
      execution_time_ms: results.execution_time_ms
    });

  } catch (error) {
    console.error('ROI report generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate ROI report", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId');
    const reportId = url.searchParams.get('reportId');

    if (!dealerId) {
      return NextResponse.json(
        { error: "dealerId is required" },
        { status: 400 }
      );
    }

    // Mock ROI report data - replace with actual database query
    const mockROIReport = {
      report_id: reportId || crypto.randomUUID(),
      report_type: 'roi_analysis',
      generated_at: new Date().toISOString(),
      dealer_id: dealerId,
      
      executive_summary: {
        total_roi_improvement: 18.5,
        projected_revenue_gain: 15000,
        ad_spend_savings: 5000,
        lead_volume_increase: 22.3,
        model_accuracy: 0.847
      },

      current_metrics: {
        aiv_score: 78.5,
        roi_percentage: 15.2,
        ad_efficiency: 85.3,
        lead_conversion: 12.3
      }
    };

    return NextResponse.json({
      success: true,
      roi_report: mockROIReport
    });

  } catch (error) {
    console.error('Get ROI report error:', error);
    return NextResponse.json(
      { error: "Failed to get ROI report" },
      { status: 500 }
    );
  }
}