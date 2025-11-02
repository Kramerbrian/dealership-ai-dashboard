# Anthropic API Key Configuration Guide

## Overview

The DealershipAI dashboard uses Anthropic's Claude API for:
- **AI Copilot**: Proactive, contextual recommendations
- **Dynamic Easter Eggs**: Witty, AI-generated contextual messages

## Quick Setup

### 1. Get Your Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **API Keys**
3. Click **Create Key**
4. Copy your API key (starts with `sk-ant-`)

### 2. Add to Environment Variables

#### Local Development (`.env.local`)

```bash
# Anthropic API Key for AI features (server-side only)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important:** This is a server-side variable (no `NEXT_PUBLIC_` prefix), so it's never exposed to the browser.

#### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development (check all)

## How It Works

### Architecture

```
┌─────────────────┐
│  Client (Browser)│
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────────────┐
│  API Route (Server)      │
│  /api/ai/copilot-insights│
│  /api/ai/easter-egg      │
└────────┬─────────────────┘
         │
         │ Uses ANTHROPIC_API_KEY
         │ (server-side only)
         ▼
┌─────────────────┐
│  Anthropic API  │
│  (Claude)       │
└─────────────────┘
```

### Security

- ✅ API key is **never exposed** to the browser
- ✅ All API calls go through Next.js API routes
- ✅ Key is stored in environment variables
- ✅ Works with `free`, `pro`, and `enterprise` tiers (with tier gating)

## Tier-Based Features

### Free Tier
- **AI Copilot**: Rule-based fallback insights
- **Easter Eggs**: Static messages only

### Pro/Enterprise Tier
- **AI Copilot**: AI-generated contextual insights
- **Easter Eggs**: Dynamic, AI-generated witty messages

The tier gating happens in the components themselves, so Free tier users still see the UI but get rule-based content.

## API Routes Created

### 1. `/api/ai/copilot-insights`
- **Method**: POST
- **Body**: Dashboard state object
- **Returns**: Array of insights with priority, title, description, action
- **Fallback**: Rule-based insights if API key not configured

### 2. `/api/ai/easter-egg`
- **Method**: POST
- **Body**: Context object with trigger
- **Returns**: Single witty one-liner
- **Fallback**: Static Easter eggs if API key not configured

## Testing

### Test Without API Key
The dashboard will work with rule-based fallbacks:
```bash
# Remove or comment out ANTHROPIC_API_KEY
# Dashboard still works, just with static content
```

### Test With API Key
1. Add `ANTHROPIC_API_KEY` to `.env.local`
2. Restart dev server: `npm run dev`
3. Visit `/example-dashboard`
4. Check browser console for API calls
5. Verify Pro/Enterprise users see AI-generated content

### Test API Routes Directly

```bash
# Test AI Copilot
curl -X POST http://localhost:3000/api/ai/copilot-insights \
  -H "Content-Type: application/json" \
  -d '{
    "trustScore": 78,
    "scoreDelta": 5,
    "pillars": {"seo": 85, "aeo": 72, "geo": 90, "qai": 65},
    "criticalIssues": 2,
    "recentActivity": ["Schema fixed"]
  }'

# Test Easter Egg
curl -X POST http://localhost:3000/api/ai/easter-egg \
  -H "Content-Type: application/json" \
  -d '{
    "trustScore": 88,
    "dealershipName": "Test Dealership",
    "currentTime": "2025-01-02T12:00:00Z",
    "trigger": "score-88"
  }'
```

## Troubleshooting

### "API key not configured" warnings
- ✅ Check `.env.local` exists
- ✅ Verify `ANTHROPIC_API_KEY` is set (no `NEXT_PUBLIC_` prefix)
- ✅ Restart dev server after adding key
- ✅ Check for typos in variable name

### API calls failing
- ✅ Verify API key is valid (test at console.anthropic.com)
- ✅ Check API key has credits/quota
- ✅ Check network connectivity
- ✅ Review server logs for errors

### Free tier seeing AI content
- ✅ Verify `userTier` prop is correctly passed
- ✅ Check component tier gating logic
- ✅ Ensure tier check happens before API call

## Cost Management

### Estimated Costs
- **Easter Eggs**: ~$0.001 per generation (150 tokens)
- **Copilot Insights**: ~$0.002 per generation (500 tokens)
- **Daily cost**: ~$0.10-0.50 for 50-250 generations

### Optimization Tips
1. **Cooldown system**: Easter eggs have 30-second cooldown
2. **Caching**: Insights refresh every 5 minutes (configurable)
3. **Tier gating**: Only Pro/Enterprise use AI (reduces calls)
4. **Fallbacks**: Rule-based content when API unavailable

## Next Steps

1. ✅ Add `ANTHROPIC_API_KEY` to `.env.local`
2. ✅ Restart dev server
3. ✅ Test on `/example-dashboard` with Pro tier
4. ✅ Verify AI Copilot shows AI-generated insights
5. ✅ Verify Easter Eggs show dynamic messages
6. ✅ Add to production environment variables

---

**Need Help?** Check the component files:
- `app/components/dashboard/AICopilot.tsx`
- `app/components/dashboard/DynamicEasterEggEngine.tsx`
- `app/api/ai/copilot-insights/route.ts`
- `app/api/ai/easter-egg/route.ts`

