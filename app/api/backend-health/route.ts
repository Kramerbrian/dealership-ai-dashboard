/**
 * Backend Health Check API
 * Checks if Express.js backend is running
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      backend: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Backend health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
