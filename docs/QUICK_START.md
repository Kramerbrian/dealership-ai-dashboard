# 🚀 Quick Start - Connect Real Data & AI Features

## Step 1: Add Anthropic API Key

Add to `.env.local` (create if it doesn't exist):

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Get your key:** [console.anthropic.com](https://console.anthropic.com)

## Step 2: Restart Dev Server

```bash
npm run dev
```

## Step 3: Test the Dashboard

Visit: **http://localhost:3000/example-dashboard**

### What to Expect:

**Without API Key:**
- ✅ Dashboard loads with real/mock data
- ✅ AI Copilot shows rule-based insights
- ✅ Easter Eggs are static

**With API Key:**
- ✅ Dashboard loads with real data
- ✅ AI Copilot shows AI-generated insights (Pro/Enterprise tier)
- ✅ Dynamic Easter Eggs appear (Pro/Enterprise tier)

## Step 4: Test API Routes

```bash
# Test dashboard data
curl http://localhost:3000/api/example-dashboard/data?dealerId=demo

# Test AI Copilot (requires ANTHROPIC_API_KEY)
curl -X POST http://localhost:3000/api/ai/copilot-insights \
  -H "Content-Type: application/json" \
  -d '{
    "trustScore": 78,
    "scoreDelta": 5,
    "pillars": {"seo": 85, "aeo": 72, "geo": 90, "qai": 65},
    "criticalIssues": 2,
    "recentActivity": ["Schema fixed"]
  }'

# Test Easter Egg (requires ANTHROPIC_API_KEY)
curl -X POST http://localhost:3000/api/ai/easter-egg \
  -H "Content-Type: application/json" \
  -d '{
    "trustScore": 88,
    "dealershipName": "Test Dealership",
    "currentTime": "2025-01-02T12:00:00Z",
    "trigger": "score-88"
  }'
```

## Features Status

| Feature | Status | Requires API Key |
|---------|--------|------------------|
| Dashboard Data | ✅ Working | ❌ No |
| AI Copilot (Pro+) | ✅ Working | ✅ Yes |
| Easter Eggs (Pro+) | ✅ Working | ✅ Yes |
| Competitor Radar | ✅ Working | ❌ No |
| Anomaly Detection | ✅ Working | ❌ No |
| Achievements | ✅ Working | ❌ No |

## Troubleshooting

**Server not running?**
```bash
npm run dev
```

**API key not working?**
- Check `.env.local` has `ANTHROPIC_API_KEY` (no `NEXT_PUBLIC_` prefix)
- Restart server after adding key
- Verify key at console.anthropic.com

**Components not showing?**
- Check browser console for errors
- Verify user tier is `'pro'` or `'enterprise'` for AI features
- Check network tab for API calls

---

**Ready!** Your dashboard is now connected to real data sources and ready for AI features! 🎉

