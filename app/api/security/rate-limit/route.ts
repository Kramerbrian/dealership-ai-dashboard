import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { SecurityManager } from '@/lib/security/rate-limiter';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 3. Initialize security manager
    const securityManager = new SecurityManager(redis, prisma);

    let result;

    switch (action) {
      case 'check_rate_limit':
        const configName = searchParams.get('configName') || 'api';
        const rateLimitResult = await securityManager.checkRateLimit(req, configName);
        
        if (!rateLimitResult.allowed) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
            resetTime: rateLimitResult.resetTime
          }, { status: 429 });
        }
        
        result = rateLimitResult;
        break;

      case 'api_keys':
        result = await securityManager.getUserAPIKeys(userId);
        break;

      case 'audit_logs':
        const limit = parseInt(searchParams.get('limit') || '100');
        result = await securityManager.getAuditLogs(userId, limit);
        break;

      case 'ip_access':
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        result = await securityManager.checkIPAccess(ip);
        break;

      case 'suspicious_activity':
        result = await securityManager.detectSuspiciousActivity(req);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Security check error:', error);
    return NextResponse.json(
      { error: 'Failed to perform security check' },
      { status: 500 }
    );
  }
}

// POST endpoint for security actions
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 2. Initialize security manager
    const securityManager = new SecurityManager(redis, prisma);

    let result;

    switch (action) {
      case 'create_api_key':
        const { name, permissions } = data;
        if (!name || !permissions) {
          return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
        }
        
        result = await securityManager.createAPIKey(userId, name, permissions);
        break;

      case 'revoke_api_key':
        const { keyId } = data;
        if (!keyId) {
          return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }
        
        result = await securityManager.revokeAPIKey(keyId, userId);
        break;

      case 'blacklist_ip':
        const { ip, reason } = data;
        if (!ip) {
          return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
        }
        
        result = await securityManager.blacklistIP(ip, reason || 'Manual blacklist');
        break;

      case 'unblacklist_ip':
        const { ipToUnblacklist } = data;
        if (!ipToUnblacklist) {
          return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
        }
        
        result = await securityManager.unblacklistIP(ipToUnblacklist);
        break;

      case 'log_audit':
        const { auditAction, resource, metadata } = data;
        if (!auditAction || !resource) {
          return NextResponse.json({ error: 'Action and resource are required' }, { status: 400 });
        }
        
        await securityManager.logAuditEvent({
          userId,
          action: auditAction,
          resource,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          metadata: metadata || {},
          success: true
        });
        
        result = { success: true };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Security action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform security action' },
      { status: 500 }
    );
  }
}
