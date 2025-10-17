# Google Analytics Integration - Production Deployment

## Pre-Deployment Checklist

### ✅ Completed
- [x] Google Analytics Data API package installed
- [x] Analytics client library created
- [x] Test endpoint created (`/api/test-analytics`)
- [x] Environment variables documented
- [x] Test script created

### 🔄 Before Deploying

- [ ] Google Analytics credentials obtained
- [ ] Service account has GA4 Viewer access
- [ ] Local testing completed successfully
- [ ] Environment variables ready for Vercel

## Deployment Steps

### 1. Verify Local Setup

```bash
# Test the integration locally
npm run test:analytics

# Expected output:
# ✅ All tests passed successfully!
# 📊 Summary with active users, sessions, etc.
```

If this fails, review [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md).

### 2. Prepare Vercel Environment Variables

You'll need these values from your Google service account JSON:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@project.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

Extract these values:
- `GA_PROPERTY_ID` - Your GA4 property ID (e.g., "123456789")
- `GA_PROJECT_ID` - `project_id` from JSON
- `GA_SERVICE_ACCOUNT_EMAIL` - `client_email` from JSON
- `GA_PRIVATE_KEY` - `private_key` from JSON (keep `\n` characters!)

### 3. Add Environment Variables to Vercel

#### Option A: Via Vercel Dashboard

1. Go to your project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `GA_PROPERTY_ID` | Your property ID | Production, Preview, Development |
| `GA_PROJECT_ID` | From JSON | Production, Preview, Development |
| `GA_SERVICE_ACCOUNT_EMAIL` | From JSON | Production, Preview, Development |
| `GA_PRIVATE_KEY` | From JSON (with `\n`) | Production, Preview, Development |

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Add variables
vercel env add GA_PROPERTY_ID production
vercel env add GA_PROJECT_ID production
vercel env add GA_SERVICE_ACCOUNT_EMAIL production
vercel env add GA_PRIVATE_KEY production

# Repeat for preview and development environments
```

#### Option C: Automated Script

```bash
# Create a script to add all variables
./scripts/setup-vercel-analytics-env.sh
```

### 4. Deploy to Vercel

```bash
# Option 1: Push to main branch (triggers auto-deploy)
git add .
git commit -m "feat: add Google Analytics Data API integration"
git push origin main

# Option 2: Manual deployment via CLI
vercel --prod
```

### 5. Verify Production Deployment

```bash
# Test the production endpoint
curl https://your-domain.vercel.app/api/test-analytics

# Expected response:
# {
#   "success": true,
#   "message": "Google Analytics Data API integration successful",
#   "data": { ... }
# }
```

### 6. Monitor and Optimize

#### Set Up Monitoring

```typescript
// Add to your monitoring dashboard
const metrics = {
  apiCalls: 0,
  errors: 0,
  averageResponseTime: 0,
};

// Track in your logging service
console.log('GA API call', { duration, success });
```

#### Implement Caching

```typescript
// Example with Redis
import { redis } from '@/lib/redis';

async function getCachedAnalytics(key: string, ttl: number = 300) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await client.getUserEngagement();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

#### Rate Limiting

Google Analytics Data API quotas:
- **Free tier**: 25,000 tokens/day
- **Paid tier**: Higher limits

Implement caching to stay within limits:
- Cache active users: 15 minutes
- Cache engagement data: 1 hour
- Cache top pages: 1 hour
- Realtime users: 1 minute

## Post-Deployment

### Test Production

```bash
# Quick health check
curl https://your-domain.com/api/test-analytics | jq '.success'

# Expected: true
```

### Update Dashboard Components

Now that real data is available, update your dashboard components to use live data instead of mock data:

```typescript
// Before (mock data)
const activeUsers = 1234;

// After (real data)
import { getAnalyticsClient } from '@/lib/analytics/google-analytics-client';

export async function DashboardPage() {
  const client = getAnalyticsClient();
  const activeUsers = await client.getActiveUsers('30daysAgo', 'today');

  return <Dashboard activeUsers={activeUsers} />;
}
```

### Set Up Alerts

Configure alerts for:
- API errors (> 5% error rate)
- Quota warnings (> 80% of daily limit)
- Response time degradation (> 2s average)

## Rollback Plan

If issues occur after deployment:

```bash
# Revert the deployment
vercel rollback

# Or remove environment variables temporarily
vercel env rm GA_PROPERTY_ID production
```

## Cost Considerations

- **Free tier**: 25,000 tokens/day (sufficient for most use cases)
- **Token usage**: Each API call uses ~10 tokens on average
- **Recommendations**:
  - Cache aggressively (15min - 1hr TTL)
  - Batch requests when possible
  - Monitor quota usage

## Security Best Practices

✅ **Do:**
- Store credentials as environment variables
- Use service account (not user account)
- Grant minimum required permissions (Viewer only)
- Rotate keys periodically (every 90 days)
- Monitor for suspicious API usage

❌ **Don't:**
- Commit credentials to git
- Use personal Google account
- Grant Editor/Admin access
- Share credentials across projects
- Expose credentials in client-side code

## Troubleshooting Production Issues

### Issue: "GOOGLE_APPLICATION_CREDENTIALS not found"

**Solution**: Use individual env vars instead of file path:

```typescript
credentials: {
  client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
```

### Issue: Rate limit exceeded

**Solution**: Implement caching and request throttling:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1h'),
});
```

### Issue: Slow response times

**Solutions**:
1. Implement Redis caching
2. Use Promise.all() for parallel requests
3. Reduce date ranges when possible
4. Limit result sets

## Success Metrics

Track these KPIs after deployment:

- ✅ API success rate > 99.5%
- ✅ Average response time < 1s
- ✅ Cache hit rate > 80%
- ✅ Daily quota usage < 50%
- ✅ Zero credential leaks/exposure

## Next Steps

1. Monitor production for 24 hours
2. Optimize cache TTLs based on usage
3. Implement dashboard widgets with real data
4. Set up automated daily reports
5. Configure alerting for anomalies

## Support Resources

- [Google Analytics Data API Docs](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Rate Limiting Guide](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas)
- Internal: [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)
