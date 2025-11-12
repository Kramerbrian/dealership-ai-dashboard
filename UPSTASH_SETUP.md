# ⚡ Upstash Redis Setup Guide

## Why Upstash Redis?

Upstash Redis provides serverless Redis for rate limiting. It's optional but recommended for production.

**Without Upstash:** Rate limiting uses in-memory fallback (resets on server restart)  
**With Upstash:** Persistent rate limiting across deployments

## Quick Setup

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Click **Create Database**
3. Choose:
   - **Name:** `dealershipai-rate-limit` (or your choice)
   - **Type:** Regional (recommended) or Global
   - **Region:** Choose closest to your deployment
4. Click **Create**

### 2. Get Your Credentials

After creating the database:

1. Click on your database
2. Go to **Details** tab
3. Copy:
   - **UPSTASH_REDIS_REST_URL** (REST API endpoint)
   - **UPSTASH_REDIS_REST_TOKEN** (REST API token)

### 3. Add to .env.local

```bash
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## Rate Limits Configured

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Telemetry | 30 requests | 1 minute |
| Public API | 60 requests | 1 minute |
| Strict | 10 requests | 1 minute |

## Testing

Test rate limiting:

```bash
# Make 31 requests quickly (should get rate limited on 31st)
for i in {1..31}; do
  curl -X POST http://localhost:3000/api/telemetry \
    -H "Content-Type: application/json" \
    -d '{"type":"test"}'
  echo ""
done
```

You should see `429 Too Many Requests` on the 31st request.

## Fallback Behavior

If Upstash is not configured:
- Rate limiting still works (in-memory)
- Limits reset on server restart
- Perfect for development
- Not recommended for production

## Troubleshooting

### "Invalid URL"
- Check `UPSTASH_REDIS_REST_URL` format: should be `https://...`
- No trailing slash

### "Unauthorized"
- Verify `UPSTASH_REDIS_REST_TOKEN` is correct
- Token should be the REST API token (not Redis password)

### Rate limiting not working
- Check environment variables are loaded
- Restart dev server after adding env vars
- Check browser console for errors

## Cost

Upstash Free Tier:
- 10,000 commands/day
- Perfect for development and small production deployments

Paid plans start at $0.20/100K commands.
