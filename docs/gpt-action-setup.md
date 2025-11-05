# GPT Action Setup Guide

This guide explains how to configure the DealershipAI Orchestrator snapshot endpoint for ChatGPT GPT Actions.

## Overview

The orchestrator snapshot endpoint provides a unified, pull-based API that GPTs can call to get real-time updates about:
- Pulse radar data (dealers, intents, fixes)
- MSRP sync status and recent changes
- System diagnostics (freshness, business identity match)
- Graph state summary

## Setup Steps

### 1. Deploy the Snapshot Endpoint

The endpoint is available at `/api/orchestrator/snapshot`. Ensure it's publicly accessible:

```bash
# Test locally
curl http://localhost:3000/api/orchestrator/snapshot

# Test production
curl https://YOUR_DASH_DOMAIN/api/orchestrator/snapshot
```

### 2. Configure API Key (Optional)

If you want to secure the endpoint, set `PULSE_API_KEY` in your environment:

```bash
# .env.local or Vercel environment variables
PULSE_API_KEY=your-secret-key-here
```

The GPT Action will need to include this key in the `x-pulse-key` header.

### 3. Set Up OpenAPI Spec

1. Update `openapi/orchestrator.yaml`:
   - Replace `YOUR_DASH_DOMAIN` with your actual domain
   - Adjust the server URLs as needed

2. Host the OpenAPI spec:
   - Option A: Serve it from your Next.js app at `/openapi/orchestrator.yaml`
   - Option B: Host it on GitHub Pages or a CDN
   - Option C: Use the raw GitHub URL if in a public repo

### 4. Add Action to GPT Builder

1. Go to [ChatGPT GPT Builder](https://chat.openai.com/gpts)
2. Create or edit your GPT
3. Click "Add Actions" → "Import from URL"
4. Paste your OpenAPI URL (e.g., `https://YOUR_DASH_DOMAIN/openapi/orchestrator.yaml`)
5. Configure authentication:
   - Select "API Key"
   - Header name: `x-pulse-key`
   - Value: Your `PULSE_API_KEY` (or leave empty if not using auth)

### 5. Configure GPT Instructions

Add this to your GPT's instructions:

```
When the user asks for "update", "latest pulse", "MSRP sync", or "diagnostics", call getSnapshot first.

If getSnapshot returns HTTP 304 (Not Modified), respond: "No changes since last snapshot (ETag match)".

Otherwise, present the new AppraiseSDKResponse JSON and a one-line summary:
- Pulse actions: {pulse.actions.length} actions
- MSRP sync: {msrpSync.status}, {msrpSync.count} changes
- Diagnostics: {diagnostics.status}, last run {diagnostics.msrpSync.lastRun}

Always include the structured JSON in the assistant's tool result for transparency.
```

### 6. Test the Integration

1. Start a conversation with your GPT
2. Ask: "What's the latest orchestrator status?"
3. The GPT should call `getSnapshot` and display the results

## ETag Caching

The endpoint supports ETag-based caching for efficient polling:

- First request: Returns `200 OK` with snapshot and `ETag` header
- Subsequent requests: Include `If-None-Match: <etag>` header
- If unchanged: Returns `304 Not Modified` (saves bandwidth)
- If changed: Returns `200 OK` with new snapshot and new `ETag`

Example:

```bash
# First request
curl -v https://YOUR_DASH/api/orchestrator/snapshot

# Response includes ETag: "abc123..."

# Second request (with ETag)
curl -v -H "If-None-Match: \"abc123...\"" https://YOUR_DASH/api/orchestrator/snapshot

# If unchanged: 304 Not Modified
# If changed: 200 OK with new data
```

## Rate Limiting

The endpoint is rate-limited by default (configured in `createApiRoute`). For GPT Actions:
- Recommended: 60 requests per minute per API key
- Adjust in `lib/api-wrapper.ts` if needed

## CDN Publishing (Optional)

For production, you can publish snapshots to a CDN:

```bash
#!/bin/bash
# scripts/publish-snapshot.sh

DASH_URL="https://YOUR_DASH_DOMAIN"
S3_BUCKET="appraise-cdn"
S3_PATH="snapshots"

# Fetch snapshot
LAST_ETAG=$(cat /tmp/last_etag.txt 2>/dev/null || echo "")
curl -s -H "If-None-Match: $LAST_ETAG" \
  "$DASH_URL/api/orchestrator/snapshot" \
  -o /tmp/snap.json \
  -w "%{http_code}\n%{header_etag}\n" > /tmp/response.txt

HTTP_CODE=$(head -n1 /tmp/response.txt)
ETAG=$(tail -n1 /tmp/response.txt)

if [ "$HTTP_CODE" = "200" ]; then
  # Upload to S3
  TIMESTAMP=$(date +%s)
  aws s3 cp /tmp/snap.json \
    "s3://$S3_BUCKET/$S3_PATH/${TIMESTAMP}.json" \
    --cache-control "max-age=31536000,immutable"
  
  aws s3 cp /tmp/snap.json \
    "s3://$S3_BUCKET/$S3_PATH/latest.json" \
    --cache-control "max-age=60"
  
  echo "$ETAG" > /tmp/last_etag.txt
  echo "Published snapshot at $TIMESTAMP"
elif [ "$HTTP_CODE" = "304" ]; then
  echo "No changes (304 Not Modified)"
fi
```

Schedule this script to run every 1-5 minutes via cron or GitHub Actions.

## Validation Checklist

- [ ] Public HTTPS endpoint reachable by ChatGPT (no VPN required)
- [ ] OpenAPI spec loads in GPT Builder
- [ ] `getSnapshot` action test passes in GPT Builder
- [ ] `x-pulse-key` configured (if using auth)
- [ ] ETag header observed (test with `If-None-Match`)
- [ ] 304 response works when content unchanged
- [ ] Rate limiting configured appropriately
- [ ] CDN publishing set up (optional)

## Troubleshooting

### GPT can't reach endpoint
- Check firewall/VPN settings
- Ensure endpoint is publicly accessible
- Verify HTTPS is working (not HTTP-only)

### 401 Unauthorized
- Check `PULSE_API_KEY` is set correctly
- Verify GPT Action has correct API key in header
- Check API key matches between environment and GPT config

### 304 Not Modified not working
- Verify `If-None-Match` header is being sent
- Check ETag format (should be quoted string)
- Ensure ETag generation is deterministic

### Rate limiting issues
- Adjust rate limit in `lib/api-wrapper.ts`
- Consider using separate API keys for different GPTs
- Monitor rate limit headers in responses

## Next Steps

- Add more endpoints (e.g., `/api/pulse/latest`, `/api/price-changes`)
- Implement HMAC signature verification for stronger auth
- Add webhook notifications for critical changes
- Set up monitoring and alerting for snapshot health

