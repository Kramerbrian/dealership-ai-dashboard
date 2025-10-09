/**
 * Health Check API Endpoint for DealershipAI
 * Provides basic system health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health checks that don't require external dependencies
    const checks = {
      server: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    const response = {
      status: 'healthy',
      service: 'DealershipAI',
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      environment: process.env.NODE_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
      checks,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { 
      status: 200,
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
      case 'ping':
        return NextResponse.json({
          status: 'pong',
          timestamp: new Date().toISOString(),
          message: 'Health endpoint is responsive'
        });
        
      case 'status':
        return NextResponse.json({
          status: 'healthy',
          service: 'DealershipAI',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({ 
          error: 'Unknown action. Supported actions: ping, status' 
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid request',
      details: error.message 
    }, { status: 400 });
  }
}