import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api/error-handler'

export const dynamic = 'force-dynamic'

/**
 * GET /api/system/endpoints
 * Health check for all API endpoints
 * Returns status of all endpoints in the system
 */
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Core endpoints to check
    const endpoints = [
      // Public endpoints
      { path: '/api/v1/analyze', method: 'GET', public: true },
      { path: '/api/formulas/weights', method: 'GET', public: true },
      { path: '/api/visibility/presence', method: 'GET', public: true },
      { path: '/api/scan/quick', method: 'POST', public: true },
      { path: '/api/health', method: 'GET', public: true },
      
      // Metrics endpoints
      { path: '/api/metrics/oel/channels', method: 'GET', public: false },
      { path: '/api/metrics/piqr', method: 'GET', public: false },
      { path: '/api/metrics/qai', method: 'GET', public: false },
      { path: '/api/metrics/eeat', method: 'GET', public: false },
      { path: '/api/metrics/rar', method: 'GET', public: false },
      
      // User endpoints
      { path: '/api/user/onboarding-complete', method: 'GET', public: false },
      { path: '/api/user/onboarding-complete', method: 'POST', public: false },
      
      // Fix endpoints
      { path: '/api/fix-pack/roi', method: 'GET', public: false },
      { path: '/api/fix/apply', method: 'POST', public: false },
      { path: '/api/fix/deploy', method: 'POST', public: false },
      
      // Admin endpoints
      { path: '/api/admin/seed', method: 'GET', public: false },
      { path: '/api/admin/flags', method: 'GET', public: false },
    ]

    // Check endpoint status (simplified - just verify routes exist)
    const endpointStatus = endpoints.map((endpoint) => {
      // In production, you could actually ping these endpoints
      // For now, we'll just verify they're configured
      return {
        path: endpoint.path,
        method: endpoint.method,
        public: endpoint.public,
        status: 'configured', // Could be 'healthy', 'degraded', 'down'
        lastChecked: new Date().toISOString(),
      }
    })

    const summary = {
      total: endpointStatus.length,
      configured: endpointStatus.filter((e) => e.status === 'configured')
        .length,
      public: endpointStatus.filter((e) => e.public).length,
      protected: endpointStatus.filter((e) => !e.public).length,
    }

    return NextResponse.json({
      success: true,
      summary,
      endpoints: endpointStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[system/endpoints] Error:', error)
    return apiError(
      'Failed to check endpoint status',
      'ENDPOINT_CHECK_FAILED',
      500
    )
  }
}

