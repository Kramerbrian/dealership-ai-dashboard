/**
 * Enterprise Security Engine for AI Governance System
 * Implements multi-layer security, threat detection, and access control
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  event_type: 'login' | 'access' | 'violation' | 'threat' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  resource: string;
  action: string;
  details: Record<string, any>;
  geolocation?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'alert' | 'block' | 'lockout' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
}

interface AccessControl {
  user_id: string;
  role: 'super_admin' | 'governance_admin' | 'model_engineer' | 'viewer';
  permissions: string[];
  restrictions: {
    ip_whitelist?: string[];
    time_restrictions?: { start: string; end: string }[];
    mfa_required: boolean;
    session_timeout: number;
  };
  last_access: Date;
  failed_attempts: number;
  locked_until?: Date;
}

export class SecurityEngine {
  private supabase: any;
  private securityRules: SecurityRule[] = [];
  private accessControls: Map<string, AccessControl> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    // Create Supabase client with fallback
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
      }
    } catch (error) {
      console.warn('Supabase client creation failed in SecurityEngine:', error);
    }
    
    this.loadSecurityRules();
    this.loadAccessControls();
  }

  /**
   * Authenticate user with multi-factor security checks
   */
  async authenticateUser(
    userId: string,
    ipAddress: string,
    userAgent: string,
    mfaToken?: string
  ): Promise<{ success: boolean; reason?: string; requiresMFA?: boolean }> {
    try {
      // Check if user is locked out
      const accessControl = this.accessControls.get(userId);
      if (accessControl?.locked_until && accessControl.locked_until > new Date()) {
        await this.logSecurityEvent({
          event_type: 'violation',
          severity: 'high',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          resource: 'authentication',
          action: 'login_attempt_locked',
          details: { locked_until: accessControl.locked_until }
        });
        return { success: false, reason: 'Account locked due to security violations' };
      }

      // Check IP whitelist for admin users
      if (accessControl?.role === 'super_admin' || accessControl?.role === 'governance_admin') {
        if (accessControl.restrictions.ip_whitelist && 
            !accessControl.restrictions.ip_whitelist.includes(ipAddress)) {
          await this.logSecurityEvent({
            event_type: 'violation',
            severity: 'critical',
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
            resource: 'authentication',
            action: 'unauthorized_ip_access',
            details: { whitelist: accessControl.restrictions.ip_whitelist }
          });
          return { success: false, reason: 'IP address not authorized for admin access' };
        }
      }

      // Check rate limiting
      if (!this.checkRateLimit(ipAddress)) {
        await this.logSecurityEvent({
          event_type: 'threat',
          severity: 'high',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          resource: 'authentication',
          action: 'rate_limit_exceeded',
          details: { rate_limit: 'exceeded' }
        });
        return { success: false, reason: 'Too many login attempts' };
      }

      // Check MFA requirement
      if (accessControl?.restrictions.mfa_required && !mfaToken) {
        return { success: false, requiresMFA: true, reason: 'MFA token required' };
      }

      // Validate MFA token if provided
      if (mfaToken && !this.validateMFAToken(userId, mfaToken)) {
        await this.incrementFailedAttempts(userId);
        await this.logSecurityEvent({
          event_type: 'violation',
          severity: 'medium',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          resource: 'authentication',
          action: 'invalid_mfa_token',
          details: {}
        });
        return { success: false, reason: 'Invalid MFA token' };
      }

      // Successful authentication
      await this.resetFailedAttempts(userId);
      await this.updateLastAccess(userId);
      await this.logSecurityEvent({
        event_type: 'login',
        severity: 'low',
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        resource: 'authentication',
        action: 'successful_login',
        details: { mfa_used: !!mfaToken }
      });

      return { success: true };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, reason: 'Authentication system error' };
    }
  }

  /**
   * Check if user has permission to access resource
   */
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    ipAddress: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const accessControl = this.accessControls.get(userId);
      if (!accessControl) {
        return { allowed: false, reason: 'User not found' };
      }

      // Check if user is locked out
      if (accessControl.locked_until && accessControl.locked_until > new Date()) {
        return { allowed: false, reason: 'Account locked' };
      }

      // Check permissions
      const requiredPermission = `${resource}.${action}`;
      if (!accessControl.permissions.includes('*') && 
          !accessControl.permissions.includes(requiredPermission)) {
        await this.logSecurityEvent({
          event_type: 'violation',
          severity: 'medium',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: 'system',
          resource,
          action: 'permission_denied',
          details: { required_permission: requiredPermission }
        });
        return { allowed: false, reason: 'Insufficient permissions' };
      }

      // Check time restrictions
      if (accessControl.restrictions.time_restrictions) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const isWithinTime = accessControl.restrictions.time_restrictions.some(
          restriction => currentTime >= restriction.start && currentTime <= restriction.end
        );
        if (!isWithinTime) {
          return { allowed: false, reason: 'Access outside allowed time window' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Permission check error:', error);
      return { allowed: false, reason: 'Permission system error' };
    }
  }

  /**
   * Monitor API usage for anomalies
   */
  async monitorAPIUsage(
    userId: string,
    endpoint: string,
    ipAddress: string,
    requestSize: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Check for unusual request patterns
      const accessControl = this.accessControls.get(userId);
      if (!accessControl) {
        return { allowed: false, reason: 'User not found' };
      }

      // Check for suspicious data access patterns
      if (endpoint.includes('/model-weights') && requestSize > 1000000) { // 1MB limit
        await this.logSecurityEvent({
          event_type: 'threat',
          severity: 'high',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: 'api',
          resource: endpoint,
          action: 'large_data_request',
          details: { request_size: requestSize }
        });
        return { allowed: false, reason: 'Request size exceeds limit' };
      }

      // Check for rapid successive requests
      if (!this.checkRateLimit(`${userId}:${endpoint}`)) {
        await this.logSecurityEvent({
          event_type: 'threat',
          severity: 'medium',
          user_id: userId,
          ip_address: ipAddress,
          user_agent: 'api',
          resource: endpoint,
          action: 'rapid_requests',
          details: { rate_limit: 'exceeded' }
        });
        return { allowed: false, reason: 'Rate limit exceeded' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('API monitoring error:', error);
      return { allowed: false, reason: 'Monitoring system error' };
    }
  }

  /**
   * Detect and respond to security threats
   */
  async detectThreats(): Promise<void> {
    try {
      if (!this.supabase) {
        console.log('Mock: Threat detection running (no database)');
        return;
      }

      // Check for multiple failed login attempts
      const recentFailures = await this.supabase
        .from('security_events')
        .select('*')
        .eq('event_type', 'violation')
        .eq('action', 'failed_login')
        .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

      if (recentFailures.data && recentFailures.data.length > 5) {
        // Multiple failed attempts detected
        const userIds = [...new Set(recentFailures.data.map((event: any) => event.user_id))];
        for (const userId of userIds) {
          await this.lockoutUser(userId, 30); // Lock for 30 minutes
        }
      }

      // Check for unusual access patterns
      const unusualAccess = await this.supabase
        .from('security_events')
        .select('*')
        .eq('event_type', 'access')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      if (unusualAccess.data) {
        // Analyze access patterns for anomalies
        const accessByUser = unusualAccess.data.reduce((acc: any, event: any) => {
          if (!acc[event.user_id]) acc[event.user_id] = [];
          acc[event.user_id].push(event);
          return acc;
        }, {});

        for (const [userId, events] of Object.entries(accessByUser)) {
          const eventList = events as any[];
          if (eventList.length > 100) { // More than 100 requests in an hour
            await this.logSecurityEvent({
              event_type: 'threat',
              severity: 'high',
              user_id: userId as string,
              ip_address: 'system',
              user_agent: 'threat_detection',
              resource: 'api',
              action: 'unusual_access_pattern',
              details: { request_count: eventList.length }
            });
          }
        }
      }
    } catch (error) {
      console.error('Threat detection error:', error);
    }
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...event
      };

      if (this.supabase) {
        await this.supabase
          .from('security_events')
          .insert(securityEvent);
      } else {
        console.log('Mock: Security event logged:', securityEvent);
      }

      // Trigger alerts for high-severity events
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.triggerSecurityAlert(securityEvent);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(key: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    const current = this.rateLimiters.get(key);
    if (!current || now > current.resetTime) {
      this.rateLimiters.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * Validate MFA token
   */
  private validateMFAToken(userId: string, token: string): boolean {
    // Implement MFA validation logic
    // This would typically involve checking against a TOTP service
    return true; // Placeholder
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedAttempts(userId: string): Promise<void> {
    const accessControl = this.accessControls.get(userId);
    if (accessControl) {
      accessControl.failed_attempts++;
      if (accessControl.failed_attempts >= 5) {
        await this.lockoutUser(userId, 30); // Lock for 30 minutes
      }
    }
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedAttempts(userId: string): Promise<void> {
    const accessControl = this.accessControls.get(userId);
    if (accessControl) {
      accessControl.failed_attempts = 0;
      accessControl.locked_until = undefined;
    }
  }

  /**
   * Lock out user
   */
  private async lockoutUser(userId: string, minutes: number): Promise<void> {
    const accessControl = this.accessControls.get(userId);
    if (accessControl) {
      accessControl.locked_until = new Date(Date.now() + minutes * 60 * 1000);
    }
  }

  /**
   * Update last access time
   */
  private async updateLastAccess(userId: string): Promise<void> {
    const accessControl = this.accessControls.get(userId);
    if (accessControl) {
      accessControl.last_access = new Date();
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implement alert notification system
    console.log(`🚨 SECURITY ALERT: ${event.severity.toUpperCase()} - ${event.event_type}`);
    console.log(`User: ${event.user_id}, IP: ${event.ip_address}, Action: ${event.action}`);
    
    // Send to monitoring system, email alerts, etc.
  }

  /**
   * Load security rules from database
   */
  private async loadSecurityRules(): Promise<void> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('security_rules')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        this.securityRules = data || [];
      } else {
        // Mock security rules for development
        this.securityRules = [
          {
            id: 'rule-1',
            name: 'Rate Limiting',
            description: 'Limit API requests per user',
            is_active: true,
            conditions: { max_requests: 100, window_minutes: 15 },
            actions: ['block', 'alert'],
            severity: 'medium'
          }
        ];
      }
    } catch (error) {
      console.error('Error loading security rules:', error);
    }
  }

  /**
   * Load access controls from database
   */
  private async loadAccessControls(): Promise<void> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('access_controls')
          .select('*');

        if (error) throw error;
        
        this.accessControls.clear();
        data?.forEach((control: any) => {
          this.accessControls.set(control.user_id, control);
        });
      } else {
        // Mock access controls for development
        this.accessControls.clear();
        this.accessControls.set('user-1', {
          user_id: 'user-1',
          tenant_id: 'tenant-1',
          role: 'dealership_admin',
          permissions: ['read', 'write', 'admin'],
          failed_attempts: 0,
          locked_until: undefined,
          last_login: new Date(),
          mfa_enabled: true,
          ip_whitelist: [],
          session_timeout: 30
        });
      }
    } catch (error) {
      console.error('Error loading access controls:', error);
    }
  }

  /**
   * Get security status summary
   */
  async getSecurityStatus(): Promise<{
    active_threats: number;
    locked_users: number;
    recent_violations: number;
    system_health: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Count active threats
      const { data: threats } = await this.supabase
        .from('security_events')
        .select('id')
        .eq('event_type', 'threat')
        .eq('severity', 'critical')
        .gte('timestamp', oneHourAgo.toISOString());

      // Count locked users
      const lockedUsers = Array.from(this.accessControls.values())
        .filter(control => control.locked_until && control.locked_until > now).length;

      // Count recent violations
      const { data: violations } = await this.supabase
        .from('security_events')
        .select('id')
        .eq('event_type', 'violation')
        .gte('timestamp', oneHourAgo.toISOString());

      const systemHealth = threats?.length > 0 ? 'critical' : 
                          violations?.length > 10 ? 'warning' : 'healthy';

      return {
        active_threats: threats?.length || 0,
        locked_users: lockedUsers,
        recent_violations: violations?.length || 0,
        system_health: systemHealth
      };
    } catch (error) {
      console.error('Error getting security status:', error);
      return {
        active_threats: 0,
        locked_users: 0,
        recent_violations: 0,
        system_health: 'critical'
      };
    }
  }
}

export default SecurityEngine;
