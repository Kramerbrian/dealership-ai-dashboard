import { NextRequest, NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Provides system health status for monitoring and load balancers
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: 'unknown',
      redis: 'unknown',
      stripe: 'unknown',
    },
    endpoints: {
      telemetry: 'unknown',
      trial: 'unknown',
      visibility: 'unknown',
    },
  };

  // Check Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    health.services.supabase = 'configured';
  } else {
    health.services.supabase = 'not_configured';
  }

  // Check Redis
  if (process.env.REDIS_URL || process.env.KV_URL) {
    health.services.redis = 'configured';
  } else {
    health.services.redis = 'not_configured';
  }

  // Check Stripe
  if (process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    health.services.stripe = 'configured';
  } else {
    health.services.stripe = 'not_configured';
  }

  // Check critical endpoints
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  
  try {
    const telemetryCheck = await fetch(`${baseUrl}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'health_check', tier: 'system', surface: 'health' }),
    });
    health.endpoints.telemetry = telemetryCheck.ok ? 'operational' : 'error';
  } catch {
    health.endpoints.telemetry = 'error';
  }

  try {
    const trialCheck = await fetch(`${baseUrl}/api/trial/status`);
    health.endpoints.trial = trialCheck.ok ? 'operational' : 'error';
  } catch {
    health.endpoints.trial = 'error';
  }

  try {
    const visibilityCheck = await fetch(`${baseUrl}/api/agent/visibility?dealerId=test`);
    health.endpoints.visibility = visibilityCheck.ok ? 'operational' : 'error';
  } catch {
    health.endpoints.visibility = 'error';
  }

  // Determine overall status
  const criticalServices = [
    health.services.supabase,
    health.endpoints.telemetry,
  ];

  const hasErrors = criticalServices.some(s => s === 'error' || s === 'not_configured');
  health.status = hasErrors ? 'degraded' : 'healthy';

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
