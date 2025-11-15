# Next Steps: UI Integration & Remaining Work

## ✅ Completed (This Session)

1. **Alert Bands in PulseOverview**
   - Added `alertBands` prop to display green/yellow/red indicators
   - Created `AlertIndicator` component for visual feedback
   - Updated `statusColor()` and `pillBg()` to use alert bands

2. **Tile Access Control**
   - Wired `getActiveTiles()` into `DashboardShell` navigation
   - Added user tier/role detection from Clerk metadata
   - Navigation now filters based on tier and role

3. **User Tier/Role Detection**
   - Added `getUserTierAndRole()` function in `app/dash/page.tsx`
   - Reads from Clerk `publicMetadata` with fallbacks

---

## 🎯 Immediate Next Steps (Priority Order)

### 1. Consensus Status UI (High Impact) ⭐

**Goal:** Show consensus indicators (unanimous/majority/weak) in issue displays

**Files to Update:**
- `components/pulse/PulseCard.tsx` - Add consensus badge/indicator
- `components/pulse/PulseCardGrid.tsx` - Pass consensus data to cards
- `app/api/pulse/[id]/fix/route.ts` - Already uses consensus, but UI needs to show it

**Implementation:**
```tsx
// Add to PulseCard component
{card.context?.consensus && (
  <ConsensusBadge 
    status={card.context.consensus} // 'unanimous' | 'majority' | 'weak'
    engines={card.context.engines}
  />
)}
```

**Visual Design:**
- **Unanimous** (3/3 engines): Green badge with checkmark ✓
- **Majority** (2/3 engines): Yellow badge with warning ⚠
- **Weak** (1/3 engines): Gray badge with info icon ℹ

---

### 2. Update Remaining Endpoints (Medium Priority)

**Endpoints to Migrate:**
- `/api/ai/compute` - Currently uses `lib/score/formulas`
- `/api/ai-visibility/score` - Uses legacy scoring
- `/api/calculator/ai-scores` - May need updates

**Action:** Replace legacy scoring with `lib/scoring.ts` functions

---

### 3. Auto-Fix Execution Workflow (Medium Priority)

**Goal:** Connect consensus filter to actual fix execution

**Files to Create/Update:**
- `components/dashboard/AutoFixQueue.tsx` - NEW: Review queue UI
- `lib/auto-fix/approval-workflow.ts` - NEW: Approval system
- `app/api/automation/fix/route.ts` - Use consensus filter

**Features:**
- Show queue of fixes requiring approval (majority consensus)
- Allow approve/reject actions
- Track fix execution status

---

### 4. Testing & QA (High Priority)

**Test Files to Create:**
- `__tests__/lib/scoring.test.ts` - Unit tests for scoring functions
- `__tests__/lib/auto-fix/consensus-filter.test.ts` - Consensus filtering
- `__tests__/lib/tiles.test.ts` - Tile access control
- `__tests__/api/clarity-stack.test.ts` - API endpoint tests

---

## 📊 Recommended Order

1. **Consensus Status UI** (1-2 hours)
   - High visual impact
   - Users can see which issues are most reliable
   - Builds on existing consensus infrastructure

2. **Update Remaining Endpoints** (2-3 hours)
   - Ensures consistency across all scoring endpoints
   - Prevents legacy code from causing issues

3. **Auto-Fix Execution Workflow** (4-6 hours)
   - More complex, requires UI components
   - Can be done incrementally

4. **Testing & QA** (Ongoing)
   - Should be done alongside other work
   - Critical for production readiness

---

## 🚀 Quick Wins

If you want to see immediate results:

1. **Add consensus badge to PulseCard** (30 min)
   - Simple visual indicator
   - High user value

2. **Update one legacy endpoint** (30 min)
   - `/api/ai-visibility/score` is likely simple
   - Immediate consistency improvement

---

## 📝 Notes

- All consensus logic is already implemented in `lib/auto-fix/consensus-filter.ts`
- The API endpoint `/api/pulse/[id]/fix` already checks consensus
- We just need to surface this information in the UI

