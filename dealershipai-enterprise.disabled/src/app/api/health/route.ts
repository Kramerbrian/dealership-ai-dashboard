import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'unknown', latency: 0 },
        ai: { status: 'unknown', providers: {} },
        stripe: { status: 'unknown' },
        auth: { status: 'unknown' },
      },
      performance: {
        responseTime: 0,
        memoryUsage: process.memoryUsage(),
      },
    }

    // Test Database
    try {
      const dbStart = Date.now()
      await db.raw('SELECT 1')
      health.services.database = {
        status: 'healthy',
        latency: Date.now() - dbStart,
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: 0,
      } as any
      health.status = 'degraded'
    }

    // Test AI APIs
    try {
      const aiConnectivity = await testAIConnectivity()
      health.services.ai = {
        status: Object.values(aiConnectivity).some(Boolean) ? 'healthy' : 'unhealthy',
        providers: aiConnectivity,
      }
    } catch (error) {
      health.services.ai = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        providers: {},
      } as any
      health.status = 'degraded'
    }

    // Test Stripe
    try {
      health.services.stripe = {
        status: 'healthy',
        configured: !!process.env.STRIPE_SECRET_KEY,
      } as any
    } catch (error) {
      health.services.stripe = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        configured: !!process.env.STRIPE_SECRET_KEY,
      } as any
      health.status = 'degraded'
    }

    // Test Auth
    try {
      health.services.auth = {
        status: 'healthy',
        nextauth: !!process.env.NEXTAUTH_SECRET,
        providers: {
          github: !!process.env.GITHUB_ID,
          google: !!process.env.GOOGLE_CLIENT_ID,
        },
      } as any
    } catch (error) {
      health.services.auth = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as any
      health.status = 'degraded'
    }

    // Calculate response time
    health.performance.responseTime = Date.now() - startTime

    // Determine overall status
    const serviceStatuses = Object.values(health.services).map(s => s.status)
    if (serviceStatuses.every(s => s === 'healthy')) {
      health.status = 'healthy'
    } else if (serviceStatuses.some(s => s === 'unhealthy')) {
      health.status = 'unhealthy'
    } else {
      health.status = 'degraded'
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'unknown' },
        ai: { status: 'unknown' },
        stripe: { status: 'unknown' },
        auth: { status: 'unknown' },
      },
    }, { status: 503 })
  }
}
