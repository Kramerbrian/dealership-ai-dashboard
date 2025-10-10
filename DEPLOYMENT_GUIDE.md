# DealershipAI Visibility Engine - Complete Deployment Guide

## 🎯 Overview
This guide provides step-by-step instructions for deploying the DealershipAI Visibility Engine to production, including database setup, API deployment, monitoring configuration, and operational procedures.

---

## 📋 Prerequisites

### Required Tools
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL client** (psql)
- **Git** (for version control)
- **Vercel CLI** (for deployment)

### Required Accounts
- **Supabase** account with project created
- **Vercel** account for hosting
- **GitHub** repository for code hosting
- **Clerk** account for authentication (if using)

### Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd dealership-ai-dashboard

# Install dependencies
npm install

# Install Vercel CLI globally
npm install -g vercel
```

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `dealershipai-visibility-engine`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Wait for project creation (2-3 minutes)

### Step 2: Run Database Migrations
```bash
# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
# Run the main migration
psql "$SUPABASE_URL" -f supabase/migrations/20241220000001_aiv_closed_loop_system.sql

# Set up database functions
psql "$SUPABASE_URL" -f scripts/setup-database-functions.sql
```

### Step 3: Verify Database Setup
```bash
# Test database connection
psql "$SUPABASE_URL" -c "SELECT health_ping();"

# Verify tables exist
psql "$SUPABASE_URL" -c "\dt"

# Test functions
psql "$SUPABASE_URL" -c "SELECT compute_aoer_summary();"
```

---

## 🚀 Application Deployment

### Step 1: Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy the application
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 2: Configure Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

### Step 3: Set Up Cron Jobs
```bash
# Option 1: Using Supabase Cron (Recommended)
psql "$SUPABASE_URL" -c "SELECT setup_cron_jobs();"

# Option 2: Using Vercel Cron Jobs
# Add to vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/compute-aoer",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/compute-elasticity", 
      "schedule": "15 4 * * *"
    },
    {
      "path": "/api/cron/evaluate-model",
      "schedule": "30 4 * * *"
    }
  ]
}
```

---

## 🔧 Configuration & Testing

### Step 1: Run Deployment Verification
```bash
# Make the deployment script executable
chmod +x scripts/deploy-visibility-engine.sh

# Run comprehensive deployment verification
./scripts/deploy-visibility-engine.sh --verbose

# For dry run (recommended first)
./scripts/deploy-visibility-engine.sh --dry-run --verbose
```

### Step 2: Test API Endpoints
```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Test KPIs endpoint
curl "https://your-domain.vercel.app/api/kpis/latest?dealerId=test-tenant"

# Test history endpoint
curl "https://your-domain.vercel.app/api/history?dealerId=test-tenant"

# Test forecast endpoint
curl "https://your-domain.vercel.app/api/predict/forecast?dealerId=test-tenant"
```

### Step 3: Verify Data Pipeline
```bash
# Test data ingestion
psql "$SUPABASE_URL" -c "
INSERT INTO aiv_raw_signals (dealer_id, date, seo, aeo, geo, ugc, geolocal, observed_aiv, observed_rar) 
VALUES ('test-tenant', CURRENT_DATE, 75.5, 82.3, 68.7, 71.2, 79.8, 75.5, 12500.0);
"

# Test AOER computation
psql "$SUPABASE_URL" -c "SELECT compute_aoer_summary();"

# Test elasticity computation
psql "$SUPABASE_URL" -c "SELECT compute_elasticity('test-tenant');"
```

---

## 📊 Monitoring & Observability

### Step 1: Set Up Health Monitoring
```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health | jq

# Expected response structure:
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "healthy", ... },
    "api": { "status": "healthy", ... },
    "resources": { "status": "healthy", ... },
    "pipeline": { "status": "healthy", ... },
    "model": { "status": "healthy", ... }
  },
  "response_time_ms": 150
}
```

### Step 2: Configure Monitoring Services
1. **Uptime Monitoring**: Set up Pingdom, UptimeRobot, or similar
   - Monitor: `https://your-domain.vercel.app/api/health`
   - Alert on: HTTP status != 200
   - Check interval: 1 minute

2. **Error Tracking**: Set up Sentry or similar
   ```bash
   npm install @sentry/nextjs
   # Configure in sentry.client.config.js
   ```

3. **Performance Monitoring**: Enable Vercel Analytics
   - Go to Vercel Dashboard → Analytics
   - Enable Web Analytics
   - Monitor Core Web Vitals

### Step 3: Set Up Logging
```bash
# Configure structured logging
# Add to your application:
import { createLogger } from 'winston';

const logger = createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

---

## 🔒 Security Configuration

### Step 1: Enable Row-Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE aiv_raw_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for aiv_raw_signals)
CREATE POLICY "Users can view their own data" ON aiv_raw_signals
  FOR SELECT USING (dealer_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Service role can manage all data" ON aiv_raw_signals
  FOR ALL USING (auth.role() = 'service_role');
```

### Step 2: Configure API Security
```typescript
// Add to your API routes
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export default limiter;
```

### Step 3: Set Up Authentication
```typescript
// Configure Clerk authentication
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  const { userId, orgId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your API logic here
}
```

---

## 📈 Performance Optimization

### Step 1: Database Optimization
```sql
-- Create additional indexes for performance
CREATE INDEX CONCURRENTLY idx_aiv_raw_signals_dealer_date_aiv 
ON aiv_raw_signals(dealer_id, date DESC, observed_aiv);

CREATE INDEX CONCURRENTLY idx_model_audit_type_date 
ON model_audit(run_type, run_date DESC);

-- Analyze tables for query optimization
ANALYZE aiv_raw_signals;
ANALYZE model_audit;
ANALYZE aoer_queries;
```

### Step 2: API Optimization
```typescript
// Add response caching
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  );
  
  return response;
}
```

### Step 3: Frontend Optimization
```typescript
// Add loading states and error boundaries
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default function Dashboard() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <AIVMetricsPanel />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 🔄 Operational Procedures

### Daily Operations
```bash
# Check system health
curl https://your-domain.vercel.app/api/health

# Monitor data pipeline
psql "$SUPABASE_URL" -c "
SELECT 
  COUNT(*) as total_records,
  MAX(date) as latest_data,
  COUNT(DISTINCT dealer_id) as active_tenants
FROM aiv_raw_signals 
WHERE date >= CURRENT_DATE - INTERVAL '24 hours';
"

# Check for errors
psql "$SUPABASE_URL" -c "
SELECT COUNT(*) as error_count
FROM aoer_failures 
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours';
"
```

### Weekly Operations
```bash
# Run model evaluation
curl -X POST https://your-domain.vercel.app/api/train/evaluate \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "all"}'

# Check model performance
psql "$SUPABASE_URL" -c "
SELECT 
  AVG(r2) as avg_r2,
  AVG(rmse) as avg_rmse,
  COUNT(*) as evaluations
FROM model_audit 
WHERE run_type = 'evaluate' 
AND run_date >= CURRENT_DATE - INTERVAL '7 days';
"

# Clean up old data
psql "$SUPABASE_URL" -c "SELECT cleanup_old_data();"
```

### Monthly Operations
```bash
# Full system health check
./scripts/deploy-visibility-engine.sh --verbose

# Performance review
psql "$SUPABASE_URL" -c "SELECT get_system_metrics();"

# Security audit
# Review access logs, check for anomalies
# Update dependencies
npm audit
npm update
```

---

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check connection
psql "$SUPABASE_URL" -c "SELECT 1;"

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### API Endpoint Failures
```bash
# Check logs
vercel logs

# Test individual endpoints
curl -v https://your-domain.vercel.app/api/health
curl -v https://your-domain.vercel.app/api/kpis/latest?dealerId=test
```

#### Performance Issues
```bash
# Check database performance
psql "$SUPABASE_URL" -c "
SELECT 
  query,
  mean_time,
  calls
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.vercel.app/api/health
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Rollback to previous version
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

#### Database Recovery
```bash
# Restore from backup
psql "$SUPABASE_URL" < backup.sql

# Or restore specific tables
psql "$SUPABASE_URL" -c "TRUNCATE aiv_raw_signals;"
psql "$SUPABASE_URL" -c "\copy aiv_raw_signals FROM 'backup.csv' CSV HEADER;"
```

---

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)

### Support
- **Technical Issues**: Create GitHub issue
- **Business Questions**: Contact product team
- **Emergency Support**: Use incident response procedures

### Monitoring Dashboards
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Health Check**: https://your-domain.vercel.app/api/health

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Security policies enabled
- [ ] Monitoring configured

### Deployment
- [ ] Application deployed to Vercel
- [ ] Custom domain configured
- [ ] SSL certificate valid
- [ ] Cron jobs scheduled
- [ ] Health checks passing

### Post-Deployment
- [ ] All endpoints responding
- [ ] Data pipeline working
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Team trained

---

*This deployment guide should be reviewed and updated regularly as the system evolves.*