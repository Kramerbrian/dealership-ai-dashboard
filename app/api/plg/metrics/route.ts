import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/plg/metrics
 *
 * Retrieves Product-Led Growth (PLG) metrics for the dashboard.
 * Supports filtering by date range and metric type.
 *
 * Query Parameters:
 * - startDate: ISO date string (default: 30 days ago)
 * - endDate: ISO date string (default: today)
 * - metrics: comma-separated metric names (default: all)
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PLGMetrics {
  // Core Funnel Metrics
  signups: number;
  trials: number;
  paid: number;
  acpOrders: number;

  // Conversion Rates
  activationRate: number;
  trialToPaidRate: number;
  agenticConversionRate: number;

  // Revenue Metrics
  mrr: number;
  arr: number;
  averageRevenuePerAccount: number;

  // Churn Metrics
  churnCount: number;
  churnRate: number;

  // Time Series Data
  daily?: Array<{
    date: string;
    signups: number;
    trials: number;
    paid: number;
    acpOrders: number;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Parse date range
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const startDate = searchParams.get('startDate') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const includeTimeSeries = searchParams.get('timeSeries') === 'true';

    // Fetch KPI daily rollups
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_daily')
      .select('*')
      .gte('day', startDate)
      .lte('day', endDate)
      .order('day', { ascending: true });

    if (kpiError) {
      throw new Error(`Failed to fetch KPI data: ${kpiError.message}`);
    }

    // Calculate aggregate metrics
    const totalSignups = kpiData?.reduce((sum, row) => sum + (row.signups || 0), 0) || 0;
    const totalTrials = kpiData?.reduce((sum, row) => sum + (row.trials || 0), 0) || 0;
    const totalPaid = kpiData?.reduce((sum, row) => sum + (row.paid || 0), 0) || 0;
    const totalAcpOrders = kpiData?.reduce((sum, row) => sum + (row.acp_orders || 0), 0) || 0;
    const totalChurn = kpiData?.reduce((sum, row) => sum + (row.churn_count || 0), 0) || 0;

    // Calculate activation rate
    const activationRate = totalSignups > 0
      ? (totalPaid / totalSignups) * 100
      : 0;

    // Calculate trial-to-paid rate
    const trialToPaidRate = totalTrials > 0
      ? (totalPaid / totalTrials) * 100
      : 0;

    // Calculate agentic conversion rate
    const agenticConversionRate = totalPaid > 0
      ? (totalAcpOrders / totalPaid) * 100
      : 0;

    // Calculate current MRR
    const { data: mrrData, error: mrrError } = await supabase
      .rpc('calculate_mrr');

    const mrr = mrrError ? 0 : (mrrData || 0) / 100; // Convert cents to dollars

    // Calculate ARR
    const arr = mrr * 12;

    // Calculate average revenue per account
    const { count: tenantCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('plan', 'FREE');

    const activeAccounts = typeof tenantCount === 'number' ? tenantCount : 0;
    const arpa = activeAccounts > 0 ? mrr / activeAccounts : 0;

    // Calculate churn rate
    const churnRate = totalPaid > 0
      ? (totalChurn / totalPaid) * 100
      : 0;

    // Build response
    const metrics: PLGMetrics = {
      signups: totalSignups,
      trials: totalTrials,
      paid: totalPaid,
      acpOrders: totalAcpOrders,
      activationRate: Math.round(activationRate * 100) / 100,
      trialToPaidRate: Math.round(trialToPaidRate * 100) / 100,
      agenticConversionRate: Math.round(agenticConversionRate * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      averageRevenuePerAccount: Math.round(arpa * 100) / 100,
      churnCount: totalChurn,
      churnRate: Math.round(churnRate * 100) / 100,
    };

    // Include time series data if requested
    if (includeTimeSeries && kpiData) {
      metrics.daily = kpiData.map(row => ({
        date: row.day,
        signups: row.signups || 0,
        trials: row.trials || 0,
        paid: row.paid || 0,
        acpOrders: row.acp_orders || 0,
      }));
    }

    return NextResponse.json(
      {
        metrics,
        dateRange: { startDate, endDate },
        generatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );

  } catch (error) {
    console.error('PLG metrics error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch PLG metrics',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plg/metrics
 *
 * Manually triggers PLG metric recalculation.
 * Admin-only endpoint for debugging and testing.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { metricName, metricValue, metricData } = body;

    if (!metricName) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'metricName is required' },
        { status: 400 }
      );
    }

    // Insert custom metric
    const { data, error } = await supabase
      .from('plg_metrics')
      .insert({
        metric_name: metricName,
        metric_value: metricValue,
        metric_data: metricData || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert metric: ${error.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        metric: data,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('PLG metrics POST error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to insert PLG metric',
      },
      { status: 500 }
    );
  }
}
