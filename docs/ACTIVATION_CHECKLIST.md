# Dashboard Activation Checklist

## ⚡ Quick Activation (15-30 minutes) - Demo-Ready

### 1. Environment Variables (Vercel)
```bash
# Required for basic functionality
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (for persistence)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJ...

# Upstash Redis (for caching & idempotency)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Public URL
PUBLIC_BASE_URL=https://dash.dealershipai.com
# OR
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
```

**Time: 5 minutes** - Copy from existing services or create new

---

### 2. Run Supabase Migrations
```bash
# If using Supabase CLI locally
supabase migration up

# OR apply via Supabase Dashboard SQL Editor:
# - supabase/migrations/20251108_integrations_reviews_visibility.sql
# - supabase/migrations/20251109_fix_receipts.sql
```

**Time: 2 minutes**

---

### 3. Clerk Dashboard Configuration
1. Go to https://dashboard.clerk.com
2. Add your domain to **Allowed Origins**
3. Add redirect URLs:
   - `https://dash.dealershipai.com/dashboard`
   - `https://dash.dealershipai.com/sign-in`
   - `https://dash.dealershipai.com/sign-up`

**Time: 3 minutes**

---

### 4. Deploy to Vercel
```bash
vercel --prod
```

**Time: 5 minutes**

---

### 5. Test Core Flow
- ✅ Sign up → Dashboard
- ✅ View pulses (mock data works)
- ✅ Click "Apply Fix" → Receipt appears
- ✅ AIV hovercard shows sparkline

**Time: 5 minutes**

---

## 🚀 Production Activation (1-2 hours) - Full Features

### Additional Setup

#### 6. QStash Configuration (for async fixes)
```bash
# Get from Upstash Dashboard
QSTASH_TOKEN=eyJhbGciOiJ...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
```

**Time: 5 minutes**

---

#### 7. Real Data Sources (replace mocks)

**Option A: Keep Mocks (Demo Mode)**
- ✅ Works immediately
- ✅ Shows full UI/UX
- ✅ Good for demos and testing

**Option B: Wire Real APIs**
- Google Business Profile API (for reviews)
- Visibility engine APIs (ChatGPT, Perplexity, Gemini, Copilot)
- GA4 Data API (for traffic)
- Schema validation service

**Time: 30-60 minutes per integration**

---

#### 8. Optional: Slack Alerts
```bash
TELEMETRY_WEBHOOK=https://hooks.slack.com/services/...
```

**Time: 2 minutes**

---

## 📋 Current Status

### ✅ Ready to Deploy
- [x] Authentication (Clerk)
- [x] Fix APIs (idempotent, undo, async)
- [x] Receipt polling
- [x] Impact Ledger
- [x] AIV sparkline trends
- [x] Core UI components
- [x] Supabase persistence structure

### 🔄 Using Mock Data (Works for Demo)
- [x] Pulse feed (synthetic)
- [x] Visibility presence (synthetic)
- [x] Reviews summary (synthetic)
- [x] GA4 summary (synthetic)
- [x] AIV history (synthetic)

### ⚠️ Needs Real Implementation
- [ ] Replace synthetic data with real API calls
- [ ] Add actual fix execution logic (schema injection, etc.)
- [ ] Wire real visibility engine presence checks
- [ ] Connect to actual GBP reviews API

---

## 🎯 Activation Paths

### Path 1: Demo-Ready (15-30 min)
1. Set env vars in Vercel
2. Run Supabase migrations
3. Configure Clerk
4. Deploy
5. **Result**: Fully functional dashboard with mock data

### Path 2: Production-Ready (1-2 hours)
1. Everything from Path 1
2. Add QStash tokens
3. Wire real data sources (or keep mocks)
4. Test end-to-end flows
5. **Result**: Production dashboard with real data

---

## 🧪 Quick Test Commands

```bash
# Health check
curl https://dash.dealershipai.com/api/health

# Test visibility (requires auth)
curl -H "Cookie: __session=..." \
  https://dash.dealershipai.com/api/visibility/presence?domain=example.com

# Test fix apply (requires auth + Idempotency-Key)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"pulseId":"test","tier":"apply","projectedDeltaUSD":1000}' \
  https://dash.dealershipai.com/api/fix/apply
```

---

## 💡 Pro Tips

1. **Start with mocks** - The UI is fully functional with synthetic data
2. **Iterate on real data** - Add real APIs one at a time
3. **Use Vercel previews** - Test each integration before production
4. **Monitor health endpoint** - `/api/health` shows service status

---

**Bottom Line**: You can have a **demo-ready dashboard live in 15-30 minutes**. Production-ready with real data takes 1-2 hours depending on API integrations.

