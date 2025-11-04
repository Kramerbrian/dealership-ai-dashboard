# Upstash Redis Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Upstash Redis Database

1. **Go to Upstash Console**: https://console.upstash.com/
2. **Sign in** (or create account - free tier available)
3. **Create Database**:
   - Click "Create Database"
   - Choose **"Regional"** (recommended for better performance)
   - Select region closest to your Vercel deployment
   - Choose **"Pay as you go"** plan (free tier: 10K commands/day)
   - Click "Create"

### Step 2: Get Your Credentials

After creating the database:

1. **Copy the REST URL**:
   - Format: `https://your-db-name.upstash.io`
   - Found in: Database Overview → REST API

2. **Copy the REST Token**:
   - Click "Show" next to REST Token
   - Copy the full token (starts with `AX...`)

### Step 3: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/your-project/settings/environment-variables

2. **Add these variables**:
   ```
   UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AX...your-token-here
   ```

3. **Select environments**: ✅ Production, ✅ Preview, ✅ Development

4. **Save** and **Redeploy** your project

---

## Alternative: Self-Hosted Redis

If you prefer self-hosted Redis:

### Option 1: Railway
1. Go to https://railway.app/
2. Create new project → Add Redis
3. Copy connection URL

### Option 2: Render
1. Go to https://render.com/
2. Create new Redis instance
3. Copy connection details

### Option 3: Redis Cloud
1. Go to https://redis.com/cloud/
2. Create free database
3. Copy connection string

**Note**: For self-hosted Redis, you'll need to update `lib/job-queue.ts` to use the connection string format instead of REST API.

---

## Verify Setup

### Check if Worker is Running

After deployment, check your logs:

```bash
# In Vercel logs or terminal
# You should see:
[Instrumentation] Background job worker initialized
```

If you see:
```
[Instrumentation] Background job worker skipped (Redis not configured)
```

Then Redis environment variables are not set correctly.

---

## Test Background Jobs

### 1. Queue a Test Job

```bash
curl -X POST https://your-app.vercel.app/api/jobs/queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "PROCESS_DATA",
    "payload": {
      "jobType": "ai-score-calculation",
      "domain": "www.example.com",
      "tenantId": "test-tenant",
      "userId": "test-user"
    }
  }'
```

### 2. Check Queue Stats

```bash
curl https://your-app.vercel.app/api/jobs/queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "waiting": 0,
    "active": 1,
    "completed": 5,
    "failed": 0,
    "delayed": 0
  }
}
```

---

## Pricing

### Upstash Free Tier:
- **10,000 commands/day** (free)
- **256 MB storage** (free)
- Perfect for development and small production workloads

### Upstash Paid Tiers:
- **Pay as you go**: $0.20 per 100K commands
- **Unlimited**: $10/month (unlimited commands, 1GB storage)

**For DealershipAI**: Free tier should handle ~100-500 background jobs/day easily.

---

## Troubleshooting

### Issue: "Job worker not initialized"

**Solution**: Check that environment variables are set:
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

### Issue: "Connection refused"

**Solution**: 
1. Verify REST URL is correct (should start with `https://`)
2. Verify REST Token is correct (should start with `AX`)
3. Check database is active in Upstash console

### Issue: "Rate limit exceeded"

**Solution**: 
- Free tier: 10K commands/day
- Upgrade to paid tier or optimize job frequency

---

## Next Steps

Once Redis is configured:

1. ✅ **Worker automatically starts** (via `instrumentation.ts`)
2. ✅ **Queue jobs** from API routes or client
3. ✅ **Monitor queue** via `/api/jobs/queue` endpoint
4. ✅ **Add more job types** in `lib/jobs/`

---

## Example: Queue AI Score Calculation

```typescript
// In your API route
import { JobType } from '@/lib/job-queue';
import { addJob } from '@/lib/job-queue';

export async function POST(req: Request) {
  // ... your logic ...
  
  // Queue background job
  const jobId = await addJob({
    type: JobType.PROCESS_DATA,
    payload: {
      jobType: 'ai-score-calculation',
      domain: 'www.dealership.com',
      tenantId: 'tenant-123',
      userId: 'user-456',
    },
    priority: 0, // Higher priority = processed first
    attempts: 3, // Retry 3 times on failure
  });
  
  return NextResponse.json({ jobId, status: 'queued' });
}
```

---

## Security Notes

1. **Never commit** Redis credentials to git
2. **Use environment variables** only
3. **Rotate tokens** periodically
4. **Restrict access** to Redis database (Upstash allows IP whitelisting)

---

**Ready!** Once you've added the environment variables to Vercel and redeployed, background jobs will be active! 🚀

