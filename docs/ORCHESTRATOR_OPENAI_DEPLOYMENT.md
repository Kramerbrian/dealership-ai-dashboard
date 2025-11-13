# OpenAI Orchestrator Agent Integration - Deployment Guide

**Status**: ✅ Ready for Deployment  
**Date**: January 31, 2025

---

## Overview

The OpenAI Orchestrator Agent Integration enables DealershipAI to use OpenAI's GPT-4o model directly for AI-powered analysis and recommendations. This replaces mock responses with real AI-generated insights.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              DealershipAI Dashboard                      │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   HAL Chat   │────────▶│  GPT Bridge  │            │
│  │  Interface   │         │              │            │
│  └──────────────┘         └──────┬───────┘            │
│                                  │                      │
└──────────────────────────────────┼──────────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   OpenAI API    │
                          │   (GPT-4o)      │
                          └─────────────────┘
```

---

## Features

### 1. **Direct OpenAI Integration**
- Uses GPT-4o model (configurable via `OPENAI_MODEL`)
- Server-side only (protects API key)
- Automatic fallback to mock responses if API unavailable

### 2. **Action-Based Routing**
Supports 5 core actions:
- `analyze_visibility` - AI visibility analysis
- `compute_qai` - Quality Authority Index calculation
- `calculate_oci` - Opportunity Cost of Inaction
- `generate_asr` - Autonomous Strategy Recommendations
- `analyze_ugc` - User-Generated Content sentiment

### 3. **Intelligent Prompting**
- Context-aware system prompts
- Dealer-specific analysis
- Domain-aware recommendations
- Business impact focus

---

## Deployment Steps

### Step 1: Set OpenAI API Key

**Local Development:**
```bash
# Add to .env.local
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o  # Optional, defaults to gpt-4o
```

**Vercel Production:**
```bash
# Using Vercel CLI
vercel env add OPENAI_API_KEY production
# Paste your key when prompted

vercel env add OPENAI_MODEL production
# Enter: gpt-4o
```

**Or use the deployment script:**
```bash
export OPENAI_API_KEY=sk-your-key
./scripts/deploy-orchestrator-openai.sh
```

### Step 2: Verify Configuration

```bash
# Test OpenAI connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Should return 200 OK
```

### Step 3: Test Orchestrator API

```bash
# Local test
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-session" \
  -d '{
    "action": "analyze_visibility",
    "dealerId": "test-dealer-123",
    "domain": "example-dealership.com"
  }'
```

### Step 4: Deploy to Production

```bash
# Deploy to Vercel
vercel --prod

# Or let the script handle it
./scripts/deploy-orchestrator-openai.sh
```

---

## API Usage

### POST /api/orchestrator

**Request:**
```json
{
  "action": "analyze_visibility",
  "dealerId": "dealer-123",
  "domain": "dealership.com",
  "context": {
    "recentActivity": ["scan", "audit"],
    "currentPage": "/dashboard"
  },
  "parameters": {
    "platforms": ["chatgpt", "perplexity"]
  }
}
```

**Response:**
```json
{
  "content": "Your dealership shows up in AI search tools 87.3% of the time...",
  "confidence": 0.92,
  "traceId": "openai_1706745600000_abc123",
  "toolsUsed": ["openai-gpt-4o"],
  "evidence": []
}
```

### GET /api/orchestrator/v3/status

Returns orchestrator status and capabilities.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | - | OpenAI API key (starts with `sk-`) |
| `OPENAI_MODEL` | ❌ No | `gpt-4o` | OpenAI model to use |
| `ORCHESTRATOR_API` | ❌ No | - | External orchestrator service URL (optional) |
| `ORCHESTRATOR_TOKEN` | ❌ No | - | External orchestrator auth token (optional) |

---

## Fallback Behavior

The orchestrator uses a three-tier fallback strategy:

1. **External Orchestrator Service** (if `ORCHESTRATOR_API` set)
   - Calls external service first
   - Highest priority if configured

2. **OpenAI API Direct** (if `OPENAI_API_KEY` set)
   - Uses GPT-4o for real-time analysis
   - Server-side only (protects API key)

3. **Mock Responses** (fallback)
   - Pre-defined responses for testing
   - No API costs
   - Always available

---

## Cost Estimates

**OpenAI API Costs:**
- GPT-4o: ~$0.01-0.03 per request (depending on prompt length)
- Average request: ~500 tokens input, ~500 tokens output
- Estimated monthly cost: $50-150 for 5,000 requests

**Optimization Tips:**
- Cache responses for identical queries
- Use GPT-4o-mini for non-critical requests
- Implement rate limiting

---

## Security Considerations

1. **API Key Protection**
   - ✅ Never exposed to client
   - ✅ Server-side only
   - ✅ Environment variables only

2. **Rate Limiting**
   - Implement per-user rate limits
   - Prevent API abuse
   - Monitor usage

3. **Error Handling**
   - Graceful fallback to mocks
   - No sensitive data in error messages
   - Logging for debugging

---

## Monitoring

### Health Check

```bash
# Check orchestrator health
curl https://api.dealershipai.com/api/orchestrator/v3/status
```

### Usage Tracking

Monitor OpenAI API usage:
- OpenAI Dashboard: https://platform.openai.com/usage
- Set up billing alerts
- Track per-dealer usage

---

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"

**Solution:**
```bash
# Verify key is set
echo $OPENAI_API_KEY

# Add to .env.local
echo "OPENAI_API_KEY=sk-..." >> .env.local

# Restart dev server
npm run dev
```

### Issue: "OpenAI API connection failed"

**Possible Causes:**
1. Invalid API key
2. Insufficient credits
3. Rate limit exceeded
4. Network issues

**Solution:**
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check OpenAI dashboard for credits/errors
```

### Issue: "Orchestrator returns mock responses"

**Check:**
1. Is `OPENAI_API_KEY` set?
2. Is the API route being called server-side?
3. Check server logs for errors

---

## Next Steps

1. **Enhanced Prompting**
   - Fine-tune system prompts
   - Add dealer-specific context
   - Implement few-shot learning

2. **Caching Layer**
   - Cache common queries
   - Reduce API costs
   - Improve response time

3. **Streaming Responses**
   - Real-time token streaming
   - Better UX for long responses
   - Lower perceived latency

4. **Multi-Model Support**
   - GPT-4o for critical analysis
   - GPT-4o-mini for quick queries
   - Claude for comparison

---

## Support

For issues or questions:
- Check logs: `app/api/orchestrator/route.ts`
- Review GPT bridge: `lib/orchestrator/gpt-bridge.ts`
- OpenAI Status: https://status.openai.com

---

**Deployment Status**: ✅ Ready  
**Last Updated**: January 31, 2025

