/**
 * Security Logger Utility
 * Centralized logging for security events with proper categorization
 */

interface SecurityEventData {
  event_type: string;
  actor_id: string;
  payload: any;
  tenant_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  ip_address?: string;
  user_agent?: string;
}

class SecurityLogger {
  private static instance: SecurityLogger;
  private apiUrl: string;

  constructor() {
    this.apiUrl = '/api/security/events';
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Log a security event
   */
  async logEvent(data: SecurityEventData): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to log security event:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging security event:', error);
      return false;
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    eventType: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'account_locked',
    actorId: string,
    details: any = {},
    tenantId?: string
  ): Promise<boolean> {
    const severity = eventType === 'login_failed' || eventType === 'account_locked' ? 'high' : 'medium';
    
    return this.logEvent({
      event_type: `auth.${eventType}`,
      actor_id: actorId,
      payload: {
        ...details,
        timestamp: new Date().toISOString()
      },
      tenant_id: tenantId,
      severity,
      source: 'authentication'
    });
  }

  /**
   * Log API access events
   */
  async logApiEvent(
    endpoint: string,
    method: string,
    actorId: string,
    details: any = {},
    tenantId?: string
  ): Promise<boolean> {
    const severity = this.getApiSeverity(endpoint, method, details.statusCode);
    
    return this.logEvent({
      event_type: 'api.call',
      actor_id: actorId,
      payload: {
        endpoint,
        method,
        ...details,
        timestamp: new Date().toISOString()
      },
      tenant_id: tenantId,
      severity,
      source: 'api'
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    resource: string,
    action: 'read' | 'write' | 'delete' | 'export',
    actorId: string,
    details: any = {},
    tenantId?: string
  ): Promise<boolean> {
    const severity = action === 'delete' || action === 'export' ? 'high' : 'medium';
    
    return this.logEvent({
      event_type: `data.${action}`,
      actor_id: actorId,
      payload: {
        resource,
        action,
        ...details,
        timestamp: new Date().toISOString()
      },
      tenant_id: tenantId,
      severity,
      source: 'data_access'
    });
  }

  /**
   * Log security alerts
   */
  async logSecurityAlert(
    alertType: string,
    actorId: string,
    details: any = {},
    tenantId?: string
  ): Promise<boolean> {
    return this.logEvent({
      event_type: `security.alert.${alertType}`,
      actor_id: actorId,
      payload: {
        alert_type: alertType,
        ...details,
        timestamp: new Date().toISOString()
      },
      tenant_id: tenantId,
      severity: 'critical',
      source: 'security_monitor'
    });
  }

  /**
   * Log tier limit events
   */
  async logTierLimitEvent(
    actorId: string,
    plan: string,
    limit: number,
    used: number,
    details: any = {},
    tenantId?: string
  ): Promise<boolean> {
    return this.logEvent({
      event_type: 'tier.limit_reached',
      actor_id: actorId,
      payload: {
        plan,
        limit,
        used,
        ...details,
        timestamp: new Date().toISOString()
      },
      tenant_id: tenantId,
      severity: 'medium',
      source: 'tier_manager'
    });
  }

  /**
   * Determine API severity based on endpoint and response
   */
  private getApiSeverity(endpoint: string, method: string, statusCode?: number): 'low' | 'medium' | 'high' | 'critical' {
    // Critical endpoints
    if (endpoint.includes('/auth/') || endpoint.includes('/security/')) {
      return 'high';
    }

    // Error responses
    if (statusCode && statusCode >= 500) {
      return 'high';
    }
    if (statusCode && statusCode >= 400) {
      return 'medium';
    }

    // Sensitive operations
    if (method === 'DELETE' || endpoint.includes('/admin/')) {
      return 'high';
    }

    // Write operations
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return 'medium';
    }

    // Read operations
    return 'low';
  }

  /**
   * Get client IP address (for server-side usage)
   */
  static getClientIP(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return undefined;
  }

  /**
   * Get user agent (for server-side usage)
   */
  static getUserAgent(request: Request): string | undefined {
    return request.headers.get('user-agent') || undefined;
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();

// Export class for direct usage
export { SecurityLogger };

// Convenience functions
export const logAuthEvent = (eventType: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'account_locked', actorId: string, details?: any, tenantId?: string) => 
  securityLogger.logAuthEvent(eventType, actorId, details, tenantId);

export const logApiEvent = (endpoint: string, method: string, actorId: string, details?: any, tenantId?: string) => 
  securityLogger.logApiEvent(endpoint, method, actorId, details, tenantId);

export const logDataAccess = (resource: string, action: 'read' | 'write' | 'delete' | 'export', actorId: string, details?: any, tenantId?: string) => 
  securityLogger.logDataAccess(resource, action, actorId, details, tenantId);

export const logSecurityAlert = (alertType: string, actorId: string, details?: any, tenantId?: string) => 
  securityLogger.logSecurityAlert(alertType, actorId, details, tenantId);

export const logTierLimitEvent = (actorId: string, plan: string, limit: number, used: number, details?: any, tenantId?: string) => 
  securityLogger.logTierLimitEvent(actorId, plan, limit, used, details, tenantId);