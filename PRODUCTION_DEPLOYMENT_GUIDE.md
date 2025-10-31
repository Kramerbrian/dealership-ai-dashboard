# 🚀 DealershipAI Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] All environment variables configured in Vercel
- [ ] Database connection strings verified
- [ ] API keys secured and validated
- [ ] Authentication providers configured
- [ ] Redis/Upstash connection established

### ✅ Build Verification
- [ ] `npm run build` succeeds locally
- [ ] TypeScript compilation passes
- [ ] No critical vulnerabilities in dependencies
- [ ] Bundle size optimized (< 500KB first load)

### ✅ Security
- [ ] Environment variables secured (no NEXT_PUBLIC_ for secrets)
- [ ] CORS headers configured correctly
- [ ] CSP headers properly set
- [ ] Authentication flows tested
- [ ] Rate limiting enabled on all APIs

## 🔧 Environment Variables Configuration

### Required Variables for Production

```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXTAUTH_URL=https://dealershipai.com
NEXTAUTH_SECRET=[generate-with-openssl-rand-base64-32]

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/intelligence
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/intelligence

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
SUPABASE_ANON_KEY=eyJxxxxx

# Redis/Cache
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
KV_URL=https://xxxxx.kv.vercel-storage.com
KV_REST_API_URL=https://xxxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxxxx

# AI Services
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_PROPERTY_ID=123456789
GOOGLE_CREDENTIALS_BASE64=[base64-encoded-service-account]

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOGTAIL_SOURCE_TOKEN=xxxxx

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

## 📦 Deployment Steps

### 1. Prepare Codebase
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test

# Build locally
npm run build

# Test production build
npm start
```

### 2. Configure Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Set environment variables
vercel env add VARIABLE_NAME production
```

### 3. Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or use Git push (if connected to GitHub)
git push origin main
```

### 4. Post-Deployment Verification
```bash
# Check deployment status
vercel ls

# Monitor logs
vercel logs --follow

# Check production health
curl https://dealershipai.com/api/health

# Test API endpoints
curl https://dealershipai.com/api/system/status
```

## 🔍 API Endpoints Health Check

### Core Endpoints
```bash
# Health Check
GET /api/health

# System Status
GET /api/system/status

# Intelligence Dashboard
GET /api/intelligence/scores

# Calculator
POST /api/calculator/calculate

# AI Scores
POST /api/ai-scores

# Quick Audit
POST /api/quick-audit

# Newsletter Signup
POST /api/newsletter/subscribe
```

### Testing Script
```bash
#!/bin/bash
DOMAIN="https://dealershipai.com"

echo "Testing DealershipAI Production APIs..."

# Health check
echo "1. Health Check:"
curl -s "$DOMAIN/api/health" | jq .

# System status
echo "2. System Status:"
curl -s "$DOMAIN/api/system/status" | jq .

# Test calculator
echo "3. Calculator API:"
curl -s -X POST "$DOMAIN/api/calculator/calculate" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}' | jq .

echo "All tests completed!"
```

## 🚀 Performance Optimization

### 1. Next.js Optimizations
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['dealershipai.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}
```

### 2. Vercel Configuration
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }]
    }
  ]
}
```

### 3. Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_dealers_domain ON dealers(domain);
CREATE INDEX idx_ai_scores_dealer_id ON ai_scores(dealer_id);
CREATE INDEX idx_ai_scores_created_at ON ai_scores(created_at DESC);

-- Analyze tables for query optimization
ANALYZE dealers;
ANALYZE ai_scores;
```

## 📊 Monitoring Setup

### 1. Vercel Analytics
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Custom Monitoring
```typescript
// lib/monitoring.ts
export const trackEvent = (event: string, properties?: any) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
  
  // Custom tracking
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  });
};
```

### 3. Error Tracking
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

## 🔒 Security Best Practices

### 1. API Rate Limiting
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
}
```

### 2. Input Validation
```typescript
// lib/validation.ts
import { z } from 'zod';

export const domainSchema = z.object({
  domain: z.string()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/),
});

export const validateDomain = (domain: string) => {
  return domainSchema.safeParse({ domain });
};
```

### 3. CORS Configuration
```typescript
// lib/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 2. Environment Variable Issues
```bash
# Verify all variables are set
vercel env ls production

# Re-sync environment variables
vercel env pull .env.production.local
```

#### 3. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database if needed
npx prisma migrate reset --force
npx prisma migrate deploy
```

#### 4. API Timeout Issues
```javascript
// Increase timeout in vercel.json
{
  "functions": {
    "app/api/heavy-endpoint/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 📈 Performance Benchmarks

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Monitoring Commands
```bash
# Run Lighthouse audit
npx lighthouse https://dealershipai.com --view

# Check bundle size
npx next-bundle-analyzer

# Monitor real user metrics
curl https://dealershipai.com/api/analytics/vitals
```

## 🔄 Rollback Procedures

### Quick Rollback
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or use Vercel dashboard
# https://vercel.com/[team]/[project]/deployments
```

### Database Rollback
```bash
# Rollback last migration
npx prisma migrate rollback

# Restore from backup
pg_restore -d $DATABASE_URL backup.dump
```

## 📞 Support Contacts

- **Technical Issues**: tech@dealershipai.com
- **Vercel Support**: https://vercel.com/support
- **Status Page**: https://status.dealershipai.com
- **Documentation**: https://docs.dealershipai.com

## ✅ Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] Payment processing tested (if applicable)
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] SSL certificate valid
- [ ] DNS records configured
- [ ] Backup system active
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring alerts configured
- [ ] Support channels ready
- [ ] Marketing site live
- [ ] Customer onboarding ready

## 🎉 Post-Launch

### First 24 Hours
1. Monitor error rates
2. Check performance metrics
3. Review user feedback
4. Verify all integrations
5. Check database performance

### First Week
1. Analyze usage patterns
2. Optimize slow queries
3. Adjust rate limits
4. Update documentation
5. Plan first iteration

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready 🚀