# 🚀 RaR Quick Start - 5 Minutes

## 1. Run Migration

```bash
npx prisma migrate dev -n add_rar_models
npx prisma generate
```

## 2. Set Environment Variables (Vercel)

Go to **Vercel Dashboard → Project `prj_n5a2az9ZjfIyAtv6izWeSb5vvVQH` → Settings → Environment Variables**:

```
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
SLACK_WEBHOOK_RAR=https://hooks.slack.com/services/YOUR/WEBHOOK
NEXT_PUBLIC_RAR_ENABLED=true
```

## 3. Test Ingest

```bash
curl -X POST https://dash.dealershipai.com/api/rar/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ClerkToken>" \
  -d '{
    "dealerId": "germain-toyota-naples",
    "month": "2025-11-01",
    "channel": "google_organic",
    "impressions": 300000,
    "shareAISnippet": 0.35,
    "ctrBaseline": 0.055,
    "ctrDropWhenAI": 0.35,
    "leadCR": 0.04,
    "closeRate": 0.18,
    "avgGross": 2100,
    "recoverableShare": 0.45,
    "intentCluster": "service_price"
  }'
```

## 4. Check Summary

```bash
curl "https://dash.dealershipai.com/api/rar/summary?dealerId=germain-toyota-naples" \
  -H "Authorization: Bearer <ClerkToken>"
```

## 5. View in Dashboard

The RaRCard is already added to `/intelligence`. Visit:
https://dash.dealershipai.com/intelligence

---

**✅ Done!** RaR is now tracking and displaying Revenue at Risk.

See `RAR_EXECUTE_NOW.md` for full integration guide.

