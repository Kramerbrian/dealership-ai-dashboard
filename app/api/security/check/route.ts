import { NextRequest, NextResponse } from 'next/server';
import { SecurityEngine } from '@/lib/security-engine';

const securityEngine = new SecurityEngine();

/**
 * Security Check API Endpoint
 * Validates user permissions and monitors for security threats
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, resource, action, ipAddress, userAgent } = await request.json();

    if (!userId || !resource || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, resource, action' },
        { status: 400 }
      );
    }

    // Get client IP address
    const clientIP = ipAddress || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      '127.0.0.1';

    // Get user agent
    const clientUserAgent = userAgent || 
      request.headers.get('user-agent') || 
      'unknown';

    console.log(`🔒 Security check for user: ${userId}, resource: ${resource}, action: ${action}`);

    // Check user permissions
    const permissionResult = await securityEngine.checkPermission(
      userId,
      resource,
      action,
      clientIP
    );

    if (!permissionResult.allowed) {
      return NextResponse.json({
        success: false,
        allowed: false,
        reason: permissionResult.reason,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    // Monitor API usage for anomalies
    const monitoringResult = await securityEngine.monitorAPIUsage(
      userId,
      resource,
      clientIP,
      JSON.stringify(request.body).length
    );

    if (!monitoringResult.allowed) {
      return NextResponse.json({
        success: false,
        allowed: false,
        reason: monitoringResult.reason,
        timestamp: new Date().toISOString()
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Security check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Security check failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Get Security Status API Endpoint
 * Returns current security status and threat level
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    console.log(`🔍 Getting security status for user: ${userId}`);

    const securityStatus = await securityEngine.getSecurityStatus();

    return NextResponse.json({
      success: true,
      userId,
      security_status: securityStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Failed to get security status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get security status', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
