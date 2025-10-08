/**
 * Health Check API Endpoint for DealershipAI
 * Provides comprehensive system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { VercelDiagnostics } from '@/lib/vercel-diagnostics';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = await VercelDiagnostics.performHealthCheck();
    
    const response = {
      ...healthCheck,
      service: 'DealershipAI',
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || 'unknown',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    return NextResponse.json(response, { 
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'diagnostic-report':
        const report = await VercelDiagnostics.generateDiagnosticReport();
        return NextResponse.json(report);
        
      case 'test-error':
        const { errorType } = body;
        if (!errorType) {
          return NextResponse.json({ error: 'errorType required' }, { status: 400 });
        }
        
        try {
          await VercelDiagnostics.ErrorTesting?.simulateError(errorType);
        } catch (error) {
          return NextResponse.json({ 
            success: true, 
            error: error.message,
            errorType 
          });
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid request',
      details: error.message 
    }, { status: 400 });
  }
}