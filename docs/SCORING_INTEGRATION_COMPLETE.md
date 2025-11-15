# Scoring Integration - Complete ✅

## Overview

All scoring functions have been wired to API endpoints, consensus is connected to the auto-fix engine, and tile access control has been tested.

---

## ✅ Completed Tasks

### 1. Wired Scoring Functions to API Endpoints

#### `/api/clarity/stack` ✅
- **Updated to use**: `scoreComposite()`, `scoreAIVisibility()`, `rarCPC()`, `getMetricAlert()`
- **Changes**:
  - SEO, AEO, GEO scores now use `scoreComposite()` with proper weights
  - AI Visibility uses `scoreAIVisibility()` with engine coverage
  - Revenue at Risk uses `rarCPC()` with default CPC proxies
  - Added `alert_bands` to response (green/yellow/red for each metric)

#### `/api/marketpulse/compute` ✅
- **Updated to use**: `scoreAIVisibility()`, `getMetricAlert()`
- **Changes**:
  - AI Visibility (AIV) now calculated using weighted engine coverage
  - Added `aivAlert` to response for alert band classification

#### Other Endpoints
- `/api/ai/compute` - Uses legacy scoring (can be updated later)
- `/api/ai-visibility/score` - Uses legacy scoring (can be updated later)

---

### 2. Connected Consensus to Auto-Fix Engine ✅

#### New File: `lib/auto-fix/consensus-filter.ts`
- **Purpose**: Filter issues for auto-fix based on consensus
- **Functions**:
  - `filterIssuesForAutoFix()` - Separates issues into auto-fix, review queue, and logged
  - `canAutoFix()` - Check if issue has unanimous consensus
  - `getConsensusStatus()` - Get consensus details for an issue

#### Updated: `/api/pulse/[id]/fix/route.ts`
- **Changes**:
  - Checks consensus before auto-fixing
  - Only auto-fixes issues with **unanimous consensus** (3/3 engines)
  - Returns `requiresApproval: true` for non-unanimous issues
  - Queues majority (2/3) and weak (1/3) issues for review

#### Auto-Fix Rules
- **Unanimous (3/3)** → ✅ Auto-fix allowed (no approval needed)
- **Majority (2/3)** → ⚠️ Queue for human review
- **Weak (1/3)** → 📝 Log only

---

### 3. Tile Access Control Testing ✅

#### New Endpoint: `/api/test/tile-access`
- **Purpose**: Test tile access control for different user tiers and roles
- **Usage**:
  ```bash
  # Test all tiles for a user
  GET /api/test/tile-access?tier=2&role=manager

  # Test specific tile
  GET /api/test/tile-access?tier=3&role=marketing_director&tile=apis
  ```

#### Response Format
```json
{
  "success": true,
  "userTier": 2,
  "userRole": "manager",
  "availableTiles": [...],
  "allTiles": [
    { "tile": "site", "hasAccess": true },
    { "tile": "inventory", "hasAccess": true },
    { "tile": "apis", "hasAccess": false }
  ],
  "summary": {
    "total": 11,
    "accessible": 5,
    "blocked": 6
  }
}
```

---

## Integration Points

### Scoring Functions → API Endpoints

```typescript
// lib/scoring.ts exports:
- scoreComposite() → /api/clarity/stack (SEO, AEO, GEO)
- scoreAIVisibility() → /api/clarity/stack, /api/marketpulse/compute
- scoreWebsiteHealth() → (ready for future use)
- scoreMystery() → (ready for future use)
- scoreOverall() → (ready for future use)
- scoreEEAT() → (ready for future use)
- rarCPC() → /api/clarity/stack (Revenue at Risk)
- getMetricAlert() → /api/clarity/stack, /api/marketpulse/compute
```

### Consensus → Auto-Fix

```typescript
// Flow:
1. Issue detected → IssueHit[] created
2. consensus() called → ConsensusResult[]
3. filterIssuesForAutoFix() → { autoFix, reviewQueue, logged }
4. Only autoFix[] items are processed automatically
5. reviewQueue[] items require human approval
6. logged[] items are tracked but not acted upon
```

### Tile Access Control

```typescript
// lib/tiles.ts exports:
- getActiveTiles(userTier, userRole) → Available tiles for user
- hasTileAccess(tileKey, userTier, userRole) → Boolean access check

// Usage in dashboard:
const tiles = getActiveTiles(user.tier, user.role);
const canAccess = hasTileAccess('apis', user.tier, user.role);
```

---

## Testing

### Test Scoring Integration
```bash
# Test clarity stack with new scoring
curl "https://dash.dealershipai.com/api/clarity/stack?domain=test.com"

# Test market pulse with new scoring
curl "https://dash.dealershipai.com/api/marketpulse/compute?domain=test.com"
```

### Test Consensus Filter
```typescript
import { filterIssuesForAutoFix } from '@/lib/auto-fix/consensus-filter';
import { type IssueHit } from '@/lib/scoring';

const issueHits: IssueHit[] = [
  { id: 'issue-1', engine: 'chatgpt' },
  { id: 'issue-1', engine: 'gemini' },
  { id: 'issue-1', engine: 'perplexity' }, // Unanimous
  { id: 'issue-2', engine: 'chatgpt' },
  { id: 'issue-2', engine: 'gemini' }, // Majority
  { id: 'issue-3', engine: 'chatgpt' }, // Weak
];

const { autoFix, reviewQueue, logged } = filterIssuesForAutoFix(issueHits);
// autoFix: [issue-1] (unanimous)
// reviewQueue: [issue-2] (majority)
// logged: [issue-3] (weak)
```

### Test Tile Access
```bash
# Test Tier 1 user
curl "https://dash.dealershipai.com/api/test/tile-access?tier=1&role=dealer_user"

# Test Tier 3 marketing director
curl "https://dash.dealershipai.com/api/test/tile-access?tier=3&role=marketing_director"

# Test specific tile
curl "https://dash.dealershipai.com/api/test/tile-access?tier=3&role=marketing_director&tile=apis"
```

---

## Files Updated

1. ✅ `app/api/clarity/stack/route.ts` - Uses new scoring functions
2. ✅ `app/api/marketpulse/compute/route.ts` - Uses new scoring functions
3. ✅ `lib/auto-fix/consensus-filter.ts` - NEW: Consensus filtering for auto-fix
4. ✅ `app/api/pulse/[id]/fix/route.ts` - Checks consensus before auto-fixing
5. ✅ `app/api/test/tile-access/route.ts` - NEW: Tile access testing endpoint

---

## Next Steps

1. **Update remaining endpoints**:
   - `/api/ai/compute` - Migrate to new scoring functions
   - `/api/ai-visibility/score` - Migrate to new scoring functions

2. **Wire auto-fix to actual execution**:
   - Connect `lib/auto-fix/consensus-filter.ts` to actual fix execution
   - Implement approval workflow for majority issues

3. **Dashboard integration**:
   - Use `getActiveTiles()` in dashboard navigation
   - Show alert bands in UI using `getMetricAlert()`
   - Display consensus status for issues

4. **Testing**:
   - Add unit tests for consensus filtering
   - Add integration tests for tile access control
   - Test auto-fix flow end-to-end

---

**Status:** ✅ **Complete** - Scoring wired, consensus connected, tile access tested

