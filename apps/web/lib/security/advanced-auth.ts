import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Advanced authentication and security features

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  tenantId: string;
  permissions: string[];
  lastLogin?: Date;
  mfaEnabled?: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requireMfa: boolean;
}

export class AdvancedAuth {
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  // JWT token management
  async createToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(this.config.jwtSecret);
    
    return await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions,
      mfaVerified: user.mfaEnabled || false,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${this.config.sessionTimeout}m`)
      .sign(secret);
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const secret = new TextEncoder().encode(this.config.jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      
      return {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as 'admin' | 'user' | 'viewer',
        tenantId: payload.tenantId as string,
        permissions: payload.permissions as string[],
        mfaEnabled: payload.mfaVerified as boolean,
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Rate limiting for login attempts
  checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number } {
    const attempts = this.loginAttempts.get(identifier);
    
    if (!attempts) {
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    const lockoutExpired = timeSinceLastAttempt > this.config.lockoutDuration * 60 * 1000;

    if (lockoutExpired) {
      this.loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }

    if (attempts.count >= this.config.maxLoginAttempts) {
      return { allowed: false, remainingAttempts: 0 };
    }

    return { 
      allowed: true, 
      remainingAttempts: this.config.maxLoginAttempts - attempts.count 
    };
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier);
      return;
    }

    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
    attempts.count += 1;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(identifier, attempts);
  }

  // Middleware for authentication
  async authenticateRequest(request: NextRequest): Promise<User | null> {
    const token = this.extractToken(request);
    if (!token) {
      return null;
    }

    return await this.verifyToken(token);
  }

  private extractToken(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookie
    const tokenCookie = request.cookies.get('auth-token');
    if (tokenCookie) {
      return tokenCookie.value;
    }

    return null;
  }

  // Permission checking
  hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  hasRole(user: User, role: string): boolean {
    return user.role === role || user.role === 'admin';
  }

  // Tenant isolation
  canAccessTenant(user: User, tenantId: string): boolean {
    return user.tenantId === tenantId || user.role === 'admin';
  }

  // Security headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Content Security Policy - Let vercel.json handle CSP to avoid conflicts
      // 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    };
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // SQL injection prevention
  sanitizeSqlInput(input: string): string {
    return input
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .trim();
  }

  // XSS prevention
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // CSRF protection
  generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  verifyCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length > 0;
  }

  // Audit logging
  async logSecurityEvent(
    event: string,
    userId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
    };

    // In production, send to security monitoring system
    console.log('Security Event:', logEntry);
  }

  // Session management
  async createSecureSession(user: User, response: NextResponse): Promise<void> {
    const token = await this.createToken(user);
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.sessionTimeout * 60,
      path: '/',
    });

    // Set security headers
    Object.entries(this.getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  async destroySession(response: NextResponse): Promise<void> {
    response.cookies.delete('auth-token');
  }
}

// Security middleware factory
export function createSecurityMiddleware(config: SecurityConfig) {
  const auth = new AdvancedAuth(config);

  return {
    requireAuth: (permissions?: string[]) => {
      return async (request: NextRequest) => {
        const user = await auth.authenticateRequest(request);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        if (permissions && !permissions.every(p => auth.hasPermission(user, p))) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        return { user };
      };
    },

    requireRole: (role: string) => {
      return async (request: NextRequest) => {
        const user = await auth.authenticateRequest(request);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        if (!auth.hasRole(user, role)) {
          return NextResponse.json(
            { error: 'Insufficient role' },
            { status: 403 }
          );
        }

        return { user };
      };
    },

    requireTenant: (tenantId: string) => {
      return async (request: NextRequest) => {
        const user = await auth.authenticateRequest(request);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        if (!auth.canAccessTenant(user, tenantId)) {
          return NextResponse.json(
            { error: 'Tenant access denied' },
            { status: 403 }
          );
        }

        return { user };
      };
    },
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  sessionTimeout: 60, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 15, // 15 minutes
  requireMfa: false,
};
