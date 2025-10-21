import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  database: {
    connected: boolean;
    poolSize?: number;
    activeConnections?: number;
  };
  cache: {
    connected: boolean;
    hitRate?: number;
    operations?: number;
  };
  apis: {
    [key: string]: {
      status: 'operational' | 'degraded' | 'down';
      lastCheck: string;
      responseTime?: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get system uptime
    const uptime = process.uptime();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memUsage.heapUsed + memUsage.external;
    
    // Initialize metrics
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      performance: {
        avgResponseTime: 0,
        requestsPerMinute: 0,
        errorRate: 0,
      },
      database: {
        connected: false,
      },
      cache: {
        connected: false,
      },
      apis: {},
    };
    
    // Check database connection
    try {
      if (process.env.DATABASE_URL || process.env.SUPABASE_URL) {
        // Simulate database check (replace with actual check)
        metrics.database.connected = true;
        metrics.database.poolSize = 10;
        metrics.database.activeConnections = 2;
      }
    } catch (error) {
      console.error('Database check failed:', error);
    }
    
    // Check cache connection
    try {
      if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL) {
        // Simulate cache check (replace with actual check)
        metrics.cache.connected = true;
        metrics.cache.hitRate = 0.85;
        metrics.cache.operations = 1000;
      }
    } catch (error) {
      console.error('Cache check failed:', error);
    }
    
    // Check API endpoints
    const apiEndpoints = [
      { name: 'health', path: '/api/health' },
      { name: 'calculator', path: '/api/calculator/calculate' },
      { name: 'ai-scores', path: '/api/ai-scores' },
      { name: 'intelligence', path: '/api/intelligence/scores' },
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const checkStart = Date.now();
        // In production, you would make actual HTTP requests here
        // For now, we'll simulate the checks
        
        metrics.apis[endpoint.name] = {
          status: 'operational',
          lastCheck: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 100) + 50, // Simulated
        };
      } catch (error) {
        metrics.apis[endpoint.name] = {
          status: 'down',
          lastCheck: new Date().toISOString(),
        };
      }
    }
    
    // Calculate performance metrics
    const totalResponseTime = Object.values(metrics.apis)
      .map(api => api.responseTime || 0)
      .reduce((a, b) => a + b, 0);
    
    metrics.performance.avgResponseTime = Math.round(
      totalResponseTime / Object.keys(metrics.apis).length
    );
    
    // Simulated metrics (replace with actual tracking)
    metrics.performance.requestsPerMinute = Math.floor(Math.random() * 100) + 50;
    metrics.performance.errorRate = Math.random() * 0.05; // 0-5% error rate
    
    // Calculate overall status
    const operationalApis = Object.values(metrics.apis)
      .filter(api => api.status === 'operational').length;
    
    const overallStatus = {
      status: operationalApis === Object.keys(metrics.apis).length 
        ? 'operational' 
        : operationalApis > 0 
          ? 'degraded' 
          : 'down',
      operational: operationalApis,
      total: Object.keys(metrics.apis).length,
      health: Math.round((operationalApis / Object.keys(metrics.apis).length) * 100),
    };
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      metrics,
      status: overallStatus,
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
      },
    });
    
  } catch (error) {
    console.error('Monitor endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to collect system metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}