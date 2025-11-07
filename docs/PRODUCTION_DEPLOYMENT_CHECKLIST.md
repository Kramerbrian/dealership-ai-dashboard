# Production Deployment Checklist

## Pre-Deployment

### Security Audit
- [ ] **Run Security Audit**
  - [ ] `npm install` - Install all dependencies
  - [ ] `npm audit --production` - Check production vulnerabilities
  - [ ] Review `docs/SECURITY_AUDIT_REPORT.md`
  - [ ] Document any acceptable risks
  - [ ] Implement mitigations for high-severity vulnerabilities

**Current Status (as of latest audit):**
- ⚠️ **6 vulnerabilities found** (1 high, 5 low)
- **High:** xlsx package (Prototype Pollution & ReDoS) - No fix available
  - Used in production for chart exports and data import/export
  - **Action Required:** Implement file validation, size limits, and rate limiting
- **Low:** cookie package (via Clerk/WorkOS) - Fix available via breaking changes
  - Low risk - server-side only, Clerk handles authentication securely

### Environment Variables
- [ ] **Clerk Authentication**
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set in Vercel
  - [ ] `CLERK_SECRET_KEY` set in Vercel (server-side only)
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` configured
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` configured
  - [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` configured
  - [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` configured

- [ ] **API Keys & Services**
  - [ ] `OPENAI_API_KEY` set (for GPT recommendations)
  - [ ] `SLACK_WEBHOOK_URL` set (for executive digests)
  - [ ] `SLACK_ALERT_WEBHOOK_URL` set (for drift alerts)
  - [ ] `RESEND_API_KEY` set (for email digests)
  - [ ] `EXECUTIVE_EMAIL` set (for email recipients)

- [ ] **Analytics & Monitoring**
  - [ ] `NEXT_PUBLIC_GA_ID` set (Google Analytics)
  - [ ] `SENTRY_DSN` set (error tracking)
  - [ ] `SENTRY_AUTH_TOKEN` set (for releases)

- [ ] **Database & Storage** (if applicable)
  - [ ] Database connection strings configured
  - [ ] Redis/KV URLs configured
  - [ ] Storage bucket credentials set

### Build Configuration
- [ ] **Next.js Config**
  - [ ] `next.config.js` optimized for production
  - [ ] Image optimization enabled
  - [ ] Compression enabled
  - [ ] Output mode set correctly (standalone/serverless)

- [ ] **TypeScript**
  - [ ] No TypeScript errors (`npm run build`)
  - [ ] All type definitions correct
  - [ ] Strict mode enabled

- [ ] **Linting & Formatting**
  - [ ] ESLint passes (`npm run lint`)
  - [ ] Prettier formatting applied
  - [ ] No console.log statements (use logger instead)

### Code Quality
- [ ] **Error Handling**
  - [ ] All modals have error boundaries
  - [ ] API routes have proper error handling
  - [ ] Client-side error boundaries in place
  - [ ] Error logging configured (Sentry)

- [ ] **Performance**
  - [ ] Images optimized (Next.js Image component)
  - [ ] Code splitting implemented
  - [ ] Lazy loading for heavy components
  - [ ] Modal loading states optimized
  - [ ] API response caching configured

- [ ] **Security**
  - [ ] No API keys in client-side code
  - [ ] Input validation on all API routes
  - [ ] Authentication checks on protected routes
  - [ ] CORS configured correctly
  - [ ] Rate limiting implemented (if needed)

## Vercel Deployment

### Project Setup
- [ ] **Project Configuration**
  - [ ] Project connected to Git repository
  - [ ] Production branch set (usually `main` or `master`)
  - [ ] Preview deployments enabled
  - [ ] Auto-deploy on push enabled

- [ ] **Build Settings**
  - [ ] Framework preset: Next.js
  - [ ] Build command: `npm run build` (or `next build`)
  - [ ] Output directory: `.next` (default)
  - [ ] Install command: `npm install` (or `npm ci`)

- [ ] **Environment Variables**
  - [ ] All environment variables added to Vercel
  - [ ] Variables set for Production, Preview, and Development
  - [ ] Sensitive variables marked as "Encrypted"

### Domain & DNS
- [ ] **Custom Domain**
  - [ ] Domain added to Vercel project
  - [ ] DNS records configured correctly
  - [ ] SSL certificate issued (automatic with Vercel)
  - [ ] Domain verified

- [ ] **Subdomains** (if applicable)
  - [ ] `www` subdomain configured
  - [ ] `api` subdomain configured (if separate)
  - [ ] Redirects set up correctly

## Post-Deployment

### Testing
- [ ] **Functional Testing**
  - [ ] Homepage loads correctly
  - [ ] Authentication flow works (sign in/up)
  - [ ] Dashboard loads with data
  - [ ] All modals open and display correctly
  - [ ] API endpoints respond correctly
  - [ ] Error boundaries catch errors gracefully

- [ ] **Performance Testing**
  - [ ] Lighthouse score > 90 (Performance)
  - [ ] First Contentful Paint < 1.5s
  - [ ] Time to Interactive < 3.5s
  - [ ] Core Web Vitals pass
  - [ ] Modal load times < 500ms

- [ ] **Cross-Browser Testing**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile)

- [ ] **Responsive Testing**
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667, 414x896)

### Monitoring & Alerts
- [ ] **Error Tracking**
  - [ ] Sentry configured and receiving errors
  - [ ] Error alerts set up
  - [ ] Error rate baseline established

- [ ] **Performance Monitoring**
  - [ ] Vercel Analytics enabled
  - [ ] Real User Monitoring (RUM) configured
  - [ ] Performance budgets set

- [ ] **Uptime Monitoring**
  - [ ] Uptime monitoring service configured
  - [ ] Alert thresholds set
  - [ ] On-call rotation established

### Documentation
- [ ] **API Documentation**
  - [ ] API routes documented
  - [ ] Request/response examples provided
  - [ ] Error codes documented

- [ ] **User Documentation**
  - [ ] Getting started guide
  - [ ] Feature documentation
  - [ ] FAQ updated

- [ ] **Internal Documentation**
  - [ ] Deployment process documented
  - [ ] Rollback procedure documented
  - [ ] Environment variable reference

## Rollback Plan

### Quick Rollback
- [ ] **Vercel Rollback**
  - [ ] Previous deployment identified
  - [ ] Rollback process tested
  - [ ] Rollback time < 2 minutes

- [ ] **Database Rollback** (if applicable)
  - [ ] Migration rollback scripts ready
  - [ ] Backup restoration process documented

### Communication
- [ ] **Stakeholder Notification**
  - [ ] Deployment notification sent
  - [ ] Rollback communication plan ready
  - [ ] Status page updated (if applicable)

## Feature Flags

### Production Flags
- [ ] **Feature Toggles**
  - [ ] New features behind flags
  - [ ] Flags can be toggled without deployment
  - [ ] Flag status visible in dashboard

- [ ] **A/B Testing**
  - [ ] Test variants configured
  - [ ] Analytics tracking enabled
  - [ ] Winner selection criteria defined

## Security Checklist

- [ ] **Authentication & Authorization**
  - [ ] Clerk authentication working
  - [ ] Protected routes require auth
  - [ ] Role-based access control (RBAC) implemented

- [ ] **Data Protection**
  - [ ] PII data encrypted
  - [ ] API responses sanitized
  - [ ] SQL injection prevention (if using SQL)
  - [ ] XSS prevention implemented

- [ ] **API Security**
  - [ ] Rate limiting enabled
  - [ ] CORS configured correctly
  - [ ] API keys rotated regularly
  - [ ] Request validation implemented

## Performance Optimization

- [ ] **Caching Strategy**
  - [ ] Static pages cached
  - [ ] API responses cached appropriately
  - [ ] CDN configured (Vercel Edge Network)
  - [ ] Cache invalidation strategy defined

- [ ] **Asset Optimization**
  - [ ] Images optimized and compressed
  - [ ] Fonts optimized (subset, preload)
  - [ ] JavaScript bundles minified
  - [ ] CSS purged and minified

- [ ] **Code Optimization**
  - [ ] Unused code removed
  - [ ] Tree shaking enabled
  - [ ] Dynamic imports for heavy components
  - [ ] Modal lazy loading implemented

## Analytics & Tracking

- [ ] **User Analytics**
  - [ ] Google Analytics configured
  - [ ] Event tracking implemented
  - [ ] Conversion tracking set up
  - [ ] User journey tracking enabled

- [ ] **Business Metrics**
  - [ ] KPI dashboards configured
  - [ ] Revenue tracking implemented
  - [ ] User engagement metrics tracked

## Backup & Recovery

- [ ] **Data Backup**
  - [ ] Database backups automated
  - [ ] Backup retention policy defined
  - [ ] Backup restoration tested

- [ ] **Disaster Recovery**
  - [ ] Recovery time objective (RTO) defined
  - [ ] Recovery point objective (RPO) defined
  - [ ] Disaster recovery plan documented

## Final Checks

- [ ] **Pre-Launch**
  - [ ] All tests passing
  - [ ] No critical bugs
  - [ ] Performance benchmarks met
  - [ ] Security audit passed

- [ ] **Launch**
  - [ ] Deployment successful
  - [ ] Smoke tests passed
  - [ ] Monitoring alerts configured
  - [ ] Team notified

- [ ] **Post-Launch**
  - [ ] Monitor error rates for 24 hours
  - [ ] Monitor performance metrics
  - [ ] Gather user feedback
  - [ ] Document any issues

## Quick Reference

### Deployment Commands
```bash
# Local build test
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test

# Deploy to Vercel (via Git push)
git push origin main
```

### Environment Variable Template
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# APIs
OPENAI_API_KEY=sk-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
RESEND_API_KEY=re_...

# Analytics
NEXT_PUBLIC_GA_ID=G-...

# Monitoring
SENTRY_DSN=https://...
```

### Rollback Command
```bash
# In Vercel Dashboard:
# Deployments → Select previous deployment → "Promote to Production"
```

---

**Last Updated:** [Current Date]
**Maintained By:** Development Team
**Review Frequency:** Before each production deployment

