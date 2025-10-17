/**
 * Request ID Tracking and Cross-Tenant Protection
 * Ensures proper request isolation and audit trails
 */

import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  tenantId: string;
  userId?: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  method: string;
  path: string;
  query?: Record<string, string>;
  headers: Record<string, string>;
}

export interface CrossTenantViolation {
  requestId: string;
  tenantId: string;
  violationType: 'data_access' | 'query_execution' | 'resource_access';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class RequestTracker {
  private static instance: RequestTracker;
  private requestContexts: Map<string, RequestContext> = new Map();
  private violations: CrossTenantViolation[] = [];

  private constructor() {}

  static getInstance(): RequestTracker {
    if (!RequestTracker.instance) {
      RequestTracker.instance = new RequestTracker();
    }
    return RequestTracker.instance;
  }

  /**
   * Create request context from NextRequest
   */
  createRequestContext(req: NextRequest, tenantId: string, userId?: string): RequestContext {
    const requestId = req.headers.get('x-request-id') || uuidv4();
    
    const context: RequestContext = {
      requestId,
      tenantId,
      userId,
      timestamp: new Date(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      method: req.method,
      path: req.nextUrl.pathname,
      query: Object.fromEntries(req.nextUrl.searchParams.entries()),
      headers: Object.fromEntries(req.headers.entries()),
    };

    this.requestContexts.set(requestId, context);
    return context;
  }

  /**
   * Get request context by ID
   */
  getRequestContext(requestId: string): RequestContext | undefined {
    return this.requestContexts.get(requestId);
  }

  /**
   * Validate tenant access
   */
  validateTenantAccess(requestId: string, targetTenantId: string): boolean {
    const context = this.getRequestContext(requestId);
    if (!context) {
      this.recordViolation(requestId, 'unknown', 'data_access', 'Request context not found', 'high');
      return false;
    }

    if (context.tenantId !== targetTenantId) {
      this.recordViolation(
        requestId,
        context.tenantId,
        'data_access',
        `Attempted access to tenant ${targetTenantId} from tenant ${context.tenantId}`,
        'critical'
      );
      return false;
    }

    return true;
  }

  /**
   * Validate query execution
   */
  validateQueryExecution(requestId: string, query: string, targetTenantId: string): boolean {
    const context = this.getRequestContext(requestId);
    if (!context) {
      this.recordViolation(requestId, 'unknown', 'query_execution', 'Request context not found', 'high');
      return false;
    }

    // Check for cross-tenant queries
    if (context.tenantId !== targetTenantId) {
      this.recordViolation(
        requestId,
        context.tenantId,
        'query_execution',
        `Cross-tenant query execution: ${query.substring(0, 100)}...`,
        'critical'
      );
      return false;
    }

    // Check for suspicious query patterns
    if (this.isSuspiciousQuery(query)) {
      this.recordViolation(
        requestId,
        context.tenantId,
        'query_execution',
        `Suspicious query pattern: ${query.substring(0, 100)}...`,
        'medium'
      );
      return false;
    }

    return true;
  }

  /**
   * Record cross-tenant violation
   */
  recordViolation(
    requestId: string,
    tenantId: string,
    violationType: CrossTenantViolation['violationType'],
    details: string,
    severity: CrossTenantViolation['severity']
  ): void {
    const violation: CrossTenantViolation = {
      requestId,
      tenantId,
      violationType,
      details,
      severity,
      timestamp: new Date(),
    };

    this.violations.push(violation);

    // Log critical violations immediately
    if (severity === 'critical') {
      console.error('CRITICAL CROSS-TENANT VIOLATION:', violation);
    }
  }

  /**
   * Get violations for a tenant
   */
  getViolations(tenantId: string, since?: Date): CrossTenantViolation[] {
    return this.violations.filter(v => 
      v.tenantId === tenantId && 
      (!since || v.timestamp >= since)
    );
  }

  /**
   * Get all violations
   */
  getAllViolations(since?: Date): CrossTenantViolation[] {
    return this.violations.filter(v => !since || v.timestamp >= since);
  }

  /**
   * Clean up old request contexts
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    
    for (const [requestId, context] of this.requestContexts.entries()) {
      if (context.timestamp < cutoff) {
        this.requestContexts.delete(requestId);
      }
    }

    // Clean up old violations
    this.violations = this.violations.filter(v => v.timestamp >= cutoff);
  }

  /**
   * Check if query is suspicious
   */
  private isSuspiciousQuery(query: string): boolean {
    const suspiciousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /update\s+.*\s+set/i,
      /insert\s+into/i,
      /alter\s+table/i,
      /create\s+table/i,
      /exec\s*\(/i,
      /sp_executesql/i,
      /xp_cmdshell/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(query));
  }
}

/**
 * Middleware for request tracking
 */
export function requestTrackingMiddleware(req: NextRequest, tenantId: string, userId?: string): string {
  const tracker = RequestTracker.getInstance();
  const context = tracker.createRequestContext(req, tenantId, userId);
  
  // Add request ID to response headers
  req.headers.set('x-request-id', context.requestId);
  
  return context.requestId;
}

/**
 * Database query wrapper with tenant validation
 */
export function withTenantValidation<T>(
  requestId: string,
  tenantId: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const tracker = RequestTracker.getInstance();
  
  if (!tracker.validateTenantAccess(requestId, tenantId)) {
    throw new Error('Cross-tenant access violation');
  }
  
  return queryFn();
}

/**
 * Get request ID from headers
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || uuidv4();
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  requestId: string,
  action: string,
  resource: string,
  details: Record<string, any>
): void {
  const tracker = RequestTracker.getInstance();
  const context = tracker.getRequestContext(requestId);
  
  if (context) {
    console.log('AUDIT_LOG:', {
      requestId,
      tenantId: context.tenantId,
      userId: context.userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
