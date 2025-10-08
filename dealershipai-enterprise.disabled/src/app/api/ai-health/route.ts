import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      )
    }

    // Fetch real AI Health data from database
    const [dealershipData, scoreHistory, auditLogs] = await Promise.all([
      db.dealershipData.findMany(),
      db.scoreHistory.findMany({
        orderBy: { created_at: 'desc' },
        take: 10
      }),
      db.auditLog.findMany({
        where: { 
          action: { contains: 'ai' },
          created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ])

    // Calculate real metrics
    const latestScore = scoreHistory[0]
    const avgResponseTime = scoreHistory.reduce((acc, score) => acc + (score.response_time || 0), 0) / scoreHistory.length
    const errorCount = auditLogs.filter(log => log.action.includes('error')).length
    const totalRequests = auditLogs.length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    const aiHealthData = {
      status: errorRate < 5 ? 'healthy' : errorRate < 15 ? 'warning' : 'critical',
      lastScan: latestScore?.created_at || new Date().toISOString(),
      metrics: {
        visibilityScore: latestScore?.overall_score || 0,
        responseTime: avgResponseTime || 0,
        uptime: Math.max(0, 100 - errorRate),
        errorRate: errorRate
      },
      alerts: auditLogs.map(log => ({
        id: log.id,
        type: log.action.includes('error') ? 'error' : 'warning',
        message: log.details || log.action,
        timestamp: log.created_at
      })),
      dealerships: dealershipData.length,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(aiHealthData)
  } catch (error) {
    console.error('AI Health API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI health data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
