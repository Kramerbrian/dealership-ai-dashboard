# Zero-Click Rate (ZCR) System Setup

## ✅ Complete Implementation Delivered

All components have been created for the Zero-Click Rate tracking system:

### 📊 Database Schema
- `prisma/schema.prisma` - ZeroClickDaily and CtrBaseline models
- Ready for migration once DATABASE_URL is configured

### 🔧 Core Utilities
- `lib/zero-click/math.ts` - ZCR, ZCCO, AIRI calculations
- `lib/zero-click/fetchers.ts` - Stub functions for GSC, GBP, GA4 APIs

### 🌐 API Routes
- `app/api/zero-click/recompute/route.ts` - Daily computation endpoint
- `app/api/zero-click/summary/route.ts` - Time series data endpoint

### 🎨 React Components
- `components/zero-click/ZeroClickCard.tsx` - ZCR visualization
- `components/zero-click/AiriCard.tsx` - AIRI visualization
- `components/zero-click/modals/WhereDidClicksGo.tsx` - ZCR explainer modal
- `components/zero-click/modals/AiriExplainer.tsx` - AIRI explainer modal

### 📈 Charts Installed
- `recharts` package installed for data visualization

---

## ✅ Database Setup Complete!

The Zero-Click Rate models have been successfully added to your database:

### Models Created:
- ✅ `ZeroClickDaily` - Daily ZCR metrics and AI replacement tracking
- ✅ `CtrBaseline` - CTR baselines for cohort comparison
- ✅ Migration applied: `20251027011417_add_zero_click_models`

### What's Done:
```bash
# Prisma models added to schema.prisma
# Migration created and applied
# Prisma client generated
```

### For Production (Supabase/PostgreSQL):
If you're using PostgreSQL, you'll need to:
1. Configure DATABASE_URL in Vercel environment
2. Run the same migration on your production database
3. The Supabase CLI can be used to manage this (when available)

### 2. Environment Variables
Add to Vercel environment:
- `DATABASE_URL` - PostgreSQL connection string

### 3. Add Vercel Cron (vercel.json)
```json
{
  "crons": [
    { "path": "/api/zero-click/recompute", "schedule": "15 2 * * *" }
  ]
}
```

### 4. Wire Into Dashboard
Add to your dashboard page:
```tsx
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';

<div className="grid gap-6 md:grid-cols-2">
  <ZeroClickCard tenantId={tenantId} />
  <AiriCard tenantId={tenantId} />
</div>
```

### 5. Replace Stub Functions
Update `lib/zero-click/fetchers.ts` with real API clients:
- Google Search Console API
- Google Business Profile API
- GA4 API
- Your AI presence tracking system

---

## 🎯 Next Steps

1. **Configure Real APIs**: Replace stub functions in `fetchers.ts`
2. **Seed Baselines**: Run baseline CTR data for your tenants
3. **Deploy**: Add to existing dashboard grid
4. **Monitor**: Track Zero-Click trends and AI displacement

---

## 📊 Expected Metrics

- **ZCR**: Percentage of impressions that didn't click
- **ZCCO**: Google Business Profile save-rate offset
- **AIRI**: AI replacement impact on traffic
- **Adjusted ZCR**: Net exposure gap (ZCR - ZCCO)

This system will track how much traffic AI answers are displacing from your dealership's search results.

