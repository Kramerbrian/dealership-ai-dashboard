# DealershipAI Part 2 - Setup Guide

## ✅ Files Written

All Part 2 files have been successfully written:

- ✅ `middleware.ts` - Clerk auth middleware
- ✅ `.env.example` - Environment template
- ✅ `configs/dealer_segment_table.json` - Competitor segmentation
- ✅ `configs/onboardingFlow.json` - Onboarding state machine
- ✅ `supabase/migrations/20251107_integrations.sql` - Integrations table
- ✅ `lib/auth/tenant.ts` - Tenant isolation
- ✅ `lib/cache.ts` - Upstash Redis caching
- ✅ `lib/db/supabaseAdmin.ts` - Supabase admin client
- ✅ `lib/integrations/store.ts` - Integration token storage
- ✅ `lib/google/oauth.ts` - Google OAuth refresh
- ✅ `lib/google/ga4.ts` - GA4 Data API client
- ✅ `lib/adapters/schema.ts` - Schema validation adapter
- ✅ `lib/adapters/ga4.ts` - GA4 traffic adapter
- ✅ `lib/adapters/reviews.ts` - Reviews/GBP adapter
- ✅ `lib/adapters/visibility.ts` - AI visibility adapter
- ✅ `lib/p13n/engine.ts` - Personalization + easter eggs
- ✅ `app/api/_utils/withAuth.ts` - Auth wrapper utility
- ✅ `app/drive/page.tsx` - Drive mode dashboard

## 📦 Dependencies

Required packages (already installed):
- ✅ `@supabase/supabase-js` - v2.75.0
- ✅ `@upstash/redis` - v1.35.6
- ⚠️ `@clerk/nextjs` - Need to install v5.0.0

## 🚀 Next Steps

### 1. Install Clerk (if not already installed)
```bash
npm install @clerk/nextjs@^5.0.0
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Then add your keys:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `GA4_PROPERTY_ID`

### 3. Run Supabase Migration
```bash
# If using Supabase CLI
cd supabase
supabase migration up

# Or apply manually via Supabase dashboard
# Copy contents of supabase/migrations/20251107_integrations.sql
```

### 4. Test the Setup
```bash
npm run dev
```

Visit:
- `/drive` - Drive mode dashboard
- `/api/pulse/snapshot?domain=example.com` - Pulse feed (requires auth)

## 🎬 Easter Eggs

The personalization engine triggers automatically:

- **Deep Insight** (>$15K combined impact): *"You mustn't be afraid to dream a little bigger."*
- **Auto-Remediation** (Fix applied): *"Come with me if you want to fix this."*
- **Self-Healing**: *"Hasta la vista, error."*
- **Mission Complete**: *"Are you not entertained?"*
- **Aggressive Pull**: *"I drink your milkshake."*

Rules:
- Context-triggered (not random)
- Max 1 per user per 24h
- Never blocks task completion
- Dry wit, never slapstick

## 🔗 Integration Endpoints

### GA4 OAuth
```
GET /api/oauth/ga4/start
GET /api/oauth/ga4/callback
```

### Admin Integration Setup
```bash
# Set Reviews place_id
POST /api/admin/integrations/reviews
{
  "placeId": "ChIJ..."
}

# Enable visibility engines
POST /api/admin/integrations/visibility
{
  "engines": {
    "ChatGPT": true,
    "Perplexity": true,
    "Gemini": true,
    "Copilot": true
  }
}
```

## 📊 Architecture

### Adapter Pattern
Each adapter (`lib/adapters/*.ts`) converts external data into **Pulses**:
- `id`: Unique identifier
- `title`: Issue name
- `diagnosis`: What's wrong
- `prescription`: How to fix
- `impactMonthlyUSD`: Revenue impact
- `etaSeconds`: Fix time estimate
- `confidenceScore`: 0-1 confidence
- `recencyMinutes`: Data freshness
- `kind`: Category (schema, traffic, reviews, visibility)

### Pulse Snapshot
`/api/pulse/snapshot` merges all adapters:
```typescript
const pulses = await Promise.all([
  schemaToPulses(domain),
  ga4ToPulses(domain),
  reviewsToPulses({ placeId, domain }),
  visibilityToPulses(domain),
]);
```

### Tenant Isolation
All routes use `withAuth()` wrapper:
```typescript
export const GET = withAuth(async ({ req, tenantId }) => {
  // tenantId is guaranteed
  return NextResponse.json({ data });
});
```

## 🐛 Troubleshooting

### Clerk Auth Issues
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Check middleware.ts public routes match your needs

### Supabase Connection
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are correct
- Check RLS policies allow service_role access

### Redis Cache
- If `UPSTASH_REDIS_REST_URL` not set, caching is disabled (graceful fallback)
- Cache functions return direct fetcher results if Redis unavailable

### GA4 OAuth
- Ensure redirect URI matches Google Cloud Console
- Check `GOOGLE_OAUTH_REDIRECT_URI` matches callback URL

## 📝 Notes

- All adapters gracefully handle errors (return empty array)
- Personalization engine uses localStorage for 24h cooldown
- Drive page uses sessionStorage for analyzer cache
- Impact Ledger tracks all applied fixes with undo capability

---

**Version:** 1.4.0-p13n (Part 2 + Personalization)
**Last Updated:** 2025-11-07

