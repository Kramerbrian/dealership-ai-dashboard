# 🔍 Orchestrator 3.0 - Missing Items Checklist

## ✅ What We Have

### Components
- ✅ `NolanAcknowledgment.tsx` - Found
- ✅ `OrchestratorReadyState.tsx` - Found (2 copies)
- ✅ `PulseAssimilation.tsx` - Found (2 copies)
- ✅ `MotionOrchestrator.tsx` - Found
- ✅ `SystemOnlineOverlay.tsx` - Need to verify

### Lib Utilities
- ✅ `lib/utils/brandHue.ts` - Found
- ✅ `lib/hooks/useBrandTint.ts` - Found
- ✅ `lib/store/prefs.ts` - Need to verify
- ✅ `lib/store/cognitive.ts` - Need to verify

### API Routes
- ✅ `app/api/save-metrics/route.ts` - Found
- ❌ `app/api/marketpulse/compute/route.ts` - **MISSING**

### Pages
- ✅ `app/onboarding/page.tsx` - Need to verify implementation

## ❌ What's Missing

### 1. **Dependencies in apps/web/package.json**

**Missing from apps/web/package.json:**
- ❌ `framer-motion` - Required for animations
- ❌ `lottie-web` - Required for Lottie animations
- ❌ `@clerk/nextjs` - Need to verify if in root or apps/web
- ❌ `zustand` - State management
- ❌ `@tanstack/react-query` - Data fetching
- ❌ `lucide-react` - Icons
- ❌ `recharts` - Charts
- ❌ `date-fns` - Date utilities

**Action:** Add these to `apps/web/package.json`

### 2. **API Route Missing**

**Missing:**
- ❌ `app/api/marketpulse/compute/route.ts` - Mock KPI endpoint

**Action:** Create this route

### 3. **Sound Files Missing**

**Missing:**
- ❌ `public/sounds/nolan_transition.mp3`
- ❌ `public/sounds/orchestrator_ready.mp3`
- ❌ `public/sounds/pulse_assimilation.mp3`
- ❌ `public/sounds/system_online.mp3`

**Action:** Add sound files or make them optional

### 4. **Onboarding Page Implementation**

**Need to verify:**
- Does `app/onboarding/page.tsx` implement the full flow?
- NolanAcknowledgment → OrchestratorReadyState → PulseAssimilation
- Calls save-metrics API
- Collects PVR + Ad Expense + role

## 🎯 Priority Fixes

### High Priority (Blocks Deployment)
1. Add missing dependencies to `apps/web/package.json`
2. Create `app/api/marketpulse/compute/route.ts`

### Medium Priority (Enhancements)
3. Verify onboarding page flow
4. Add sound files (or make optional)

### Low Priority (Nice to Have)
5. Clean up duplicate component files
6. Verify all components are properly imported

## 📝 Quick Fix Commands

```bash
# Add missing dependencies
cd apps/web
npm install framer-motion lottie-web zustand @tanstack/react-query lucide-react recharts date-fns --save

# Create missing API route
# (Need to create app/api/marketpulse/compute/route.ts)

# Create sounds directory
mkdir -p public/sounds
# (Add sound files or make them optional)
```

