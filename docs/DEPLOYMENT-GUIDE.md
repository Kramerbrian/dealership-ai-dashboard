# DealershipAI Production Deployment Guide

## Complete Production Deployment Checklist

This guide covers everything you need to deploy DealershipAI Dashboard to production.

## Phase 1: Pre-Deployment Setup ✅

### Infrastructure Preparation

- [x] **Build Infrastructure Created** - Monorepo with pnpm workspaces configured
- [x] **Production Build Successful** - All compilation errors resolved
- [x] **Environment Configuration** - `.env.example` template created
- [x] **Vercel Configuration** - `vercel.json` with security headers
- [x] **Domain & SSL Setup Script** - `scripts/setup-domain-ssl.sh` created

### Security Configuration

- [x] **Security Headers** - HSTS, CSP, X-Frame-Options configured
- [x] **Authentication Middleware** - JWT-based auth with role-based access
- [x] **API Route Protection** - `withAuth` middleware applied to endpoints
- [x] **Environment Variable Security** - No secrets exposed in code

## Phase 2: Deployment Execution

### Environment Variables Setup

**Database Configuration:**
```bash
DATABASE_URL=postgres://user:pass@host:5432/dealershipai
REDIS_URL=redis://host:6379/0
```

**Authentication Secrets:**
```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com
```

**AI API Keys:**
```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-key
PERPLEXITY_API_KEY=pplx-your-key
GEMINI_API_KEY=your-gemini-key
```

**External Integrations:**
```bash
GOOGLE_MAPS_API_KEY=your-maps-key
YELP_API_KEY=your-yelp-key
PARTNER_WEBHOOK_TOKEN=secure-token
```

### Domain & SSL Certificate Setup

```bash
# Run domain setup script
cd apps/web
./scripts/setup-domain-ssl.sh your-domain.com
```

**DNS Configuration Required:**
- [ ] **A Record**: `@ -> 76.76.19.61` (Vercel IP)
- [ ] **CNAME Record**: `www -> cname.vercel-dns.com`
- [ ] **Verification**: Domain propagation check

### Database Setup

```bash
# Run database migrations
npx prisma generate
npx prisma db push --accept-data-loss
```

- [ ] **PostgreSQL Connection** - Database accessible
- [ ] **Schema Migration** - Tables created
- [ ] **Seed Data** - Default configurations loaded

## Phase 3: Deployment Scripts

### Primary Deployment

```bash
# Execute production deployment
./scripts/complete-deployment.sh --execute
```

**Script Validates:**
- [ ] **Environment Variables** - All required vars present
- [ ] **Database Connectivity** - PostgreSQL connection test
- [ ] **Application Build** - Clean build without errors
- [ ] **Health Checks** - API endpoints responding
- [ ] **Performance Tests** - Page load times < 2s
- [ ] **Security Validation** - No exposed secrets

### SSL Certificate Verification

```bash
# Verify SSL configuration
./scripts/verify-ssl.sh your-domain.com

# Monitor certificate health
./scripts/monitor-ssl.sh your-domain.com
```

## Phase 4: Post-Deployment Verification

### System Health Checks

- [ ] **API Health Endpoint**: `GET /api/v1/health`
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-01-20T...",
    "services": {
      "database": "connected",
      "redis": "connected",
      "ai_providers": "available"
    }
  }
  ```

- [ ] **Probe Status Endpoint**: `GET /api/v1/probe/status`
  ```json
  {
    "counts": {...},
    "cost": {"daily": 0, "monthly": 0},
    "dlq": {"count": 0}
  }
  ```

### Application Functionality

- [ ] **Authentication Flow** - Login/logout working
- [ ] **Dashboard Access** - Role-based dashboards loading
- [ ] **AI Chat Interface** - Chat responses functional
- [ ] **Analytics Page** - Metrics displaying correctly
- [ ] **Admin Panel** - System monitoring accessible

### Performance Validation

- [ ] **Page Load Speed** - All pages < 2 seconds
- [ ] **API Response Time** - Endpoints < 500ms
- [ ] **Database Queries** - Optimized query performance
- [ ] **Memory Usage** - No memory leaks detected

### Security Verification

- [ ] **SSL Certificate** - A+ rating on SSL Labs
- [ ] **Security Headers** - All headers present
- [ ] **HTTPS Redirect** - HTTP traffic redirected
- [ ] **Authentication** - Unauthorized access blocked

## Phase 5: Monitoring & Alerting Setup

### Application Monitoring

- [ ] **Sentry Integration** - Error tracking active
- [ ] **Performance Monitoring** - Response time tracking
- [ ] **Uptime Monitoring** - External health checks
- [ ] **Log Aggregation** - Centralized logging

### Business Metrics

- [ ] **Usage Analytics** - User activity tracking
- [ ] **API Metrics** - Endpoint usage statistics
- [ ] **Cost Monitoring** - AI provider cost tracking
- [ ] **Revenue Attribution** - Dealer performance metrics

## Phase 6: Beta Program Preparation

### Documentation

- [ ] **API Documentation** - OpenAPI spec published
- [ ] **User Onboarding** - Step-by-step guides
- [ ] **Admin Documentation** - System administration
- [ ] **Troubleshooting Guide** - Common issues & solutions

### Beta Testing Infrastructure

- [ ] **Feedback Collection** - In-app feedback system
- [ ] **Feature Flags** - A/B testing capability
- [ ] **Usage Monitoring** - Beta user behavior tracking
- [ ] **Support Channel** - Help desk integration

## Deployment Commands Summary

```bash
# 1. Environment Setup
cp .env.example .env.local
# Edit .env.local with production values

# 2. Domain & SSL Setup
./scripts/setup-domain-ssl.sh dealershipai.com

# 3. Production Deployment
./scripts/complete-deployment.sh --execute

# 4. Verification
./scripts/verify-ssl.sh dealershipai.com
./scripts/monitor-ssl.sh dealershipai.com

# 5. Health Checks
curl -f https://dealershipai.com/api/v1/health
curl -f https://dealershipai.com/api/v1/probe/status
```

## Emergency Rollback Plan

### Immediate Rollback

```bash
# Revert to previous Vercel deployment
vercel rollback --yes

# Database rollback (if needed)
npx prisma db push --schema=schema.backup.prisma
```

### Communication Plan

- [ ] **Status Page Update** - Notify users of issues
- [ ] **Stakeholder Alert** - Internal team notification
- [ ] **Customer Communication** - Beta users informed

## Success Criteria

### Technical Metrics

- [ ] **99.9% Uptime** - High availability achieved
- [ ] **< 500ms API Response** - Fast API performance
- [ ] **< 2s Page Load** - Optimal user experience
- [ ] **A+ SSL Rating** - Maximum security score

### Business Metrics

- [ ] **User Registration** - Beta signups active
- [ ] **Feature Adoption** - Core features used
- [ ] **Error Rate < 0.1%** - High reliability
- [ ] **Customer Satisfaction** - Positive feedback

---

## 📞 Support Contacts

**Technical Issues:**
- System Admin: Check logs at `/var/log/dealershipai/`
- Database Issues: Check PostgreSQL logs
- SSL Issues: Run `./scripts/verify-ssl.sh`

**Business Issues:**
- User Reports: Monitor feedback collection system
- Performance: Check Sentry dashboard
- Billing: Monitor AI provider usage

---

**Last Updated:** January 20, 2025  
**Version:** 1.0  
**Environment:** Production
