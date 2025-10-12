import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface AccuracyMonitoringInput {
  tenant_id: string;
  measurement_date?: string;
  issue_detection_accuracy: number;
  ranking_correlation: number;
  consensus_reliability: number;
  variance: number;
  confidence_threshold?: number;
  sample_size?: number;
  model_version?: string;
  evaluation_method?: string;
  notes?: string;
}

interface AccuracyMonitoring {
  id: string;
  tenant_id: string;
  measurement_date: string;
  issue_detection_accuracy: number;
  ranking_correlation: number;
  consensus_reliability: number;
  variance: number;
  confidence_level: string;
  confidence_threshold: number;
  is_below_threshold: boolean;
  alert_triggered_at?: string;
  created_at: string;
}

interface AccuracyThreshold {
  metric_name: string;
  warning_threshold: number;
  critical_threshold: number;
  target_threshold?: number;
  alert_enabled: boolean;
}

/**
 * POST /api/accuracy-monitoring
 * Record new accuracy monitoring metrics
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: AccuracyMonitoringInput = await req.json();

    // Validate required fields
    const requiredFields = [
      'tenant_id',
      'issue_detection_accuracy',
      'ranking_correlation',
      'consensus_reliability',
      'variance',
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate metric ranges (0-1)
    const metrics = {
      issue_detection_accuracy: body.issue_detection_accuracy,
      ranking_correlation: body.ranking_correlation,
      consensus_reliability: body.consensus_reliability,
    };

    for (const [key, value] of Object.entries(metrics)) {
      if (value < 0 || value > 1) {
        return NextResponse.json(
          { error: `${key} must be between 0 and 1` },
          { status: 400 }
        );
      }
    }

    // Set tenant context for RLS
    await supabase.rpc('set_config', {
      setting: 'app.tenant',
      value: body.tenant_id,
      is_local: false,
    });

    // Insert monitoring record (triggers will calculate confidence_level and check thresholds)
    const { data, error } = await supabase
      .from('accuracy_monitoring')
      .insert({
        tenant_id: body.tenant_id,
        measurement_date: body.measurement_date || new Date().toISOString(),
        issue_detection_accuracy: body.issue_detection_accuracy,
        ranking_correlation: body.ranking_correlation,
        consensus_reliability: body.consensus_reliability,
        variance: body.variance,
        confidence_threshold: body.confidence_threshold || 5.0,
        sample_size: body.sample_size,
        model_version: body.model_version,
        evaluation_method: body.evaluation_method,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing accuracy monitoring:', error);
      return NextResponse.json(
        { error: 'Failed to store accuracy monitoring', details: error.message },
        { status: 500 }
      );
    }

    // Check if alerts were triggered
    const { data: alerts } = await supabase
      .from('accuracy_alerts')
      .select('*')
      .eq('accuracy_monitoring_id', data.id);

    return NextResponse.json({
      success: true,
      data,
      alerts: alerts || [],
    });
  } catch (error) {
    console.error('Error in POST /api/accuracy-monitoring:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/accuracy-monitoring?tenant_id=xxx&start_date=xxx&end_date=xxx
 * Retrieve accuracy monitoring data
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);

    const tenant_id = searchParams.get('tenant_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '30');
    const include_alerts = searchParams.get('include_alerts') === 'true';

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Set tenant context for RLS
    await supabase.rpc('set_config', {
      setting: 'app.tenant',
      value: tenant_id,
      is_local: false,
    });

    // Build query
    let query = supabase
      .from('accuracy_monitoring')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('measurement_date', { ascending: false })
      .limit(limit);

    if (start_date) {
      query = query.gte('measurement_date', start_date);
    }

    if (end_date) {
      query = query.lte('measurement_date', end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching accuracy monitoring:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accuracy monitoring', details: error.message },
        { status: 500 }
      );
    }

    const metrics = data as AccuracyMonitoring[];

    // Calculate statistics
    const stats = {
      count: metrics.length,
      avg_issue_detection: metrics.reduce((sum, m) => sum + Number(m.issue_detection_accuracy), 0) / metrics.length || 0,
      avg_ranking_correlation: metrics.reduce((sum, m) => sum + Number(m.ranking_correlation), 0) / metrics.length || 0,
      avg_consensus_reliability: metrics.reduce((sum, m) => sum + Number(m.consensus_reliability), 0) / metrics.length || 0,
      avg_variance: metrics.reduce((sum, m) => sum + Number(m.variance), 0) / metrics.length || 0,
      alerts_triggered: metrics.filter(m => m.is_below_threshold).length,
      confidence_distribution: metrics.reduce((acc, m) => {
        acc[m.confidence_level] = (acc[m.confidence_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      latest_date: metrics[0]?.measurement_date,
    };

    // Optionally include alerts
    let alerts = null;
    if (include_alerts) {
      const { data: alertsData } = await supabase
        .from('accuracy_alerts')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('triggered_at', { ascending: false })
        .limit(50);

      alerts = alertsData;
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      stats,
      alerts,
    });
  } catch (error) {
    console.error('Error in GET /api/accuracy-monitoring:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/accuracy-monitoring/thresholds?tenant_id=xxx
 * Get accuracy thresholds configuration
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'get-thresholds') {
      const tenant_id = searchParams.get('tenant_id');
      if (!tenant_id) {
        return NextResponse.json(
          { error: 'tenant_id is required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('accuracy_thresholds')
        .select('*')
        .eq('tenant_id', tenant_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch thresholds', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (action === 'update-thresholds') {
      const body = await req.json();
      const { tenant_id, thresholds } = body;

      if (!tenant_id || !thresholds) {
        return NextResponse.json(
          { error: 'tenant_id and thresholds are required' },
          { status: 400 }
        );
      }

      // Update thresholds
      const updates = thresholds.map((threshold: AccuracyThreshold) =>
        supabase
          .from('accuracy_thresholds')
          .upsert({
            tenant_id,
            metric_name: threshold.metric_name,
            warning_threshold: threshold.warning_threshold,
            critical_threshold: threshold.critical_threshold,
            target_threshold: threshold.target_threshold,
            alert_enabled: threshold.alert_enabled,
          })
          .select()
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Failed to update some thresholds', details: errors },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: results.map(r => r.data),
      });
    }

    if (action === 'acknowledge-alert') {
      const body = await req.json();
      const { alert_id, acknowledged_by, resolution_notes } = body;

      if (!alert_id) {
        return NextResponse.json(
          { error: 'alert_id is required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('accuracy_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by,
          resolution_notes,
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to acknowledge alert', details: error.message },
          { status: 500 }
        );
      }

      // Also update the monitoring record
      if (data.accuracy_monitoring_id) {
        await supabase
          .from('accuracy_monitoring')
          .update({
            alert_acknowledged_at: new Date().toISOString(),
            alert_acknowledged_by: acknowledged_by,
          })
          .eq('id', data.accuracy_monitoring_id);
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/accuracy-monitoring:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
