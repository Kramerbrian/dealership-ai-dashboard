# Upstash Redis Setup Guide

## Overview

This guide walks you through setting up Upstash Redis for the DealershipAI Dashboard. Upstash Redis is used for:
- Rate limiting (API, webhook, and burst protection)
- Caching (policy versions, audit results, analytics data)
- Session management
- Idempotency key storage

## Prerequisites

- Upstash account (free tier available)
- Access to your project's environment variables
- Basic understanding of Redis concepts

---

## Step 1: Create an Upstash Redis Database

### 1.1 Sign Up for Upstash

1. Go to [https://upstash.com](https://upstash.com)
2. Click "Sign Up" or "Get Started"
3. Sign up using GitHub, Google, or email
4. Verify your email if required

### 1.2 Create a New Redis Database

1. Once logged in, click **"Create Database"**
2. Configure your database:
   - **Name:** `dealership-ai-dashboard` (or your preferred name)
   - **Region:** Select the region closest to your Vercel deployment
     - US East (N. Virginia) - `us-east-1`
     - US West (Oregon) - `us-west-1`
     - Europe (Frankfurt) - `eu-central-1`
   - **Type:** Select **"Regional"** (faster, lower latency)
   - **TLS:** Keep **enabled** for security
   - **Eviction:** Select **"No eviction"** (we manage our own TTLs)

3. Click **"Create"**

### 1.3 Get Your Connection Credentials

After creating the database, you'll see the database details page. You need two values:

1. **UPSTASH_REDIS_REST_URL**
   - Example: `https://us1-fine-mouse-12345.upstash.io`
   - Copy this entire URL

2. **UPSTASH_REDIS_REST_TOKEN**
   - Click "Show" next to "REST Token"
   - Copy the full token (starts with `A...`)

---

## Step 2: Configure Environment Variables

### 2.1 Local Development (.env.local)

1. Open or create `.env.local` in your project root:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-database-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxYourTokenHerexxxZ
```

2. Replace the placeholder values with your actual credentials from Step 1.3

3. **Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 2.2 Vercel Production Environment

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash URL | Production, Preview, Development |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token | Production, Preview, Development |

4. Click **"Save"**
5. Redeploy your application for changes to take effect

---

## Step 3: Verify the Connection

### 3.1 Test Locally

1. Start your development server:
```bash
npm run dev
```

2. Check the console for Redis connection logs:
```
[Cache] Redis initialized successfully
```

If you see an error:
```
[Cache] Redis not available: [error details]
```
Double-check your credentials in `.env.local`.

### 3.2 Test with Code

Create a test file `scripts/test-redis.ts`:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function testRedis() {
  try {
    // Test write
    await redis.set('test-key', 'Hello from DealershipAI!');
    console.log('✅ Write successful');

    // Test read
    const value = await redis.get('test-key');
    console.log('✅ Read successful:', value);

    // Test TTL
    await redis.setex('test-ttl', 60, 'Expires in 60 seconds');
    const ttl = await redis.ttl('test-ttl');
    console.log('✅ TTL test successful:', ttl, 'seconds remaining');

    // Cleanup
    await redis.del('test-key', 'test-ttl');
    console.log('✅ Cleanup successful');

    console.log('\n✅ All Redis tests passed!');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  }
}

testRedis();
```

Run the test:
```bash
npx tsx scripts/test-redis.ts
```

Expected output:
```
✅ Write successful
✅ Read successful: Hello from DealershipAI!
✅ TTL test successful: 60 seconds remaining
✅ Cleanup successful

✅ All Redis tests passed!
```

---

## Step 4: Understanding Redis Usage in the Codebase

### 4.1 Cache Layer (`lib/cache.ts`)

The cache layer provides a simple interface for caching JSON data:

```typescript
import { cacheJSON, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Cache with automatic TTL
const data = await cacheJSON(
  CACHE_KEYS.VISIBILITY_GEO,
  CACHE_TTL.MEDIUM,
  async () => {
    // Expensive operation
    return fetchGeoData();
  }
);
```

**Cache Keys Available:**
- `VISIBILITY_AEO` - AEO visibility scores
- `VISIBILITY_GEO` - GEO visibility scores
- `VISIBILITY_SEO` - SEO visibility scores
- `AI_SCORES` - AI platform scores
- `PRESENCE` - Online presence data
- `ANALYTICS_EVENTS` - Analytics events
- `ANALYTICS_METRICS` - Analytics metrics
- `ANALYTICS_REALTIME` - Real-time analytics
- `CUSTOM_REPORTS` - Custom report data
- `USER_CUSTOM_REPORTS` - User-specific reports

**TTL Values:**
- `SHORT`: 5 minutes
- `MEDIUM`: 30 minutes
- `LONG`: 1 hour
- `DAY`: 24 hours

### 4.2 Rate Limiting (`lib/rate-limiter-redis.ts`)

Rate limiters protect API endpoints:

```typescript
import { createRateLimiters } from '@/lib/rate-limiter-redis';

const rateLimiters = createRateLimiters(redis);

// Check API rate limit
const result = await rateLimiters.api.checkLimit('tenant-123');

if (!result.allowed) {
  // Rate limit exceeded
  console.log('Retry after:', result.retryAfter, 'seconds');
}
```

**Rate Limiter Types:**
- `api`: 1000 requests/minute (standard API calls)
- `webhook`: 100 requests/minute (webhook endpoints)
- `tenant`: 5000 requests/hour (per-tenant limits)
- `burst`: 2000 tokens, 10/second refill (burst protection)

### 4.3 Compliance Storage (`lib/compliance/storage.ts`)

Stores Google policy compliance data:

```typescript
import { savePolicyVersion, getCurrentPolicyVersion } from '@/lib/compliance/storage';

// Save policy version
await savePolicyVersion({
  version: '2024-01',
  lastUpdated: new Date().toISOString(),
  changes: ['Updated pricing transparency rules']
});

// Retrieve cached version
const currentPolicy = await getCurrentPolicyVersion();
```

---

## Step 5: Monitoring and Maintenance

### 5.1 Upstash Dashboard

Monitor your Redis usage in the Upstash dashboard:

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Select your database
3. View metrics:
   - **Commands/sec**: Request rate
   - **Throughput**: Data transferred
   - **Memory usage**: Current storage
   - **Connection count**: Active connections

### 5.2 Key Metrics to Watch

**Free Tier Limits:**
- 10,000 commands/day
- 256 MB storage
- 1 GB bandwidth/month

**When to Upgrade:**
- Approaching command limit → Upgrade to Pro ($10/month)
- High memory usage → Optimize TTLs or upgrade storage
- Rate limiting errors → Increase request limits

### 5.3 Debugging Redis Issues

**Issue: "Redis not available" in logs**

```
[Cache] Redis not available: Connection timeout
```

**Solutions:**
1. Verify environment variables are set correctly
2. Check Upstash dashboard - database should show "Active"
3. Verify your IP isn't blocked (Upstash allows all IPs by default)
4. Test connection with curl:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-database-url.upstash.io/get/test
```

**Issue: Rate limit errors**

```
Error: Rate limit exceeded
```

**Solutions:**
1. Check Upstash dashboard for command usage
2. Optimize cache TTLs to reduce reads
3. Implement request batching
4. Upgrade to higher tier if needed

**Issue: Stale cache data**

**Solutions:**
1. Manually invalidate keys:
```typescript
await redis.del('cache-key');
```

2. Adjust TTL values in `lib/cache.ts`:
```typescript
export const CACHE_TTL = {
  SHORT: 300,      // Decrease for fresher data
  MEDIUM: 1800,
  LONG: 3600,
  DAY: 86400,
};
```

---

## Step 6: Advanced Configuration

### 6.1 Connection Pooling

For high-traffic applications, consider connection pooling:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 10000),
  },
});
```

### 6.2 Custom Cache Strategies

Implement cache-aside pattern with stale-while-revalidate:

```typescript
async function cacheWithSWR<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached) {
    // Return cached data immediately
    // Revalidate in background
    fetcher().then(fresh => redis.setex(key, ttl, JSON.stringify(fresh)));
    return cached;
  }

  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
```

### 6.3 Redis Persistence

Upstash automatically handles persistence with:
- **Snapshots**: Periodic disk snapshots
- **Replication**: Data replicated across availability zones
- **Durability**: AOF (Append-Only File) for data safety

No manual configuration needed.

---

## Step 7: Production Checklist

Before deploying to production:

- [ ] Upstash Redis database created
- [ ] Environment variables set in Vercel
- [ ] Connection tested locally
- [ ] Rate limiters configured for production traffic
- [ ] Cache TTLs optimized for your use case
- [ ] Monitoring enabled in Upstash dashboard
- [ ] Backup strategy documented (Upstash auto-backups)
- [ ] Error tracking configured (Sentry integration)

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Invalid credentials | Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` |
| Rate limit exceeded | Too many requests | Upgrade Upstash plan or optimize request patterns |
| High memory usage | Large cache values | Reduce TTLs or implement eviction strategy |
| Stale data | Long TTLs | Decrease cache TTL values |
| "Mock storage" warnings | Redis not initialized | Check environment variables are loaded |

### Getting Help

1. **Upstash Documentation**: [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
2. **Upstash Discord**: [https://upstash.com/discord](https://upstash.com/discord)
3. **DealershipAI Issues**: File a GitHub issue with `[Redis]` tag

---

## Migration from Development to Production

### Step-by-Step Migration

1. **Export development data** (if needed):
```bash
npx tsx scripts/export-redis-data.ts
```

2. **Create production database** in Upstash

3. **Update Vercel environment variables** with production credentials

4. **Deploy to Vercel**:
```bash
vercel --prod
```

5. **Verify production connection**:
```bash
curl https://your-domain.com/api/health
```

6. **Monitor for 24 hours** to ensure stability

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use Vercel's encrypted environment variables** for production
3. **Enable TLS** for all Redis connections (enabled by default)
4. **Rotate tokens periodically** (every 90 days recommended)
5. **Monitor access logs** in Upstash dashboard for suspicious activity
6. **Implement rate limiting** on all public endpoints
7. **Use read-only tokens** where write access isn't needed

---

## Cost Optimization

### Free Tier Strategy

Stay within free tier limits (10,000 commands/day):

1. **Aggressive TTLs**: Cache frequently accessed data longer
2. **Batch operations**: Use pipelines for multiple commands
3. **Lazy loading**: Only cache when needed, not preemptively
4. **Monitor usage**: Set up alerts at 80% of daily limit

### Paid Tier ROI

Upgrade to Pro ($10/month) when:
- Serving 500+ daily active users
- Rate limiting becomes a bottleneck
- Need guaranteed uptime SLA
- Require more than 256 MB storage

---

## Resources

- **Upstash Console**: [https://console.upstash.com](https://console.upstash.com)
- **Upstash Documentation**: [https://docs.upstash.com](https://docs.upstash.com)
- **Redis Commands Reference**: [https://redis.io/commands](https://redis.io/commands)
- **@upstash/redis SDK**: [https://github.com/upstash/upstash-redis](https://github.com/upstash/upstash-redis)

---

## Next Steps

After completing this setup:

1. ✅ Test all API endpoints with rate limiting enabled
2. ✅ Monitor cache hit rates in production
3. ✅ Set up alerts for Redis connection failures
4. ✅ Document any custom cache strategies for your team
5. ✅ Schedule quarterly review of cache performance

---

**Setup Complete!** 🎉

Your DealershipAI Dashboard is now configured with Upstash Redis for high-performance caching and rate limiting.
