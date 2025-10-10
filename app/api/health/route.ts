/**
 * Health Check API endpoint for monitoring system status
 * Provides comprehensive health status for all system components
 * Part of the production monitoring and observability system
 */

import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client only if environment variables are available
let supabase: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.warn('Supabase client initialization failed:', error);
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthChecks: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Check database connectivity
    const dbCheck = await checkDatabaseHealth();
    healthChecks.checks.database = dbCheck;

    // Check API endpoints
    const apiCheck = await checkAPIEndpoints();
    healthChecks.checks.api = apiCheck;

    // Check system resources
    const resourceCheck = await checkSystemResources();
    healthChecks.checks.resources = resourceCheck;

    // Check data pipeline
    const pipelineCheck = await checkDataPipeline();
    healthChecks.checks.pipeline = pipelineCheck;

    // Check model performance
    const modelCheck = await checkModelPerformance();
    healthChecks.checks.model = modelCheck;

    // Determine overall status
    const allChecks = Object.values(healthChecks.checks);
    const failedChecks = allChecks.filter((check: any) => check.status === 'unhealthy');
    
    if (failedChecks.length > 0) {
      healthChecks.status = 'degraded';
    }

    const criticalFailures = allChecks.filter((check: any) => check.status === 'critical');
    if (criticalFailures.length > 0) {
      healthChecks.status = 'unhealthy';
    }

    // Add response time
    healthChecks.response_time_ms = Date.now() - startTime;

    // Set appropriate HTTP status
    const httpStatus = healthChecks.status === 'healthy' ? 200 : 
                      healthChecks.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthChecks, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'critical',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time_ms: Date.now() - startTime
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    if (!supabase) {
      return {
        status: 'degraded',
        message: 'Supabase not configured - using mock data',
        details: { configured: false },
        response_time_ms: Date.now() - startTime
      };
    }

    // Test basic connectivity
    const { data, error } = await supabase
      .from('aiv_raw_signals')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message,
        response_time_ms: Date.now() - startTime
      };
    }

    // Test database functions
    const { data: healthData, error: healthError } = await supabase
      .rpc('health_ping');

    if (healthError) {
      return {
        status: 'degraded',
        message: 'Database functions not available',
        error: healthError.message,
        response_time_ms: Date.now() - startTime
      };
    }

    return {
      status: 'healthy',
      message: 'Database connection successful',
      details: healthData?.[0] || {},
      response_time_ms: Date.now() - startTime
    };

  } catch (error) {
    return {
      status: 'critical',
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time_ms: 0
    };
  }
}

/**
 * Check API endpoints health
 */
async function checkAPIEndpoints() {
  const endpoints = [
    '/api/kpis/latest',
    '/api/history',
    '/api/prompts/latest'
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}?dealerId=test`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        return {
          endpoint,
          status: response.ok ? 'healthy' : 'unhealthy',
          status_code: response.status,
          response_time_ms: 0 // Would need to measure actual response time
        };
      } catch (error) {
        return {
          endpoint,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  const endpointResults = results.map((result, index) => ({
    endpoint: endpoints[index],
    status: result.status === 'fulfilled' ? result.value.status : 'unhealthy',
    details: result.status === 'fulfilled' ? result.value : { error: 'Request failed' }
  }));

  const healthyEndpoints = endpointResults.filter(r => r.status === 'healthy').length;
  const totalEndpoints = endpointResults.length;

  return {
    status: healthyEndpoints === totalEndpoints ? 'healthy' : 
            healthyEndpoints > totalEndpoints / 2 ? 'degraded' : 'unhealthy',
    message: `${healthyEndpoints}/${totalEndpoints} endpoints healthy`,
    endpoints: endpointResults
  };
}

/**
 * Check system resources
 */
async function checkSystemResources() {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculate memory usage percentage (rough estimate)
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    // Check if memory usage is concerning
    const memoryStatus = memoryUsagePercent > 90 ? 'unhealthy' :
                        memoryUsagePercent > 75 ? 'degraded' : 'healthy';

    return {
      status: memoryStatus,
      message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
      details: {
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: memoryUsagePercent
        },
        uptime: process.uptime(),
        node_version: process.version,
        platform: process.platform
      }
    };

  } catch (error) {
    return {
      status: 'degraded',
      message: 'Unable to check system resources',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check data pipeline health
 */
async function checkDataPipeline() {
  try {
    if (!supabase) {
      return {
        status: 'degraded',
        message: 'Supabase not configured - using mock data pipeline',
        details: {
          latest_data_age_hours: 2,
          recent_failures: 0,
          recent_data_points: 5
        }
      };
    }

    // Check recent data ingestion
    const { data: recentData, error: dataError } = await supabase
      .from('aiv_raw_signals')
      .select('date, dealer_id')
      .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(10);

    if (dataError) {
      return {
        status: 'unhealthy',
        message: 'Failed to check recent data',
        error: dataError.message
      };
    }

    // Check for data freshness
    const latestData = recentData?.[0];
    const dataAge = latestData ? 
      Date.now() - new Date(latestData.date).getTime() : 
      Infinity;

    const dataAgeHours = dataAge / (1000 * 60 * 60);
    
    const dataStatus = dataAgeHours > 48 ? 'unhealthy' :
                      dataAgeHours > 24 ? 'degraded' : 'healthy';

    // Check for any recent failures
    const { data: failures, error: failureError } = await supabase
      .from('aoer_failures')
      .select('count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const failureCount = failures?.[0]?.count || 0;
    const failureStatus = failureCount > 10 ? 'unhealthy' :
                         failureCount > 5 ? 'degraded' : 'healthy';

    const overallStatus = dataStatus === 'unhealthy' || failureStatus === 'unhealthy' ? 'unhealthy' :
                         dataStatus === 'degraded' || failureStatus === 'degraded' ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      message: `Data age: ${dataAgeHours.toFixed(1)}h, Failures: ${failureCount}`,
      details: {
        latest_data_age_hours: dataAgeHours,
        recent_failures: failureCount,
        recent_data_points: recentData?.length || 0
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Data pipeline check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check model performance
 */
async function checkModelPerformance() {
  try {
    if (!supabase) {
      return {
        status: 'degraded',
        message: 'Supabase not configured - using mock model performance',
        details: {
          average_r2: 0.87,
          average_rmse: 3.2,
          average_mape: 0.08,
          evaluations_count: 5,
          last_evaluation: new Date().toISOString(),
          performance_breakdown: {
            r2_status: 'healthy',
            rmse_status: 'healthy',
            mape_status: 'healthy'
          }
        }
      };
    }

    // Get recent model evaluation results
    const { data: evaluations, error: evalError } = await supabase
      .from('model_audit')
      .select('r2, rmse, mape, run_date')
      .eq('run_type', 'evaluate')
      .gte('run_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('run_date', { ascending: false })
      .limit(10);

    if (evalError) {
      return {
        status: 'degraded',
        message: 'Unable to check model performance',
        error: evalError.message
      };
    }

    if (!evaluations || evaluations.length === 0) {
      return {
        status: 'degraded',
        message: 'No recent model evaluations found',
        details: {
          evaluations_count: 0,
          last_evaluation: null
        }
      };
    }

    // Calculate average performance metrics
    const avgR2 = evaluations.reduce((sum, e) => sum + (e.r2 || 0), 0) / evaluations.length;
    const avgRMSE = evaluations.reduce((sum, e) => sum + (e.rmse || 0), 0) / evaluations.length;
    const avgMAPE = evaluations.reduce((sum, e) => sum + (e.mape || 0), 0) / evaluations.length;

    // Determine model health based on performance thresholds
    const r2Status = avgR2 > 0.8 ? 'healthy' : avgR2 > 0.6 ? 'degraded' : 'unhealthy';
    const rmseStatus = avgRMSE < 5 ? 'healthy' : avgRMSE < 10 ? 'degraded' : 'unhealthy';
    const mapeStatus = avgMAPE < 0.1 ? 'healthy' : avgMAPE < 0.2 ? 'degraded' : 'unhealthy';

    const overallStatus = r2Status === 'unhealthy' || rmseStatus === 'unhealthy' || mapeStatus === 'unhealthy' ? 'unhealthy' :
                         r2Status === 'degraded' || rmseStatus === 'degraded' || mapeStatus === 'degraded' ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      message: `R²: ${avgR2.toFixed(3)}, RMSE: ${avgRMSE.toFixed(2)}, MAPE: ${avgMAPE.toFixed(3)}`,
      details: {
        average_r2: avgR2,
        average_rmse: avgRMSE,
        average_mape: avgMAPE,
        evaluations_count: evaluations.length,
        last_evaluation: evaluations[0]?.run_date,
        performance_breakdown: {
          r2_status: r2Status,
          rmse_status: rmseStatus,
          mape_status: mapeStatus
        }
      }
    };

  } catch (error) {
    return {
      status: 'degraded',
      message: 'Model performance check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}