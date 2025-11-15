# Scoring Formulas - Complete Implementation

## Overview

All final scoring formulas, targets, consensus rules, and schedules have been implemented.

---

## Scoring Module

**Location:** `lib/scoring.ts`

### Formulas Implemented

#### SEO Score (0-100)
```
0.20*mentions + 0.25*citations + 0.15*sentiment + 0.40*shareOfVoice
```

#### AEO Score (0-100)
```
0.30*mentions + 0.35*citations + 0.10*sentiment + 0.25*shareOfVoice
```

#### GEO Score (0-100)
```
0.25*mentions + 0.30*citations + 0.20*sentiment + 0.25*shareOfVoice
```

#### AI Visibility (0-100)
```
0.25*Perplexity + 0.40*ChatGPT + 0.35*Gemini
```

#### Website Health (0-100)
```
0.70*CWV + 0.20*Meta + 0.10*Indexation
```

Where:
- **CWV** = average of LCP/INP/CLS mapped to 0-100
- **Meta** = average completeness of title, description, H1
- **Indexation** = `indexed ÷ (indexed+excluded)` to 0-100

#### Mystery Score (0-100)
```
25% Speed-to-lead + 25% Quote transparency + 15% Phone etiquette + 
15% Chat responsiveness + 10% Appt set rate + 10% Follow-up
```

#### Overall Score (0-100)
```
20% SEO + 25% AEO + 15% GEO + 20% AI Visibility + 10% Website Health + 10% Mystery
```

#### Zero-click Inclusion Rate
```
included_intents ÷ tested_intents (7-day rolling window, min 10 intents)
```

#### E-E-A-T Score (0-100)
```
(# of satisfied signals) ÷ 4
Signals: Experience, Expertise, Authority, Trust
```

---

## Targets and Alert Bands

**Location:** `lib/scoring.ts` - `THRESHOLDS` constant

| Metric | Target (Green) | Watch (Yellow) | Critical (Red) |
|--------|---------------|----------------|----------------|
| SEO | ≥ 85 | 70–84 | < 70 |
| AEO | ≥ 80 | 65–79 | < 65 |
| GEO | ≥ 85 | 70–84 | < 70 |
| AI Visibility | ≥ 85 | 70–84 | < 70 |
| Website Health | ≥ 90 | 75–89 | < 75 |
| Mystery Score | ≥ 80 | 65–79 | < 65 |
| Zero-click inclusion | ≥ 75% | 50–74% | < 50% |
| E-E-A-T | 4/4 | 3/4 | ≤ 2/4 |

---

## Consensus Rules

**Location:** `lib/scoring.ts` - `consensus()` function

### Issue Consensus Weights
- Perplexity: 0.25
- ChatGPT: 0.40
- Gemini: 0.35

### Consensus Levels
- **Unanimous** = 3/3 engines → Auto-fix allowed
- **Majority** = 2/3 engines → Queue for human review
- **Weak** = 1/3 engines → Log only

---

## Revenue at Risk (RAR)

**Location:** `lib/scoring.ts` - `rarCPC()` and `rarVPC()` functions

### Method A: CPC Proxy (Default)
```
RAR = Σ_intent (missed_clicks_intent × CPC_proxy_intent)
```

Default CPC proxies:
- Buy = $14
- Sell = $12
- Service = $8
- Trade = $10

### Method B: Value-per-click from CPL
```
VPC = (lead_conv_rate) × (CPL)
RAR = Σ_intent (missed_clicks_intent × VPC_intent)
```

Defaults:
- CPL = $50
- Sales 6%, Service 12%, Trade 8%
- VPC ≈ $3.00 / $6.00 / $4.00

---

## Schedule

**Location:** `vercel.json` - Cron configuration

### Daily Scoring Cron
- **Schedule:** `0 4 * * *` (04:00 UTC)
- **Endpoint:** `/api/cron/daily-scoring`
- **Jitter:** ±20 minutes per dealership (implemented in route handler)

**Location:** `app/api/cron/daily-scoring/route.ts`

---

## RBAC Updates

**Location:** `lib/rbac.ts`

### New Role: marketing_director
```ts
export type Role = 'dealer_user' | 'manager' | 'marketing_director' | 'admin' | 'superadmin';
```

### Role Hierarchy
- dealer_user: 1
- manager: 2
- marketing_director: 3
- admin: 4
- superadmin: 5

### Access Control
- **APIs & Exports** → Requires `marketing_director+`
- **dAI Agents** → Requires `marketing_director+`

---

## Tiles Configuration

**Location:** `lib/tiles.ts`

### Active Tiles (active: true)
- ✅ **intel** - Tier 1+
- ✅ **site** - Tier 1+ (Site Intelligence)
- ✅ **inventory** - Tier 2+ (Inventory Optimization)
- ✅ **traffic** - Tier 2+ (Traffic & Market)
- ✅ **agents** - Tier 3+ (marketing_director+)
- ✅ **apis** - Tier 3+ (marketing_director+)
- ✅ **mystery** - Tier 3+ (beta)

### Gated Betas (active: false)
- ⚠️ **block** - Tier 2+ (requires data sources)
- ⚠️ **fixed** - Tier 2+ (requires data sources)

### Admin Tiles
- ✅ **admin** - admin+
- ✅ **super** - superadmin only

---

## Usage Examples

### Calculate Scores
```ts
import {
  scoreComposite,
  scoreAIVisibility,
  scoreWebsiteHealth,
  scoreOverall,
  scoreMystery,
  scoreEEAT,
} from '@/lib/scoring';

const seo = scoreComposite(metrics, 'seo');
const ai = scoreAIVisibility({ perplexity: 75, chatgpt: 80, gemini: 70 });
const overall = scoreOverall({ seo, aeo, geo, ai, wh, mystery });
```

### Get Alert Band
```ts
import { getMetricAlert, THRESHOLDS } from '@/lib/scoring';

const band = getMetricAlert('seo', 75); // Returns 'yellow'
```

### Calculate Consensus
```ts
import { consensus } from '@/lib/scoring';

const hits = [
  { id: 'issue-1', engine: 'chatgpt' },
  { id: 'issue-1', engine: 'gemini' },
  { id: 'issue-1', engine: 'perplexity' },
];

const results = consensus(hits);
// Returns: [{ id: 'issue-1', engines: ['chatgpt', 'gemini', 'perplexity'], unanimous: true, ... }]
```

### Calculate Revenue at Risk
```ts
import { rarCPC, rarVPC } from '@/lib/scoring';

const missedClicks = { buy: 50, sell: 30, service: 20 };
const rar = rarCPC(missedClicks); // Uses default CPCs
```

---

## Files Created/Updated

1. ✅ `lib/scoring.ts` - Complete scoring module
2. ✅ `lib/rbac.ts` - Updated with marketing_director role
3. ✅ `lib/tiles.ts` - Tile configuration system
4. ✅ `app/api/cron/daily-scoring/route.ts` - Daily scoring cron
5. ✅ `vercel.json` - Added daily scoring cron schedule

---

**Status:** ✅ **Complete** - All formulas, targets, and schedules implemented

