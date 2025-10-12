# ATI (Algorithmic Trust Index) Implementation Guide

## The Five-Pillar Trust Measurement System for DealershipAI Command Center

---

## 🎯 What is ATI?

**ATI (Algorithmic Trust Index)** is a composite score (0-100) that measures how much AI systems and search algorithms **trust** your dealership's online presence.

### Why ATI Matters

- **AI Visibility**: Higher ATI = better rankings in ChatGPT, Perplexity, Google SGE
- **Search Rankings**: Trust signals directly impact SERP positions
- **Customer Confidence**: Trust metrics correlate with conversion rates
- **Competitive Advantage**: ATI gives objective trust measurement vs. competitors

---

## 🏛️ The Five Pillars

### 1. Precision (30% weight)
**What**: Data accuracy across all platforms
**Measures**: Correctness of NAP, hours, services, inventory
**Example**: Is your phone number the same on Google, Yelp, and your website?

**How to Improve**:
- Audit NAP (Name, Address, Phone) across 50+ platforms
- Verify business hours match reality
- Ensure service offerings are current
- Remove outdated information

**Score Calculation**:
```typescript
precision_pct = (correct_fields / total_fields) * 100
```

### 2. Consistency (25% weight)
**What**: Cross-channel parity - do all platforms tell the same story?
**Measures**: Alignment of data across Google, website, social, directories
**Example**: Are your business hours on Google the same as on your website?

**How to Improve**:
- Standardize NAP format across all channels
- Sync schema markup with Google Business Profile
- Maintain consistent branding (logo, description, categories)
- Update all platforms simultaneously when changes occur

**Score Calculation**:
```typescript
consistency_pct = (matching_platforms / total_platforms) * 100
```

### 3. Recency (20% weight)
**What**: Freshness - how up-to-date is your information?
**Measures**: Time since last update, content publishing frequency
**Example**: Was your last blog post this month or 2 years ago?

**How to Improve**:
- Publish content regularly (weekly blog posts)
- Update Google Business Profile posts daily
- Respond to reviews within 24 hours
- Keep inventory listings fresh (<7 days old)

**Score Calculation**:
```typescript
recency_pct = 100 * exp(-decay_rate * days_since_update)
// Exponential decay: 100% if updated today, 90% if 7 days, 50% if 30 days
```

### 4. Authenticity (15% weight)
**What**: Credibility of reviews, backlinks, and citations
**Measures**: Review velocity, backlink quality, citation trust
**Example**: Do you have verified reviews from real customers?

**How to Improve**:
- Earn reviews from verified customers (not fake reviews)
- Build backlinks from high-authority sites (.edu, .gov, news)
- Maintain consistent citations across directories
- Monitor for fake/spam reviews and report them

**Score Calculation**:
```typescript
authenticity_pct = (
  verified_reviews / total_reviews * 0.4 +
  quality_backlinks / total_backlinks * 0.4 +
  citation_consistency * 0.2
) * 100
```

### 5. Alignment (10% weight)
**What**: Search intent matching - does your content answer queries?
**Measures**: Query-content relevance, task completion, engagement
**Example**: When someone searches "Honda dealer near me", do you match that intent?

**How to Improve**:
- Optimize content for target queries (QAI* analysis)
- Improve task completion rates (e.g., forms, calls)
- Reduce bounce rate on landing pages
- Match content to search intent (informational, transactional, local)

**Score Calculation**:
```typescript
alignment_pct = (
  query_relevance_score * 0.5 +
  task_completion_rate * 0.3 +
  engagement_score * 0.2
) * 100
```

---

## 📊 ATI Composite Score

### Formula
```typescript
ATI = (
  precision_pct * 0.30 +
  consistency_pct * 0.25 +
  recency_pct * 0.20 +
  authenticity_pct * 0.15 +
  alignment_pct * 0.10
)
```

### Grading Scale
| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | Excellent | AI algorithms highly trust your data |
| 75-89 | Good | Solid trust signals, minor improvements needed |
| 60-74 | Fair | Trust issues impacting visibility, action needed |
| 0-59 | Poor | Critical trust problems, urgent intervention required |

---

## 🤖 CRS (Composite Reputation Score)

**CRS** is a Bayesian fusion of **AIV** (Algorithmic Visibility Index) and **ATI** (Algorithmic Trust Index).

### Formula
```typescript
CRS = (AIV * 0.6) + (ATI * 0.4)
```

### Why Bayesian Fusion?
- **AIV** measures visibility (are you showing up?)
- **ATI** measures trust (do algorithms believe you?)
- **CRS** combines both: showing up + being trusted = reputation

### Example
```typescript
AIV = 82% (good visibility)
ATI = 75% (good trust)
CRS = (82 * 0.6) + (75 * 0.4) = 49.2 + 30 = 79.2%
```

---

## 🏗️ Implementation Architecture

### Database Schema
```sql
CREATE TABLE ati_signals (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  date_week date NOT NULL,

  -- Five pillars
  precision_pct numeric(5,2) NOT NULL,
  consistency_pct numeric(5,2) NOT NULL,
  recency_pct numeric(5,2) NOT NULL,
  authenticity_pct numeric(5,2) NOT NULL,
  alignment_pct numeric(5,2) NOT NULL,

  -- Composite (calculated automatically)
  ati_pct numeric(5,2) GENERATED ALWAYS AS (
    LEAST(100,
      precision_pct*0.30 + consistency_pct*0.25 +
      recency_pct*0.20 + authenticity_pct*0.15 +
      alignment_pct*0.10)
  ) STORED,

  UNIQUE (tenant_id, date_week)
);
```

### API Endpoints

#### 1. Fetch Latest ATI
```bash
GET /api/tenants/{tenantId}/ati/latest

Response:
{
  "data": {
    "date_week": "2025-01-13",
    "precision_pct": 92.0,
    "consistency_pct": 88.0,
    "recency_pct": 75.0,
    "authenticity_pct": 85.0,
    "alignment_pct": 90.0,
    "ati_pct": 87.4
  },
  "error": null
}
```

#### 2. ATI Analysis Cron Job
```bash
POST /api/cron/ati-analysis
Authorization: Bearer {CRON_SECRET}

# Runs weekly (Monday 6 AM)
# Calculates ATI for all active tenants
```

### Cron Schedule
```json
{
  "path": "/api/cron/ati-analysis",
  "schedule": "0 6 * * 1"  // Every Monday at 6 AM
}
```

---

## 📈 Dashboard Integration

### HeaderTiles Component
Displays ATI alongside AIV, CRS, and Elasticity:

```tsx
<HeaderTiles tenantId={tenantId} />

// Shows:
// - AIV: 82.3 / 100
// - ATI: 87.4 / 100  ← Algorithmic Trust Index
// - CRS: 79.2 / 100  ← Bayesian fusion of AIV + ATI
// - Elasticity: $1,250 per +1 AIV pt
```

### ATI Breakdown (Future Component)
Show individual pillar scores with recommendations:

```tsx
<ATIPillarChart pillars={atiData} />

// Visualization:
// Precision:    ████████████████████ 92%
// Consistency:  ██████████████████   88%
// Recency:      ███████████          75%  ← Weakest pillar
// Authenticity: ████████████████     85%
// Alignment:    ████████████████████ 90%
//
// Recommendation: "Focus on improving recency (75%).
// Publish content weekly to boost freshness signals."
```

---

## 🔧 Configuration Files

### 1. lib/constants.ts
```typescript
export const ATI_WEIGHTS = {
  precision: 0.30,
  consistency: 0.25,
  recency: 0.20,
  authenticity: 0.15,
  alignment: 0.10,
} as const;
```

### 2. lib/labels.ts
```typescript
export const KPI_LABELS = {
  trust: 'Algorithmic Trust Index (ATI)',
  aiv: 'Algorithmic Visibility Index (AIV)',
  reputation: 'Composite Reputation Score (CRS)',
  // ...
} as const;
```

### 3. lib/ati-calculator.ts
```typescript
import { calculateATI, gradeATI, getATIRecommendation } from '@/lib/ati-calculator';

const pillars = {
  precision: 92,
  consistency: 88,
  recency: 75,
  authenticity: 85,
  alignment: 90,
};

const result = calculateATIResult(pillars);
// {
//   ...pillars,
//   ati: 87.4,
//   grade: 'good',
//   recommendation: 'Focus on improving recency...'
// }
```

---

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
# Navigate to project
cd /Users/briankramer/dealership-ai-dashboard

# Apply migration
psql "postgresql://postgres.[PROJECT_ID].supabase.co:6543/postgres" \
  -f supabase/migrations/20250115000005_ati_signals.sql
```

### 2. Verify Table Created
```sql
-- Check table exists
SELECT * FROM ati_signals LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'ati_signals';
```

### 3. Deploy to Vercel
```bash
# Deploy with updated cron jobs
vercel --prod

# Verify cron jobs scheduled
vercel crons ls --prod

# Expected output:
# ✓ /api/cron/ati-analysis (0 6 * * 1) - Weekly Monday 6 AM
```

### 4. Test ATI Endpoint
```bash
# Get your tenant ID
TENANT_ID="your-tenant-uuid"

# Test latest ATI endpoint
curl "https://yourdomain.com/api/tenants/$TENANT_ID/ati/latest"

# Expected response:
# {"data":{"date_week":"2025-01-13","ati_pct":87.4,...},"error":null}
```

### 5. Trigger Manual ATI Analysis
```bash
# Test cron job manually
curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
  -H "Authorization: Bearer $ADMIN_API_KEY"

# Check results in database
psql -c "SELECT tenant_id, date_week, ati_pct FROM ati_signals ORDER BY date_week DESC LIMIT 10"
```

---

## 📊 Data Collection Strategy

### Precision Pillar
**Data Sources**:
- Google Business Profile API
- Website scraping (cheerio)
- Directory listings (Yelp, Facebook, etc.)

**Metrics**:
- NAP match rate
- Business hours accuracy
- Service offerings correctness

**Calculation**:
```typescript
const fields = ['name', 'address', 'phone', 'hours', 'website', 'categories'];
const correctFields = fields.filter(field => isAccurate(field, sources));
precision_pct = (correctFields.length / fields.length) * 100;
```

### Consistency Pillar
**Data Sources**:
- Google Business Profile
- Website schema markup
- Social media profiles
- Directory listings

**Metrics**:
- Cross-platform NAP consistency
- Schema markup alignment
- Branding consistency

**Calculation**:
```typescript
const platforms = ['google', 'website', 'facebook', 'yelp', 'twitter'];
const consistentFields = countConsistentFields(platforms);
consistency_pct = (consistentFields / totalFields) * 100;
```

### Recency Pillar
**Data Sources**:
- Google Business Profile last updated
- Website content publish dates
- Review response timestamps
- Inventory listing ages

**Metrics**:
- Days since last GBP update
- Blog post frequency
- Review response time
- Inventory freshness

**Calculation**:
```typescript
const sources = [
  { name: 'GBP', daysSince: 2, weight: 0.3 },
  { name: 'blog', daysSince: 7, weight: 0.2 },
  { name: 'reviews', daysSince: 1, weight: 0.3 },
  { name: 'inventory', daysSince: 5, weight: 0.2 },
];

recency_pct = sources.reduce((sum, s) =>
  sum + (100 * Math.exp(-0.05 * s.daysSince) * s.weight), 0
);
```

### Authenticity Pillar
**Data Sources**:
- Google reviews
- Yelp reviews
- Backlink analysis (Ahrefs/Moz API)
- Citation consistency tools

**Metrics**:
- Verified review percentage
- Review velocity patterns
- Backlink domain authority
- Citation accuracy

**Calculation**:
```typescript
const verifiedReviews = reviews.filter(r => r.verified).length;
const qualityBacklinks = backlinks.filter(b => b.domainAuthority > 40).length;
const citationAccuracy = checkCitationConsistency();

authenticity_pct = (
  (verifiedReviews / reviews.length) * 0.4 +
  (qualityBacklinks / backlinks.length) * 0.4 +
  citationAccuracy * 0.2
) * 100;
```

### Alignment Pillar
**Data Sources**:
- Search Console API (query performance)
- Google Analytics (engagement metrics)
- Custom task completion tracking

**Metrics**:
- Query-content relevance scores
- Task completion rates (forms, calls)
- Bounce rate vs. engagement

**Calculation**:
```typescript
const queries = ['honda dealer near me', 'best used cars', ...];
const relevanceScores = queries.map(q => calculateRelevance(q, content));
const avgRelevance = average(relevanceScores);
const taskCompletion = completedTasks / totalAttempts;
const engagement = 1 - (bounceRate / 100);

alignment_pct = (
  avgRelevance * 0.5 +
  taskCompletion * 0.3 +
  engagement * 0.2
) * 100;
```

---

## 🎯 Success Metrics

### Technical KPIs
- **ATI Calculation Time**: <10 seconds per tenant
- **Data Freshness**: Updated weekly (Monday 6 AM)
- **API Response Time**: <200ms for /ati/latest
- **Accuracy**: ±5% vs. manual audit

### Business KPIs
- **ATI Improvement Rate**: +2-5 points per month for active users
- **Correlation with Rankings**: R² > 0.65 for ATI vs. SERP position
- **Conversion Impact**: +10% conversion for ATI >85 vs. <70
- **Customer Satisfaction**: 85%+ find ATI actionable

---

## 🔮 Future Enhancements

### Phase 1: Visualization (Q1 2025)
- [ ] ATI trend chart (weekly time series)
- [ ] Pillar breakdown radar chart
- [ ] Competitor ATI comparison
- [ ] Automated recommendations

### Phase 2: Autonomous Actions (Q2 2025)
- [ ] Sentinel trigger for ATI <60 (critical)
- [ ] Auto-generate SOWs for weak pillars
- [ ] Automated NAP sync across platforms
- [ ] AI-powered content freshness scheduling

### Phase 3: Predictive ATI (Q3 2025)
- [ ] Forecast ATI trend (next 4 weeks)
- [ ] Simulate impact of improvements
- [ ] Competitive ATI tracking
- [ ] Market-wide ATI benchmarks

---

## 📚 Related Documentation

- **[COMMAND_CENTER_READY.md](COMMAND_CENTER_READY.md)** - Overall deployment guide
- **[BETA_CALIBRATION_SENTINEL_IMPLEMENTATION.md](BETA_CALIBRATION_SENTINEL_IMPLEMENTATION.md)** - Autonomous systems
- **[BRANDING_GUIDE.md](BRANDING_GUIDE.md)** - Brand voice and positioning

---

## 🎬 Quick Start Commands

```bash
# 1. Apply migration
psql "postgresql://postgres.[PROJECT].supabase.co:6543/postgres" \
  -f supabase/migrations/20250115000005_ati_signals.sql

# 2. Test ATI calculation locally
npm run dev
curl "http://localhost:3000/api/tenants/$TENANT_ID/ati/latest"

# 3. Deploy to production
vercel --prod

# 4. Verify cron job
vercel crons ls --prod | grep ati-analysis

# 5. Trigger manual analysis
curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
  -H "Authorization: Bearer $ADMIN_API_KEY"

# 6. Check results
psql -c "SELECT * FROM ati_signals ORDER BY date_week DESC LIMIT 5"
```

---

**ATI: The Five-Pillar Trust Measurement for AI-Powered Visibility**

*Precision. Consistency. Recency. Authenticity. Alignment.*
*Because AI algorithms trust data, not promises.*

---

*DealershipAI v5.0 - Command Center*
*ATI Implementation Guide v1.0*
*January 2025*
