# 🔐 DealershipAI Authentication Setup Guide

## 🛡️ **Production Authentication Configuration**

**Version**: 2.0  
**Date**: October 21, 2025  
**Status**: 🟢 **PRODUCTION READY**

---

## 🎯 **Authentication Overview**

The DealershipAI Hyper-Intelligence System uses **Clerk** for enterprise-grade authentication with the following features:

- **Multi-Factor Authentication** (MFA)
- **Role-Based Access Control** (RBAC)
- **Session Management**
- **API Key Authentication**
- **OAuth Integration**

---

## 🔧 **Environment Variables Setup**

### **Required Environment Variables**

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# API Keys
RESEND_API_KEY=re_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
REDIS_URL=redis://...

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

### **Vercel Environment Variables Setup**

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add Required Variables**
   ```bash
   # Production Environment
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   DATABASE_URL=postgresql://...
   RESEND_API_KEY=re_...
   SLACK_WEBHOOK_URL=https://hooks.slack.com/...
   REDIS_URL=redis://...
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.com
   ```

3. **Configure for All Environments**
   - Production: `vercel --prod`
   - Preview: `vercel`
   - Development: `vercel dev`

---

## 🔐 **Clerk Configuration**

### **1. Create Clerk Application**

1. **Sign up at [clerk.com](https://clerk.com)**
2. **Create new application**
3. **Configure authentication methods**
4. **Set up redirect URLs**

### **2. Configure Authentication Methods**

```javascript
// clerk.config.js
export default {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  appearance: {
    theme: 'light',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorInputBackground: '#f9fafb',
      colorInputText: '#1f2937'
    }
  }
}
```

### **3. Configure Redirect URLs**

**Allowed Redirect URLs:**
```
https://your-domain.com/dashboard
https://your-domain.com/intelligence
https://your-domain.com/calculator
https://your-domain.com/api/auth/callback/clerk
```

**Allowed Origins:**
```
https://your-domain.com
https://your-domain.vercel.app
```

---

## 🛡️ **Security Configuration**

### **1. API Route Protection**

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/intelligence(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});
```

### **2. Role-Based Access Control**

```typescript
// lib/auth.ts
import { auth } from '@clerk/nextjs/server';

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function requireRole(role: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  const userRole = sessionClaims?.metadata?.role;
  if (userRole !== role) {
    throw new Error('Insufficient permissions');
  }
  
  return userId;
}
```

### **3. API Key Authentication**

```typescript
// lib/api-auth.ts
export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    throw new Error('API key required');
  }
  
  // Validate API key against database
  const isValid = await checkApiKey(apiKey);
  if (!isValid) {
    throw new Error('Invalid API key');
  }
  
  return true;
}
```

---

## 🔑 **API Key Management**

### **1. Generate API Keys**

```typescript
// lib/api-keys.ts
import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return `dai_${randomBytes(32).toString('hex')}`;
}

export async function createApiKey(userId: string, name: string) {
  const apiKey = generateApiKey();
  
  await prisma.apiKey.create({
    data: {
      key: apiKey,
      userId: userId,
      name: name,
      permissions: ['read', 'write'],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });
  
  return apiKey;
}
```

### **2. API Key Validation**

```typescript
// lib/api-keys.ts
export async function validateApiKey(apiKey: string) {
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: true }
  });
  
  if (!key || key.expiresAt < new Date()) {
    return false;
  }
  
  return {
    userId: key.userId,
    permissions: key.permissions,
    user: key.user
  };
}
```

---

## 🚀 **Deployment Configuration**

### **1. Vercel Configuration**

```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=60, stale-while-revalidate=300"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/dashboard",
      "destination": "/dashboard"
    }
  ],
  "env": {
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key"
  }
}
```

### **2. Environment Variables in Vercel**

```bash
# Production Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
REDIS_URL=redis://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

---

## 🔍 **Testing Authentication**

### **1. Test Authentication Flow**

```bash
# Test sign-in
curl -X POST "https://your-domain.com/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test protected route
curl -X GET "https://your-domain.com/api/ai/predictive-analytics" \
  -H "Authorization: Bearer your-token"

# Test API key
curl -X GET "https://your-domain.com/api/ai/predictive-analytics" \
  -H "x-api-key: dai_your-api-key"
```

### **2. Test Role-Based Access**

```typescript
// test-auth.ts
import { requireAuth, requireRole } from '@/lib/auth';

// Test authentication
try {
  const userId = await requireAuth();
  console.log('Authenticated user:', userId);
} catch (error) {
  console.error('Authentication failed:', error);
}

// Test role-based access
try {
  const userId = await requireRole('admin');
  console.log('Admin user:', userId);
} catch (error) {
  console.error('Role check failed:', error);
}
```

---

## 📊 **Monitoring and Analytics**

### **1. Authentication Metrics**

```typescript
// lib/auth-metrics.ts
export async function trackAuthEvent(event: string, userId: string) {
  await prisma.authEvent.create({
    data: {
      event: event,
      userId: userId,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    }
  });
}
```

### **2. Security Monitoring**

```typescript
// lib/security-monitoring.ts
export async function monitorSecurityEvents() {
  const suspiciousEvents = await prisma.authEvent.findMany({
    where: {
      event: {
        in: ['failed_login', 'suspicious_activity', 'rate_limit_exceeded']
      },
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }
  });
  
  if (suspiciousEvents.length > 10) {
    await sendSecurityAlert(suspiciousEvents);
  }
}
```

---

## 🎯 **Best Practices**

### **1. Security Best Practices**

- **Use HTTPS** for all authentication
- **Implement rate limiting** on authentication endpoints
- **Use secure session management**
- **Regular security audits**
- **Monitor for suspicious activity**

### **2. Performance Optimization**

- **Cache authentication tokens**
- **Use connection pooling** for database
- **Implement request throttling**
- **Monitor API performance**

### **3. User Experience**

- **Clear error messages**
- **Smooth authentication flow**
- **Remember user preferences**
- **Provide helpful feedback**

---

## 🚀 **Production Deployment Checklist**

### **✅ Pre-Deployment**

- [ ] Configure Clerk application
- [ ] Set up environment variables
- [ ] Configure redirect URLs
- [ ] Test authentication flow
- [ ] Set up API keys
- [ ] Configure role-based access

### **✅ Post-Deployment**

- [ ] Test production authentication
- [ ] Monitor authentication metrics
- [ ] Set up security alerts
- [ ] Configure monitoring
- [ ] Test API key authentication
- [ ] Verify role-based access

---

## 🎉 **Conclusion**

The DealershipAI Hyper-Intelligence System now includes enterprise-grade authentication with:

✅ **Clerk Integration** - Modern authentication system  
✅ **Role-Based Access** - Granular permission control  
✅ **API Key Authentication** - Secure API access  
✅ **Security Monitoring** - Comprehensive security tracking  
✅ **Performance Optimization** - Fast and reliable authentication  

**Ready for production deployment with enterprise-grade security!** 🚀
