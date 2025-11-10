# Pulse Cards Dashboard - User Guide

## 🚀 Quick Start

### 1. Access the Dashboard
- **URL**: `/drive`
- **Authentication**: Required (Clerk)
- **Redirect**: Unauthenticated users → Clerk sign-in

### 2. What You'll See

#### Pulse Cards
Each card displays:
- **Headline**: Issue title (e.g., "Missing Product/AutoDealer schema")
- **Subhead**: Diagnosis (what's wrong)
- **Impact**: Revenue impact in $K/month
- **Effort**: Time to fix (e.g., "2min", "1h 30min")
- **Severity**: Color-coded (low/medium/high/critical)
- **Actions**: "Fix" (primary) and "Explain" (secondary) buttons

#### Impact Ledger (Right Sidebar)
- Tracks all applied fixes
- Shows revenue delta per action
- Timestamp for each entry

### 3. Pulse Sources

The dashboard aggregates insights from 4 sources:

1. **Visibility** (`/api/visibility/presence`)
   - AI engine presence (ChatGPT, Perplexity, Gemini, Copilot)
   - Low visibility triggers pulses

2. **Schema** (`/api/schema/validate`)
   - Missing JSON-LD schemas (Product, AutoDealer, FAQPage)
   - Schema validation issues

3. **Reviews** (`/api/reviews/summary`)
   - Review reply latency
   - Review cadence and rating trends
   - Requires Google Places integration

4. **GA4** (`/api/ga4/summary`)
   - AI-assisted traffic percentage
   - Bounce rate issues
   - Requires Google Analytics integration

### 4. Ranking Algorithm

Pulses are ranked by **Impact Score**:
```
Score = (Impact $ / Effort seconds) × Confidence
```

Higher scores = higher priority

### 5. Using the Dashboard

#### Apply a Fix
1. Click **"Fix"** on any pulse card
2. Review the fix details in the drawer
3. Click **"Apply"** to execute
4. Fix is tracked in the Impact Ledger

#### Explain a Pulse
1. Click **"Explain"** on any pulse card
2. (Coming soon: Opens explanation modal)

### 6. Enabling Real Data

#### Reviews Integration
```bash
# Set Google Places ID
POST /api/admin/integrations/reviews
{
  "placeId": "ChIJ..."
}
```

#### GA4 Integration
```bash
# Connect Google Analytics
GET /api/oauth/ga4/start
# Follow OAuth flow
```

#### Visibility Engines
```bash
# Enable/disable engines
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

### 7. Easter Eggs

The dashboard triggers contextual easter eggs:
- **Deep Insight**: >$15K combined impact → *"You mustn't be afraid to dream a little bigger."*
- **Auto-Remediation**: Fix applied → *"Come with me if you want to fix this."*
- **Self-Healing**: Schema auto-fix → *"Hasta la vista, error."*
- **Mission Complete**: All critical issues resolved → *"Are you not entertained?"*

Rules:
- Max 1 per user per 24h
- Context-triggered (not random)
- Never blocks task completion

### 8. Troubleshooting

#### No Pulses Showing
- Check browser console for API errors
- Verify authentication (Clerk session)
- Ensure tenantId is set in session claims
- Check API endpoints are accessible

#### API Errors
- Verify `.env.local` has required keys:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

#### Missing Data
- Reviews: Set `placeId` in integrations
- GA4: Complete OAuth flow
- Schema: Run validation scan
- Visibility: Check engine preferences

### 9. Development

#### Test Locally
```bash
npm run dev
# Visit http://localhost:3000/drive
```

#### API Endpoints
- `GET /api/pulse/snapshot?domain=example.com` - Get all pulses
- `GET /api/visibility/presence?domain=example.com` - Visibility data
- `GET /api/schema/validate?url=...` - Schema validation
- `GET /api/reviews/summary?placeId=...&domain=...` - Review summary
- `GET /api/ga4/summary?domain=...` - GA4 summary

#### Adapters
Located in `lib/adapters/`:
- `visibility.ts` - Converts visibility data → pulses
- `schema.ts` - Converts schema issues → pulses
- `reviews.ts` - Converts review data → pulses
- `ga4.ts` - Converts GA4 data → pulses

### 10. Next Steps

1. **Complete Onboarding** (`/onboarding`)
   - Enter dealership URL
   - Unlock full report
   - Select competitors

2. **Connect Integrations**
   - Google Business Profile (Reviews)
   - Google Analytics (GA4)
   - Schema Engine (if external)

3. **Apply Fixes**
   - Start with highest impact pulses
   - Track results in Impact Ledger
   - Monitor AIV improvements

4. **Monitor Trends**
   - Check pulse frequency
   - Review impact totals
   - Track fix success rate

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-01-07

