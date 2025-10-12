# ATI Quick Reference

## One-Page Guide to Algorithmic Trust Index

---

## 🎯 What is ATI?

**ATI = Algorithmic Trust Index**
A composite score (0-100) measuring how much AI systems trust your dealership's online presence.

```
Higher ATI = Better AI visibility + Higher search rankings + More customer confidence
```

---

## 🏛️ Five Pillars (What Gets Measured)

| Pillar | Weight | What It Measures | Quick Fix |
|--------|--------|------------------|-----------|
| **Precision** | 30% | Data accuracy (NAP, hours, services) | Audit all platforms for consistency |
| **Consistency** | 25% | Cross-channel parity (Google vs. website) | Standardize NAP format everywhere |
| **Recency** | 20% | Freshness (last update, content frequency) | Publish weekly content |
| **Authenticity** | 15% | Review/backlink credibility | Earn verified reviews, quality backlinks |
| **Alignment** | 10% | Search intent matching | Optimize content for target queries |

---

## 📊 Formula

```typescript
ATI = (
  Precision × 0.30 +
  Consistency × 0.25 +
  Recency × 0.20 +
  Authenticity × 0.15 +
  Alignment × 0.10
)
```

**Example**:
```
Precision:    92%  (92 × 0.30 = 27.6)
Consistency:  88%  (88 × 0.25 = 22.0)
Recency:      75%  (75 × 0.20 = 15.0)
Authenticity: 85%  (85 × 0.15 = 12.75)
Alignment:    90%  (90 × 0.10 = 9.0)
                    ─────────────────
                    ATI = 86.35%
```

---

## 📈 Grading Scale

| Score | Grade | Action |
|-------|-------|--------|
| 90-100 | ✅ Excellent | Maintain consistency, monitor for drift |
| 75-89 | 🟢 Good | Minor improvements, focus on weakest pillar |
| 60-74 | 🟡 Fair | Urgent action needed, impacting visibility |
| 0-59 | 🔴 Poor | Critical, Sentinel should trigger SOW |

---

## 🤖 CRS (Composite Reputation Score)

**CRS** = Bayesian fusion of AIV + ATI

```typescript
CRS = (AIV × 0.6) + (ATI × 0.4)
```

**Why?**
- AIV = Visibility (are you showing up?)
- ATI = Trust (do algorithms believe you?)
- CRS = Reputation (visibility + trust)

---

## 🏗️ Architecture

### Database Table
```sql
ati_signals (
  tenant_id,
  date_week,
  precision_pct,      -- 30% weight
  consistency_pct,    -- 25% weight
  recency_pct,        -- 20% weight
  authenticity_pct,   -- 15% weight
  alignment_pct,      -- 10% weight
  ati_pct            -- Calculated automatically
)
```

### API Endpoint
```bash
GET /api/tenants/{tenantId}/ati/latest

Response:
{
  "data": {
    "date_week": "2025-01-13",
    "ati_pct": 87.4,
    "precision_pct": 92.0,
    ...
  }
}
```

### Cron Job
```bash
POST /api/cron/ati-analysis
Schedule: Every Monday at 6 AM (0 6 * * 1)
```

---

## 🚀 Deployment

```bash
# 1. Apply migration
psql "postgresql://postgres.[PROJECT].supabase.co:6543/postgres" \
  -f supabase/migrations/20250115000005_ati_signals.sql

# 2. Deploy
vercel --prod

# 3. Test
curl "https://yourdomain.com/api/tenants/$TENANT_ID/ati/latest"

# 4. Trigger cron manually
curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

---

## 📊 Dashboard Display

```tsx
<HeaderTiles tenantId={tenantId}>
  // Shows:
  AIV: 82.3 / 100  (visibility)
  ATI: 87.4 / 100  (trust) ← NEW
  CRS: 84.1 / 100  (reputation = AIV + ATI)
  Elasticity: $1,250 per +1 AIV pt
</HeaderTiles>
```

---

## 🎯 How to Improve ATI

### Precision (30%)
- Audit NAP across 50+ platforms
- Verify business hours accuracy
- Update outdated information

### Consistency (25%)
- Standardize NAP format everywhere
- Sync schema markup with GBP
- Update all platforms simultaneously

### Recency (20%)
- Publish weekly blog posts
- Update GBP daily
- Respond to reviews within 24h
- Keep inventory fresh (<7 days)

### Authenticity (15%)
- Earn verified reviews (no fakes)
- Build quality backlinks (DA >40)
- Maintain citation consistency

### Alignment (10%)
- Optimize content for target queries
- Improve task completion rates
- Reduce bounce rate

---

## 📈 Success Metrics

**Technical**:
- ATI calculation: <10s per tenant
- API response: <200ms
- Data freshness: Weekly (Monday 6 AM)

**Business**:
- Improvement rate: +2-5 points/month
- Correlation with rankings: R² >0.65
- Conversion lift: +10% for ATI >85

---

## 🔮 Future Phases

**Phase 1**: Visualization (Q1 2025)
- ATI trend charts
- Pillar breakdown radar
- Competitor comparison

**Phase 2**: Autonomous Actions (Q2 2025)
- Sentinel triggers for ATI <60
- Auto-generate SOWs
- Automated NAP sync

**Phase 3**: Predictive ATI (Q3 2025)
- Forecast ATI trends
- Simulate improvement impact
- Market benchmarks

---

## 📚 Files Created

- `supabase/migrations/20250115000005_ati_signals.sql` - Database schema
- `app/api/tenants/[tenantId]/ati/latest/route.ts` - Fetch endpoint
- `app/api/cron/ati-analysis/route.ts` - Weekly calculation
- `lib/ati-calculator.ts` - Calculation logic
- `lib/constants.ts` - Weights and thresholds
- `lib/labels.ts` - KPI labels
- `src/components/ui/MetricInfo.tsx` - Metric display
- `app/(dash)/components/HeaderTiles.tsx` - Dashboard tiles
- `vercel.json` - Cron job config (updated)

---

## 💡 Key Insight

**ATI measures what AI algorithms actually care about:**

1. **Precision**: Is your data correct?
2. **Consistency**: Is it the same everywhere?
3. **Recency**: Is it fresh?
4. **Authenticity**: Is it credible?
5. **Alignment**: Does it match what people search for?

**Get these right, and AI systems will trust you. Get them wrong, and you're invisible.**

---

*ATI: Because AI algorithms trust data, not promises.*

*DealershipAI v5.0 - Command Center*
*January 2025*
