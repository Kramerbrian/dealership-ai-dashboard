# 🚀 DealershipAI Pulse System v2.0 - Setup Guide

## ✅ What's Ready

1. **Algorithm Specification**: `docs/dai_algorithm_engine_v2.json`
   - Complete formula definitions with λ weights and β coefficients
   - Type-safe reference for implementation

2. **Formula Types**: `lib/ai/formulas.ts`
   - TypeScript types extracted from JSON spec
   - Core `calculatePulseScore()` implementation
   - Ready for Cursor autocompletion

3. **Cursor Import Map**: `cursor_import_map.json`
   - Automation manifest for folder scaffolding
   - File templates with imports/exports

## 📋 Next Steps

### Step 1: Add Database Models

Add the Pulse models to `prisma/schema.prisma` (see `prisma/migrations/README_PULSE_SCHEMA.md`):

```bash
# Copy the schema from README_PULSE_SCHEMA.md into schema.prisma
# Then run migration:
npx prisma migrate dev --name add_pulse_tables
```

### Step 2: Generate Folder Structure

Cursor will automatically create these folders based on `cursor_import_map.json`:

- `/lib/pulse/` - Core calculation engine
- `/app/api/pulse/` - API endpoints
- `/components/pulse/` - React components
- `/backend/automation/` - Background jobs

### Step 3: Implement Core Engine

Start with `lib/pulse/engine.ts`:

```typescript
import { calculatePulseScore, PulseScoreInput } from '@/lib/ai/formulas';
import { prisma } from '@/lib/prisma';

export class PulseEngine {
  async calculateForDealer(dealerId: string): Promise<PulseScoreOutput> {
    // Fetch signals from database
    // Prepare input
    // Calculate score
    // Store result
    // Return output
  }
}
```

### Step 4: Create API Routes

Implement routes in `/app/api/pulse/`:
- `radar/route.ts` - GET endpoint for radar data
- `score/route.ts` - GET current pulse score
- `scenario/route.ts` - POST scenario modeling
- `trends/route.ts` - GET historical trends

### Step 5: Build Components

Create React components in `/components/pulse/`:
- `PulseRadar.tsx` - Radar chart visualization
- `ScenarioBuilder.tsx` - What-if scenario UI
- `TrendChart.tsx` - Trend visualization
- `PulseScoreCard.tsx` - Main score card

### Step 6: Test Routes

```bash
npm run dev

# Test endpoints:
curl http://localhost:3000/api/pulse/score?dealerId=demo-123
curl http://localhost:3000/api/pulse/radar?dealerId=demo-123
```

### Step 7: Add Dashboard Pages

Create:
- `/app/dashboard/pulse/page.tsx` - Pulse dashboard
- `/app/dashboard/scenario/page.tsx` - Scenario builder page

## 🔧 Integration Points

### With Existing Systems

- **QAI Engine**: Use QAI scores as input signals
- **Zero-Click**: Zero-click rate feeds into pulse calculation
- **Share-to-Unlock**: Track share events as engagement signals

### API Endpoints

All endpoints follow the pattern:
- `/api/pulse/{resource}`
- Query params: `dealerId`, `timeRange`, `metric`
- Response: JSON with typed interfaces

## 📊 Formula Reference

Core formula (from `dai_algorithm_engine_v2.json`):

```
P = clamp01(Σ(λ_i * S_i * exp(-β * Δt)) - penalties)
```

Where:
- `λ_i` = weight vector (aiv: 0.35, ati: 0.25, etc.)
- `S_i` = normalized signal values [0, 1]
- `β` = temporal decay coefficient (0.1)
- `Δt` = time delta in hours
- `penalties` = accumulated penalty score

## 🎯 Optimization Opportunities

Use Claude to:
1. Fine-tune λ weights based on historical data
2. Adjust β coefficients for optimal decay
3. Optimize penalty functions
4. Generate RLHF reward-loop pseudocode

## ✅ Verification Checklist

- [ ] Database models added to schema.prisma
- [ ] Migration run successfully
- [ ] `/lib/pulse/engine.ts` implemented
- [ ] API routes return valid JSON
- [ ] Components render without errors
- [ ] Dashboard pages accessible
- [ ] Formulae match specification
- [ ] Types exported correctly

---

**Status**: Foundation ready. Awaiting implementation of folders/files.
