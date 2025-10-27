# 🔴 Upstash Redis Setup Guide

## Step 1: Create Upstash Account
1. Go to [upstash.com](https://upstash.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Login to Upstash CLI
```bash
npx @upstash/cli auth login
```

## Step 3: Create Redis Database
```bash
# List available regions
npx @upstash/cli redis list-regions

# Create a new Redis database
npx @upstash/cli redis create --name dealershipai-redis --region us-east-1
```

## Step 4: Get Connection Details
```bash
# List your Redis databases
npx @upstash/cli redis list

# Get connection details for your database
npx @upstash/cli redis get [database-id]
```

## Step 5: Update Vercel Environment Variables
Once you have your Redis database, update the environment variables in Vercel:

```bash
# Update Redis URL
npx vercel env rm UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_URL production

# Update Redis token
npx vercel env rm UPSTASH_REDIS_REST_TOKEN production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
```

## Step 6: Test Redis Connection
```bash
# Test Redis connection
npx @upstash/cli redis connect [database-id]
```

## Alternative: Manual Setup
If you prefer to set up through the web interface:

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. Update Vercel environment variables

## Redis CLI Commands
```bash
# Connect to Redis
npx @upstash/cli redis connect [database-id]

# Run Redis commands
redis> SET test "Hello World"
redis> GET test
redis> KEYS *
redis> FLUSHDB
```

## Production Redis Setup
For production, consider:
- **Region:** Choose closest to your users
- **TLS:** Enable for security
- **Backup:** Enable automatic backups
- **Monitoring:** Set up alerts

## Free Tier Limits
- **10,000 requests/day**
- **256MB storage**
- **1 database**
- **7 days retention**

Perfect for development and small production deployments!
