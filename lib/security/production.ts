// Production security configuration and utilities
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export interface SecurityConfig {
  enableRateLimiting: boolean;
  enableCORS: boolean;
  enableCSRF: boolean;
  enableSecurityHeaders: boolean;
  maxRequestsPerMinute: number;
  allowedOrigins: string[];
  trustedProxies: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  enableRateLimiting: true,
  enableCORS: true,
  enableCSRF: true,
  enableSecurityHeaders: true,
  maxRequestsPerMinute: 100,
  allowedOrigins: [
    'https://dealershipai.com',
    'https://www.dealershipai.com',
    'https://dash.dealershipai.com',
    'https://api.dealershipai.com'
  ],
  trustedProxies: [
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ]
};

export class SecurityManager {
  private config: SecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
  }

  // Rate limiting
  isRateLimited(identifier: string): boolean {
    if (!this.config.enableRateLimiting) return false;

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const current = this.rateLimitStore.get(identifier);

    if (!current || now > current.resetTime) {
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (current.count >= this.config.maxRequestsPerMinute) {
      return true;
    }

    current.count++;
    return false;
  }

  // CORS validation
  isOriginAllowed(origin: string): boolean {
    if (!this.config.enableCORS) return true;
    return this.config.allowedOrigins.includes(origin);
  }

  // CSRF token validation
  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!this.config.enableCSRF) return true;
    
    try {
      const expectedToken = crypto
        .createHmac('sha256', process.env.CSRF_SECRET || 'default-secret')
        .update(sessionToken)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(expectedToken, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  // Generate CSRF token
  generateCSRFToken(sessionToken: string): string {
    return crypto
      .createHmac('sha256', process.env.CSRF_SECRET || 'default-secret')
      .update(sessionToken)
      .digest('hex');
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim();
  }

  // SQL injection prevention
  sanitizeSQL(input: string): string {
    return input
      .replace(/[';--]/g, '') // Remove SQL injection patterns
      .replace(/union/gi, '') // Remove UNION
      .replace(/select/gi, '') // Remove SELECT
      .replace(/insert/gi, '') // Remove INSERT
      .replace(/update/gi, '') // Remove UPDATE
      .replace(/delete/gi, '') // Remove DELETE
      .replace(/drop/gi, '') // Remove DROP
      .trim();
  }

  // XSS prevention
  sanitizeHTML(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate JWT token
  validateJWT(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      if (!token) {
        return { valid: false, error: 'No token provided' };
      }

      // In production, use a proper JWT library like jose
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      // For demo purposes, we'll do basic validation
      // In production, use proper JWT verification
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }

  // Get client IP address
  getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return (req as any).ip || 'unknown';
  }

  // Check if IP is trusted
  isTrustedIP(ip: string): boolean {
    return this.config.trustedProxies.some(trusted => {
      if (trusted.includes('/')) {
        // CIDR notation
        return this.isIPInCIDR(ip, trusted);
      }
      return ip === trusted;
    });
  }

  // CIDR notation check
  private isIPInCIDR(ip: string, cidr: string): boolean {
    // Simplified CIDR check - in production, use a proper library
    const [network, prefixLength] = cidr.split('/');
    const ipNum = this.ipToNumber(ip);
    const networkNum = this.ipToNumber(network);
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  }

  // Convert IP to number
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// Security middleware
export function withSecurity(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const clientIP = securityManager.getClientIP(req);
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';

    // Rate limiting
    if (securityManager.isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // CORS check
    if (origin && !securityManager.isOriginAllowed(origin)) {
      return NextResponse.json(
        { error: 'CORS policy violation' },
        { status: 403 }
      );
    }

    // CSRF check for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const csrfToken = req.headers.get('x-csrf-token');
      const sessionToken = req.headers.get('x-session-token');
      
      if (csrfToken && sessionToken && !securityManager.validateCSRFToken(csrfToken, sessionToken)) {
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        );
      }
    }

    // Add security headers
    const response = await handler(req, ...args);
    
    if (response instanceof NextResponse) {
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Content Security Policy - Let vercel.json handle CSP to avoid conflicts
      // response.headers.set(
      //   'Content-Security-Policy',
      //   "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
      // );
    }

    return response;
  };
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return response;
}

// Input validation utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone number validation
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // URL validation
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Domain validation
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    return domainRegex.test(domain);
  }

  // UUID validation
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Sanitize and validate input
  static sanitizeAndValidate(input: string, type: 'email' | 'phone' | 'url' | 'domain' | 'uuid'): string | null {
    const sanitized = securityManager.sanitizeInput(input);
    
    switch (type) {
      case 'email':
        return this.isValidEmail(sanitized) ? sanitized : null;
      case 'phone':
        return this.isValidPhone(sanitized) ? sanitized : null;
      case 'url':
        return this.isValidURL(sanitized) ? sanitized : null;
      case 'domain':
        return this.isValidDomain(sanitized) ? sanitized : null;
      case 'uuid':
        return this.isValidUUID(sanitized) ? sanitized : null;
      default:
        return sanitized;
    }
  }
}
