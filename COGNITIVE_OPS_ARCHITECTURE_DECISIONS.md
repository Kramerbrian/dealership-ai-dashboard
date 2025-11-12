# Cognitive Ops Platform — Architecture Decisions

**Status:** ✅ Locked for Master Blueprint v1  
**Date:** January 2025  
**Purpose:** Canonical answers to Phase 0 non-negotiables

---

## 🧩 Phase 0 — Confirmed Decisions

### 1. Platform Brain Architecture

**Decision: Hybrid Internal + Remote GPT Endpoint**

- **Core Logic:** Internal (Next.js API routes, Supabase, Redis queues)
- **Inference Layer:** Remote GPT endpoint (OpenAI/Anthropic) via `/api/orchestrator`
- **Rationale:**
  - Protects IP (business logic stays server-side)
  - Fast iteration (swap GPT models without code changes)
  - Fallback capability (internal calculations when GPT unavailable)
  - Cost efficiency ($0.15 → $499 margin requires smart routing)

**Implementation:**
- Orchestrator 3.0 bridge (`lib/orchestrator/gpt-bridge.ts`) handles routing
- Internal fallback calculations for QAI/PIQR/OCI when API unavailable
- Async job queues (Supabase + Redis) for heavy inference tasks
- Local embeddings cache for context retrieval

---

### 2. HAL's Relationship to Orchestrator

**Decision: Option B — HAL = Supervisor Agent**

HAL orchestrates sub-agents:
- **HAL** → Supervisor (personality + decision routing)
- **Orchestrator 3.0** → Inference engine (QAI/PIQR/OCI/ASR calculations)
- **Schema King** → Schema audit & injection agent
- **Mystery Shop** → Customer journey evaluation agent
- **Auto-Fix Engine** → Execution layer

**Flow:**
```
User Query → HAL (personality + intent parsing)
           → Orchestrator 3.0 (inference)
           → Sub-agents (Schema King, Mystery Shop, etc.)
           → Auto-Fix Engine (execution)
           → Validation Layer (β-Calibration feedback)
```

**Rationale:**
- Aligns with "AI Chief Strategy Officer" positioning
- HAL provides personality, Orchestrator provides intelligence
- Modular agent architecture supports future SDK marketplace

---

### 3. Persistent Memory Scope

**Decision: Multi-Tier Memory Architecture**

- **Per-Session:** Volatile (React state, in-memory cache)
- **Per-Dealer:** Persistent (Supabase JSONB field `dealer_context`)
- **Global Anonymized:** Cross-dealer patterns for model retraining (90-day rolling window)

**Storage Schema:**
```prisma
model DealerContext {
  dealerId        String   @id
  context         Json     // Last 30 days of interactions, preferences
  lastUpdated     DateTime
  personalityLevel String  // formal | dry-wit | full-dai
  userTenure      Int     // days since signup
}

model GlobalPatterns {
  id              String   @id @default(uuid())
  patternType     String   // "schema_optimization", "visibility_boost"
  anonymizedData  Json     // No PII, aggregated metrics only
  createdAt       DateTime
  expiresAt       DateTime // 90-day retention
}
```

**GDPR Compliance:**
- Per-dealer data: User can export/delete
- Global patterns: Fully anonymized, no PII
- 90-day rolling window for retraining data

---

### 4. KPI Canon — Adaptive Confidence Ribbon

**Confirmed Metrics (in order of display):**

1. **AI Visibility (AIV)** — Primary metric
2. **Quality Authority Index (QAI)** — Core trust score
3. **Performance Impact Quality Risk (PIQR)** — Risk assessment
4. **Opportunity Cost of Inaction (OCI)** — Revenue at risk
5. **Algorithmic Trust Index (ATI)** — Cross-platform trust
6. **Autonomous Strategy Recommendation ROI (ASR-ROI)** — Action value

**Display Format:**
```
┌─────────────────────────────────────────────────┐
│ AI CSO Confidence: ▮▮▮▮▮▮▮▮▯▯ 87%              │
│ AIV: 73% | QAI: 82% | PIQR: 0.12 | OCI: $24K   │
└─────────────────────────────────────────────────┘
```

**Confidence Calculation:**
- Weighted average of all 6 metrics
- Color-coded: Green (≥85%), Amber (65-84%), Red (<65%)

---

### 5. Execution Guardrails

**Decision: Simulation/Preview by Default, Auto-Deploy for Low-Risk**

**Tiered Approval System:**
- **Low Risk (< $500 impact, confidence ≥ 0.85):** Auto-deploy with notification
- **Medium Risk ($500-$2K, confidence 0.70-0.84):** Preview + one-click approve
- **High Risk (> $2K, confidence < 0.70):** Manual review required

**Default Mode:** Preview/Simulation
- All fixes shown as "Preview" cards
- User clicks "Deploy" to execute
- Auto-Fix toggle in settings (Boss Mode only)

**Guardrail Rules:**
```typescript
const GUARDRAILS = {
  autoDeployThreshold: { impact: 500, confidence: 0.85 },
  previewThreshold: { impact: 2000, confidence: 0.70 },
  manualReviewThreshold: { impact: 2000, confidence: 0.70 }
}
```

**Rationale:**
- Builds trust through transparency
- Protects against high-impact mistakes
- Enables "set it and forget it" for power users

---

### 6. Interface Paradigm

**Decision: Mission Board Primary, HAL Chat Secondary**

**Primary Interface:** Mission Board
- Each mission card shows: Scan → Diagnose → Prescribe → Deploy → Validate
- Visual progress indicators
- Evidence panel integration
- Category filtering (Quick-Win, Strategic, Maintenance)

**Secondary Interface:** HAL Chat
- Conversational queries for quick insights
- Cards appear inline for complex results
- Natural language: "What's my AI visibility?" → Mission card appears

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Mission Board] [HAL Chat] [Settings] │
│                                         │
│ ┌─────────────┐  ┌─────────────┐      │
│ │ Mission 1   │  │ Mission 2   │      │
│ │ [Progress]  │  │ [Evidence]  │      │
│ └─────────────┘  └─────────────┘      │
│                                         │
│ [Adaptive Confidence Ribbon]           │
└─────────────────────────────────────────┘
```

**Rationale:**
- Mission Board = Command Center aesthetic
- HAL Chat = Quick access for power users
- Both interfaces share same data layer

---

### 7. Feedback Frequency

**Decision: Dual-Loop System**

- **7-Day Rolling Mini-Reweight:** Lightweight parameter adjustments
  - Updates QAI/PIQR weights based on recent performance
  - No full model retraining
  - Fast adaptation to market changes

- **90-Day Full β-Calibration:** Complete model retraining
  - Full weight recalibration
  - Pattern recognition updates
  - Cross-dealer anonymized data integration

**Implementation:**
```typescript
// Weekly mini-reweight (lightweight)
schedule('0 0 * * 0', async () => {
  await miniReweight({ window: '7d', scope: 'per-dealer' });
});

// Quarterly full calibration (heavy)
schedule('0 0 1 */3 *', async () => {
  await fullBetaCalibration({ 
    window: '90d', 
    scope: 'global-anonymized' 
  });
});
```

**Rationale:**
- 7-day loop = Responsive to market changes
- 90-day loop = Deep learning without overfitting
- Balances speed with stability

---

### 8. Developer Handoff Targets

**Decision: Next.js 14 + TypeScript + Supabase Repo Scaffolds**

**Deliverable Format:**
- Complete Next.js 14 App Router structure
- TypeScript with strict type checking
- Supabase schema migrations
- API route scaffolds (`/api/orchestrator`, `/api/ai/autofix`, etc.)
- Component skeletons (Mission Board, HAL Chat, Confidence Ribbon)
- Cursor-ready (`.cursorrules` included)

**File Structure:**
```
cognitive-ops-platform/
├── app/
│   ├── (dashboard)/
│   │   ├── missions/
│   │   └── orchestrator/
│   └── api/
│       ├── orchestrator/
│       ├── ai/
│       └── agents/
├── components/
│   ├── missions/
│   ├── orchestrator/
│   └── confidence-ribbon/
├── lib/
│   ├── orchestrator/
│   ├── agents/
│   └── calibration/
└── supabase/
    └── migrations/
```

**Rationale:**
- Cursor AI can generate code from scaffolds
- TypeScript ensures type safety
- Supabase = existing infrastructure
- Ready for immediate development

---

### 9. Deployment Vision

**Confirmed Tagline:**

> **"DealershipAI is the Cognitive Ops Platform that gives every dealership its own AI Chief Strategy Officer."**

**Locked for:**
- Landing page hero
- Dashboard header
- PLG marketing copy
- API documentation
- Product pitch decks

**Variations (context-specific):**
- Short: "Your AI Chief Strategy Officer"
- Long: "The Cognitive Ops Platform that gives every dealership its own AI Chief Strategy Officer, continuously auditing, predicting, fixing, and explaining decisions."

**Rationale:**
- Clear value proposition
- Memorable positioning
- Differentiates from "dashboard" or "tool"

---

### 10. Licensing / API Monetization

**Decision: Bundled Tiers by Rooftop**

**Pricing Model:**
- **Test Drive:** 5 ASR runs/month (free)
- **Intelligence:** 50 ASR runs/month ($299/mo)
- **Boss Mode:** Unlimited ASR runs ($999/mo)

**API Metering:**
- Track per-dealer usage in `orchestrator_usage` table
- Meter: ASR runs, QAI calculations, OCI analyses
- Soft limits with overage pricing ($0.50 per additional ASR)

**Future API Product:**
- External API access: $99/mo for 10 ASR runs
- Enterprise API: Custom pricing (unlimited)
- SDK marketplace: Revenue share model

**Telemetry Schema:**
```prisma
model OrchestratorUsage {
  dealerId      String
  action        String  // "generate_asr", "compute_qai", etc.
  timestamp     DateTime
  cost          Float   // Internal cost tracking
  tier          String  // "test_drive", "intelligence", "boss_mode"
  overage       Boolean
}
```

**Rationale:**
- Predictable revenue (tier-based)
- Clear upgrade path
- Protects margin ($0.15 cost → $499 revenue)
- Enables future API product line

---

## 🎯 Architecture Summary

### Agent Hierarchy
```
HAL (Supervisor)
├── Orchestrator 3.0 (Inference Engine)
│   ├── QAI Calculator
│   ├── PIQR Analyzer
│   ├── OCI Calculator
│   └── ASR Generator
├── Schema King (Schema Agent)
├── Mystery Shop (Journey Agent)
└── Auto-Fix Engine (Execution Layer)
    └── Validation Layer (β-Calibration)
```

### Data Flow
```
Signal → Inference → Autonomy → Execution → Validation
  ↓         ↓          ↓           ↓           ↓
Scan    Diagnose   Prescribe   Deploy    Validate
```

### UI Components
- **Mission Board:** Primary interface
- **HAL Chat:** Conversational secondary
- **Adaptive Confidence Ribbon:** Trust meter HUD
- **Orchestrator View:** 3D visualization (optional)

### API Endpoints
- `/api/orchestrator` — Main inference endpoint
- `/api/ai/autofix` — Auto-Fix execution
- `/api/ai/asr` — ASR generation
- `/api/agents/schema-king` — Schema agent
- `/api/agents/mystery-shop` — Journey agent

---

## ✅ Next Steps

1. Generate **Cognitive Ops Master Blueprint v1** JSON spec
2. Create architecture diagram (Mermaid/PlantUML)
3. Scaffold Next.js 14 repo structure
4. Write API route implementations
5. Build component skeletons
6. Document integration points

**ETA:** Ready for code generation within 24 hours of blueprint completion.

---

*These decisions are locked and canonical for Cognitive Ops Platform v1.*

