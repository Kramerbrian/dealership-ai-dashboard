import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get cron job health summary
    const { data: healthData, error: healthError } = await supabase
      .rpc('get_cron_health_summary');

    if (healthError) {
      console.error('Error fetching cron health:', healthError);
      return NextResponse.json(
        { error: 'Failed to fetch cron health data' },
        { status: 500 }
      );
    }

    // Get recent executions (last 24 hours)
    const { data: recentExecutions, error: execError } = await supabase
      .from('cron_job_executions')
      .select('*')
      .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false })
      .limit(50);

    if (execError) {
      console.error('Error fetching recent executions:', execError);
    }

    // Calculate overall system health
    const criticalJobs = healthData?.filter((job: any) => job.health_status === 'critical').length || 0;
    const degradedJobs = healthData?.filter((job: any) => job.health_status === 'degraded').length || 0;
    const healthyJobs = healthData?.filter((job: any) => job.health_status === 'healthy').length || 0;

    const overallHealth = criticalJobs > 0 ? 'critical' : degradedJobs > 0 ? 'degraded' : 'healthy';
    const totalJobs = healthData?.length || 0;
    const avgSuccessRate = healthData?.reduce((sum: number, job: any) => sum + (Number(job.success_rate) || 0), 0) / (totalJobs || 1);

    return NextResponse.json({
      success: true,
      overall_health: {
        status: overallHealth,
        total_jobs: totalJobs,
        healthy: healthyJobs,
        degraded: degradedJobs,
        critical: criticalJobs,
        avg_success_rate: avgSuccessRate.toFixed(2) + '%',
        last_checked: new Date().toISOString()
      },
      jobs: healthData || [],
      recent_executions: recentExecutions || [],
      alerts: generateAlerts(healthData || [])
    });

  } catch (error) {
    console.error('Cron health check error:', error);
    return NextResponse.json(
      {
        error: "Failed to check cron health",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const {
      job_name,
      endpoint,
      status,
      status_code,
      execution_time_ms,
      error_message,
      response_data
    } = body;

    if (!job_name || !endpoint || !status) {
      return NextResponse.json(
        { error: "job_name, endpoint, and status are required" },
        { status: 400 }
      );
    }

    // Log execution using database function
    const { data, error } = await supabase.rpc('log_cron_execution', {
      p_job_name: job_name,
      p_endpoint: endpoint,
      p_status: status,
      p_status_code: status_code,
      p_execution_time_ms: execution_time_ms,
      p_error_message: error_message,
      p_response_data: response_data
    });

    if (error) {
      console.error('Error logging cron execution:', error);
      return NextResponse.json(
        { error: 'Failed to log cron execution' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cron execution logged successfully",
      execution_id: data
    });

  } catch (error) {
    console.error('Log cron execution error:', error);
    return NextResponse.json(
      {
        error: "Failed to log cron execution",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateAlerts(healthData: any[]): any[] {
  const alerts: any[] = [];

  healthData.forEach((job: any) => {
    if (job.health_status === 'critical') {
      alerts.push({
        severity: 'critical',
        job_name: job.job_name,
        message: `${job.job_name} has ${job.consecutive_failures} consecutive failures`,
        action: 'Immediate investigation required'
      });
    } else if (job.health_status === 'degraded') {
      alerts.push({
        severity: 'warning',
        job_name: job.job_name,
        message: `${job.job_name} is experiencing failures`,
        action: 'Monitor closely'
      });
    }

    // Alert if job hasn't run in expected timeframe
    if (job.last_run_at) {
      const lastRun = new Date(job.last_run_at).getTime();
      const now = Date.now();
      const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

      // Check based on schedule
      const expectedHours: Record<string, number> = {
        'retrain-aiv': 25, // daily + 1 hour buffer
        'evaluate-aiv': 169, // weekly + 1 hour buffer
        'fraudguard-scan': 7, // every 6 hours + 1 hour buffer
        'predict-forecast': 169, // weekly + 1 hour buffer
        'generate-roi-report': 745 // monthly + 1 hour buffer
      };

      if (expectedHours[job.job_name] && hoursSinceLastRun > expectedHours[job.job_name]) {
        alerts.push({
          severity: 'warning',
          job_name: job.job_name,
          message: `${job.job_name} has not run in ${Math.floor(hoursSinceLastRun)} hours`,
          action: 'Check Vercel cron configuration'
        });
      }
    }

    // Alert if success rate is low
    if (Number(job.success_rate) < 80 && job.total_executions > 5) {
      alerts.push({
        severity: 'warning',
        job_name: job.job_name,
        message: `${job.job_name} has low success rate: ${job.success_rate}%`,
        action: 'Review error logs and fix underlying issues'
      });
    }
  });

  return alerts;
}
