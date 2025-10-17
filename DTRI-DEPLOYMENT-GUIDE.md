# DTRI System Deployment Guide

## Overview

The **Dealership Trust & Revenue Intelligence (DTRI)** system is a comprehensive analytics platform that combines Next.js frontend/API with a Python ADA (Advanced Data Analytics) engine. This hybrid deployment uses Vercel for the main application and Fly.io for the Python analytics container.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel App    │    │   Fly.io ADA    │    │   Supabase      │
│                 │    │   Container     │    │   Database      │
│ • Next.js API   │◄──►│ • FastAPI       │◄──►│ • PostgreSQL    │
│ • Dashboard     │    │ • Python ML     │    │ • RLS Policies  │
│ • BullMQ Jobs   │    │ • Analytics     │    │ • Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Vercel account with Pro plan (for cron jobs)
- Fly.io account
- Supabase project
- Redis instance (Upstash recommended)
- OpenAI API key
- Anthropic API key (optional)

## Deployment Steps

### 1. Deploy Python ADA Container to Fly.io

#### Step 1.1: Install Fly.io CLI
```bash
# macOS
brew install flyctl

# Linux/Windows
curl -L https://fly.io/install.sh | sh
```

#### Step 1.2: Login to Fly.io
```bash
fly auth login
```

#### Step 1.3: Deploy the ADA Container
```bash
# From the project root
fly deploy

# This will use the fly.toml configuration
```

#### Step 1.4: Set Environment Variables
```bash
fly secrets set REDIS_URL="redis://your-redis-url"
fly secrets set SUPABASE_URL="https://your-project.supabase.co"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set OPENAI_API_KEY="your-openai-key"
```

#### Step 1.5: Verify Deployment
```bash
# Check app status
fly status

# View logs
fly logs

# Test health endpoint
curl https://your-app-name.fly.dev/health
```

### 2. Deploy Next.js App to Vercel

#### Step 2.1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2.2: Login to Vercel
```bash
vercel login
```

#### Step 2.3: Deploy the Application
```bash
# From the project root
vercel --prod
```

#### Step 2.4: Set Environment Variables in Vercel
```bash
# Set all required environment variables
vercel env add REDIS_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add ADA_ENGINE_URL
vercel env add ADA_ENGINE_TOKEN
vercel env add CRON_SECRET
```

### 3. Database Setup

#### Step 3.1: Run Database Migrations
```sql
-- Execute the DTRI schema
\i database/dtri-schema.sql
```

#### Step 3.2: Set Up Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE dtri_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_metrics_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE elasticity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_recommendations ENABLE ROW LEVEL SECURITY;
```

### 4. Redis Setup (Upstash)

#### Step 4.1: Create Upstash Redis Database
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the connection URL

#### Step 4.2: Configure Redis in Vercel
```bash
vercel env add REDIS_URL "redis://default:password@your-redis-url:6379"
```

### 5. Testing the Deployment

#### Step 5.1: Test ADA Engine Health
```bash
curl https://your-ada-app.fly.dev/health
```

#### Step 5.2: Test DTRI API Endpoints
```bash
# Test enhancer endpoint
curl -X POST https://your-vercel-app.vercel.app/api/dtri/enhancer \
  -H "Content-Type: application/json" \
  -d '{"dealerData": [{"dealer_id": "test", "trust_score": 75, "revenue": 100000}]}'

# Test trust metrics endpoint
curl -X POST https://your-vercel-app.vercel.app/api/dtri/trust-metrics \
  -H "Content-Type: application/json" \
  -d '{"dealerData": [{"dealer_id": "test", "trust_score": 75}]}'

# Test elasticity endpoint
curl -X POST https://your-vercel-app.vercel.app/api/dtri/elasticity \
  -H "Content-Type: application/json" \
  -d '{"dealerData": [{"dealer_id": "test", "trust_score": 75, "revenue": 100000}]}'
```

#### Step 5.3: Test Cron Job
```bash
# Manually trigger the nightly analysis
curl -X GET https://your-vercel-app.vercel.app/api/cron/nightly-dtri-analysis \
  -H "Authorization: Bearer your-cron-secret"
```

## Environment Variables Reference

### Vercel Environment Variables
```bash
# Database
REDIS_URL=redis://default:password@your-redis-url:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# ADA Engine
ADA_ENGINE_URL=https://your-ada-app.fly.dev
ADA_ENGINE_TOKEN=your-ada-engine-token

# Security
CRON_SECRET=your-random-cron-secret
```

### Fly.io Environment Variables
```bash
# Database
REDIS_URL=redis://default:password@your-redis-url:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Application
PYTHONUNBUFFERED=1
PORT=8080
```

## Monitoring and Maintenance

### 1. Health Monitoring

#### ADA Engine Health Check
```bash
# Check ADA engine status
curl https://your-ada-app.fly.dev/health

# Check readiness
curl https://your-ada-app.fly.dev/ready
```

#### Queue Monitoring
```bash
# Check queue stats
curl -X POST https://your-vercel-app.vercel.app/api/cron/nightly-dtri-analysis \
  -H "Content-Type: application/json" \
  -d '{"action": "get_queue_stats"}'
```

### 2. Log Monitoring

#### Fly.io Logs
```bash
fly logs -a your-ada-app
```

#### Vercel Logs
```bash
vercel logs
```

### 3. Database Monitoring

#### Performance Queries
```sql
-- Check DTRI performance stats
SELECT * FROM get_dtri_performance_stats();

-- View recent analyses
SELECT * FROM dtri_analytics_summary 
ORDER BY last_analysis DESC 
LIMIT 10;

-- Check queue status
SELECT queue_name, status, COUNT(*) 
FROM job_queue_status 
GROUP BY queue_name, status;
```

## Scaling Considerations

### 1. Fly.io Auto-scaling
- The ADA container is configured to scale to zero when idle
- Minimum 0 machines, maximum 10 machines
- Auto-start/stop based on demand

### 2. Vercel Function Limits
- 30-second timeout for API routes
- 1GB memory limit per function
- Consider breaking large analyses into smaller chunks

### 3. Redis Optimization
- Use Redis clustering for high availability
- Implement proper TTL for cached results
- Monitor memory usage and connection limits

## Security Best Practices

### 1. API Security
- All API routes use proper CORS configuration
- Environment variables are properly secured
- Cron jobs use authentication tokens

### 2. Database Security
- Row Level Security (RLS) enabled on all tables
- Tenant isolation enforced at database level
- Service role key has minimal required permissions

### 3. Network Security
- ADA engine uses trusted host middleware
- All communications use HTTPS
- Internal API calls use authentication tokens

## Troubleshooting

### Common Issues

#### 1. ADA Engine Connection Failed
```bash
# Check ADA engine status
fly status -a your-ada-app

# Check logs for errors
fly logs -a your-ada-app

# Restart the app if needed
fly restart -a your-ada-app
```

#### 2. Queue Jobs Failing
```bash
# Check Redis connection
redis-cli -u $REDIS_URL ping

# Check queue stats
curl -X POST https://your-vercel-app.vercel.app/api/cron/nightly-dtri-analysis \
  -H "Content-Type: application/json" \
  -d '{"action": "get_queue_stats"}'
```

#### 3. Database Connection Issues
```sql
-- Check database connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;
```

### Performance Optimization

#### 1. Database Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_dtri_dealer_created_at 
ON dtri_analysis_results(dealer_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_trust_score_trend 
ON trust_metrics_results(dealer_id, overall_trust_score, created_at);
```

#### 2. Redis Caching
```typescript
// Implement caching for expensive operations
const cacheKey = `dtri:${dealerId}:${analysisType}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Store results with TTL
await redis.setex(cacheKey, 3600, JSON.stringify(results));
```

## Cost Optimization

### 1. Fly.io Costs
- Use shared CPU machines for cost efficiency
- Scale to zero when idle
- Monitor usage with `fly dashboard`

### 2. Vercel Costs
- Optimize function execution time
- Use edge caching where possible
- Monitor bandwidth usage

### 3. Database Costs
- Implement data retention policies
- Use connection pooling
- Optimize query performance

## Support and Maintenance

### 1. Regular Maintenance Tasks
- Weekly database cleanup (automated)
- Monthly performance review
- Quarterly security audit

### 2. Monitoring Alerts
- Set up alerts for ADA engine downtime
- Monitor queue backlog
- Track error rates and response times

### 3. Backup Strategy
- Daily database backups
- Redis persistence enabled
- Configuration version control

## Conclusion

The DTRI system provides a robust, scalable solution for dealership trust and revenue intelligence. The hybrid deployment architecture ensures optimal performance while maintaining cost efficiency. Regular monitoring and maintenance will ensure the system continues to deliver valuable insights to dealerships.

For additional support or questions, refer to the individual component documentation or contact the development team.
