// Advanced Rate Limiting and Security
// Rate limiting, API key management, and audit logging

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

interface APIKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number;
  };
  lastUsed: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class SecurityManager {
  private redis: any;
  private prisma: any;
  private rateLimitConfigs: Map<string, RateLimitConfig>;

  constructor(redis: any, prisma: any) {
    this.redis = redis;
    this.prisma = prisma;
    this.rateLimitConfigs = new Map();
    
    // Initialize default rate limits
    this.initializeRateLimits();
  }

  // Initialize default rate limits
  private initializeRateLimits(): void {
    // API rate limits
    this.rateLimitConfigs.set('api', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      keyGenerator: (req) => `api:${req.ip}:${req.userId || 'anonymous'}`
    });

    // Analysis rate limits
    this.rateLimitConfigs.set('analysis', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyGenerator: (req) => `analysis:${req.userId}`
    });

    // Authentication rate limits
    this.rateLimitConfigs.set('auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      keyGenerator: (req) => `auth:${req.ip}`
    });

    // Webhook rate limits
    this.rateLimitConfigs.set('webhook', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      keyGenerator: (req) => `webhook:${req.ip}`
    });
  }

  // Check rate limit
  async checkRateLimit(req: any, configName: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    try {
      const config = this.rateLimitConfigs.get(configName);
      if (!config) {
        throw new Error(`Rate limit config not found: ${configName}`);
      }

      const key = config.keyGenerator ? config.keyGenerator(req) : `default:${req.ip}`;
      const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
      const rateLimitKey = `rate_limit:${configName}:${key}:${windowStart}`;

      // Get current count
      const currentCount = await this.redis.get(rateLimitKey) || 0;
      const count = parseInt(currentCount.toString());

      if (count >= config.maxRequests) {
        const resetTime = new Date(windowStart + config.windowMs);
        const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        };
      }

      // Increment counter
      await this.redis.incr(rateLimitKey);
      await this.redis.expire(rateLimitKey, Math.ceil(config.windowMs / 1000));

      return {
        allowed: true,
        remaining: config.maxRequests - count - 1,
        resetTime: new Date(windowStart + config.windowMs)
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open for availability
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 15 * 60 * 1000)
      };
    }
  }

  // Create API key
  async createAPIKey(userId: string, name: string, permissions: string[]): Promise<APIKey> {
    try {
      // Generate secure API key
      const key = this.generateSecureKey();
      
      const apiKey = await this.prisma.apiKey.create({
        data: {
          key,
          name,
          userId,
          permissions,
          rateLimit: {
            requests: 1000,
            window: 3600000 // 1 hour
          },
          lastUsed: new Date(),
          createdAt: new Date(),
          isActive: true
        }
      });

      // Log API key creation
      await this.logAuditEvent({
        userId,
        action: 'api_key_created',
        resource: 'api_key',
        metadata: { keyId: apiKey.id, name }
      } as any);

      return apiKey;

    } catch (error) {
      console.error('Create API key error:', error);
      throw error;
    }
  }

  // Validate API key
  async validateAPIKey(key: string): Promise<{
    valid: boolean;
    userId?: string;
    permissions?: string[];
    rateLimit?: any;
  }> {
    try {
      const apiKey = await this.prisma.apiKey.findUnique({
        where: { key },
        select: {
          userId: true,
          permissions: true,
          rateLimit: true,
          isActive: true,
          expiresAt: true
        }
      });

      if (!apiKey || !apiKey.isActive) {
        return { valid: false };
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { valid: false };
      }

      // Update last used
      await this.prisma.apiKey.update({
        where: { key },
        data: { lastUsed: new Date() }
      });

      return {
        valid: true,
        userId: apiKey.userId,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit
      };

    } catch (error) {
      console.error('Validate API key error:', error);
      return { valid: false };
    }
  }

  // Revoke API key
  async revokeAPIKey(keyId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.apiKey.update({
        where: { id: keyId },
        data: { isActive: false }
      });

      // Log API key revocation
      await this.logAuditEvent({
        userId,
        action: 'api_key_revoked',
        resource: 'api_key',
        metadata: { keyId }
      } as any);

      return true;

    } catch (error) {
      console.error('Revoke API key error:', error);
      return false;
    }
  }

  // Get user API keys
  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      return await this.prisma.apiKey.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Get user API keys error:', error);
      return [];
    }
  }

  // Log audit event
  async logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          ...event,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Log audit event error:', error);
    }
  }

  // Get audit logs
  async getAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      return [];
    }
  }

  // Check IP whitelist/blacklist
  async checkIPAccess(ip: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      // Check blacklist
      const isBlacklisted = await this.redis.sismember('ip_blacklist', ip);
      if (isBlacklisted) {
        return { allowed: false, reason: 'IP address is blacklisted' };
      }

      // Check whitelist (if enabled)
      const whitelistEnabled = await this.redis.get('ip_whitelist_enabled');
      if (whitelistEnabled === 'true') {
        const isWhitelisted = await this.redis.sismember('ip_whitelist', ip);
        if (!isWhitelisted) {
          return { allowed: false, reason: 'IP address not in whitelist' };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Check IP access error:', error);
      // Fail open for availability
      return { allowed: true };
    }
  }

  // Add IP to blacklist
  async blacklistIP(ip: string, reason: string): Promise<boolean> {
    try {
      await this.redis.sadd('ip_blacklist', ip);
      await this.logAuditEvent({
        userId: 'system',
        action: 'ip_blacklisted',
        resource: 'security',
        ipAddress: ip,
        userAgent: 'system',
        metadata: { reason }
      } as any);
      return true;
    } catch (error) {
      console.error('Blacklist IP error:', error);
      return false;
    }
  }

  // Remove IP from blacklist
  async unblacklistIP(ip: string): Promise<boolean> {
    try {
      await this.redis.srem('ip_blacklist', ip);
      await this.logAuditEvent({
        userId: 'system',
        action: 'ip_unblacklisted',
        resource: 'security',
        ipAddress: ip,
        userAgent: 'system',
        metadata: {}
      } as any);
      return true;
    } catch (error) {
      console.error('Unblacklist IP error:', error);
      return false;
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(req: any): Promise<{
    suspicious: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    try {
      const reasons: string[] = [];
      let riskScore = 0;

      // Check for rapid requests
      const rapidRequests = await this.checkRapidRequests(req.ip);
      if (rapidRequests) {
        reasons.push('Rapid request pattern detected');
        riskScore += 30;
      }

      // Check for unusual user agent
      const unusualUA = this.checkUnusualUserAgent(req.headers['user-agent']);
      if (unusualUA) {
        reasons.push('Unusual user agent detected');
        riskScore += 20;
      }

      // Check for suspicious headers
      const suspiciousHeaders = this.checkSuspiciousHeaders(req.headers);
      if (suspiciousHeaders.length > 0) {
        reasons.push(`Suspicious headers: ${suspiciousHeaders.join(', ')}`);
        riskScore += 25;
      }

      // Check for bot patterns
      const botPattern = this.checkBotPattern(req);
      if (botPattern) {
        reasons.push('Bot-like behavior detected');
        riskScore += 40;
      }

      return {
        suspicious: riskScore > 50,
        reasons,
        riskScore
      };

    } catch (error) {
      console.error('Detect suspicious activity error:', error);
      return { suspicious: false, reasons: [], riskScore: 0 };
    }
  }

  // Private helper methods
  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async checkRapidRequests(ip: string): Promise<boolean> {
    const key = `rapid_requests:${ip}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, 60); // 1 minute
    return count > 50; // More than 50 requests per minute
  }

  private checkUnusualUserAgent(userAgent: string): boolean {
    if (!userAgent) return true;
    
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private checkSuspiciousHeaders(headers: any): string[] {
    const suspicious = [];
    
    if (headers['x-forwarded-for'] && headers['x-forwarded-for'].split(',').length > 3) {
      suspicious.push('multiple-x-forwarded-for');
    }
    
    if (headers['x-real-ip'] && headers['x-forwarded-for']) {
      suspicious.push('conflicting-ip-headers');
    }
    
    return suspicious;
  }

  private checkBotPattern(req: any): boolean {
    // Check for common bot patterns
    const botPatterns = [
      /^\/robots\.txt$/,
      /^\/sitemap\.xml$/,
      /^\/favicon\.ico$/,
      /^\/\.well-known\//
    ];
    
    return botPatterns.some(pattern => pattern.test(req.url));
  }
}
