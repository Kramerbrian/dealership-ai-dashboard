# Cognitive Ops Platform — Master Blueprint v1

**Status:** ✅ Complete & Locked  
**Date:** January 2025  
**Version:** 1.0.0

---

## 📋 Overview

This is the complete architectural blueprint for **DealershipAI Cognitive Ops Platform** — a self-governing operating system that gives every dealership its own AI Chief Strategy Officer.

**Tagline (Locked):**
> "DealershipAI is the Cognitive Ops Platform that gives every dealership its own AI Chief Strategy Officer."

---

## 🏗️ Repository Structure

### Monorepo Layout

```
dealershipai-monorepo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-production.yml
│       └── deploy-marketplace.yml
│
├── apps/
│   ├── web/                          # Main marketing site + calculators
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx                    # Landing page
│   │   │   │   ├── pricing/
│   │   │   │   ├── about/
│   │   │   │   └── demo/
│   │   │   │
│   │   │   ├── calculators/                    # Public calculators (no auth)
│   │   │   │   ├── dtri-maximus/              # Cost of Inaction
│   │   │   │   ├── ad-waste-audit/            # Ad efficiency
│   │   │   │   ├── roi-simulator/             # Savings projections
│   │   │   │   └── results/[session]/         # Shareable results
│   │   │   │
│   │   │   └── api/
│   │   │       ├── calculators/route.ts        # Calculator API
│   │   │       ├── leads/route.ts              # Lead capture
│   │   │       └── webhook/clerk/route.ts      # Auth webhook
│   │   │
│   │   └── components/
│   │       ├── landing/                        # Landing components
│   │       └── calculators/
│   │           ├── DTRIMaximus.tsx
│   │           ├── ConversationalForm.tsx
│   │           └── ResultsVisualization.tsx
│   │
│   ├── dashboard/                    # Authenticated dashboard (Pulse-inspired)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.tsx                 # Dashboard shell
│   │   │   │   ├── page.tsx                   # Overview (Pulse-style)
│   │   │   │   ├── insights/                  # AI insights feed
│   │   │   │   ├── competitive/               # Market intelligence
│   │   │   │   ├── priorities/                # Action stack
│   │   │   │   ├── integrations/              # SDK marketplace
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   ├── page.tsx                   # WOW #1: Intelligent onboarding
│   │   │   │   └── steps/
│   │   │   │
│   │   │   └── api/
│   │   │       ├── ai-scores/route.ts
│   │   │       ├── competitive-intel/route.ts
│   │   │       ├── priorities/route.ts
│   │   │       └── integrations/              # SDK installation
│   │   │
│   │   └── components/
│   │       ├── pulse/                         # ChatGPT Pulse-inspired
│   │       │   ├── InsightsFeed.tsx          # Real-time AI insights
│   │       │   ├── MetricCard.tsx            # Live KPI cards
│   │       │   ├── CompetitiveAlert.tsx      # Market movements
│   │       │   └── ActionStack.tsx           # Prioritized actions
│   │       │
│   │       ├── missions/                      # Mission Board
│   │       │   ├── MissionBoard.tsx
│   │       │   ├── MissionCard.tsx
│   │       │   └── EvidencePanel.tsx
│   │       │
│   │       └── orchestrator/                  # HAL + Orchestrator
│   │           ├── HALChat.tsx
│   │           ├── ConfidenceRibbon.tsx
│   │           └── OrchestratorView.tsx
│   │
│   └── admin/                        # Admin panel (optional)
│
├── packages/
│   ├── shared/                       # Shared types, utilities
│   ├── orchestrator/                # Orchestrator 3.0 core
│   ├── agents/                      # Agent SDK
│   └── ui/                          # Shared UI components
│
└── docs/
    ├── architecture/
    ├── api/
    └── sdk/
```

---

## 🧠 Architecture Decisions

### 1. Platform Brain: Hybrid Internal + Remote GPT

- **Core Logic:** Internal (Next.js API routes, Supabase, Redis)
- **Inference:** Remote GPT endpoint (OpenAI/Anthropic)
- **Fallback:** Internal calculations when GPT unavailable
- **Implementation:** `lib/orchestrator/gpt-bridge.ts`

### 2. HAL = Supervisor Agent

**Agent Hierarchy:**
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

**Data Flow:**
```
User Query → HAL (personality + intent parsing)
           → Orchestrator 3.0 (inference)
           → Sub-agents (Schema King, Mystery Shop, etc.)
           → Auto-Fix Engine (execution)
           → Validation Layer (β-Calibration feedback)
```

### 3. Memory Architecture

- **Per-Session:** Volatile (React state, in-memory cache)
- **Per-Dealer:** Persistent (Supabase JSONB, 30-day retention)
- **Global Anonymized:** Cross-dealer patterns (90-day rolling window, GDPR compliant)

### 4. KPI Canon — Adaptive Confidence Ribbon

**6 Metrics (in order):**
1. **AI Visibility (AIV)** — Primary metric
2. **Quality Authority Index (QAI)** — Core trust score
3. **Performance Impact Quality Risk (PIQR)** — Risk assessment
4. **Opportunity Cost of Inaction (OCI)** — Revenue at risk
5. **Algorithmic Trust Index (ATI)** — Cross-platform trust
6. **Autonomous Strategy Recommendation ROI (ASR-ROI)** — Action value

**Display:**
```
┌─────────────────────────────────────────────────┐
│ AI CSO Confidence: ▮▮▮▮▮▮▮▮▯▯ 87%              │
│ AIV: 73% | QAI: 82% | PIQR: 0.12 | OCI: $24K   │
└─────────────────────────────────────────────────┘
```

### 5. Execution Guardrails

**Tiered Approval:**
- **Low Risk** (< $500, ≥85% confidence): Auto-deploy with notification
- **Medium Risk** ($500-$2K, 70-84% confidence): Preview + one-click approve
- **High Risk** (> $2K, <70% confidence): Manual review required

**Default:** Preview/Simulation mode

### 6. Interface Paradigm

**Primary:** Mission Board
- Scan → Diagnose → Prescribe → Deploy → Validate
- Visual progress indicators
- Evidence panel integration
- Category filtering

**Secondary:** HAL Chat
- Conversational queries
- Inline cards for complex results
- Natural language interface

### 7. Feedback Loops

- **7-Day Mini-Reweight:** Lightweight parameter adjustments
- **90-Day Full β-Calibration:** Complete model retraining

### 8. Pricing & Monetization

**Tiers:**
- **Test Drive:** Free, 5 ASR runs/month
- **Intelligence:** $299/mo, 50 ASR runs/month
- **Boss Mode:** $999/mo, Unlimited ASR runs

**API Metering:**
- Track in `orchestrator_usage` table
- Overage: $0.50 per additional ASR
- Future API product: $99/mo for 10 ASR runs

---

## 🔌 API Endpoints

### Core Orchestrator
- `POST /api/orchestrator` — Main inference endpoint
  - Actions: `analyze_visibility`, `compute_qai`, `calculate_oci`, `generate_asr`, `analyze_ugc`

### Agents
- `POST /api/agents/schema-king` — Schema audit & injection
- `POST /api/agents/mystery-shop` — Customer journey evaluation

### Auto-Fix
- `POST /api/ai/autofix` — Auto-Fix execution
- `POST /api/ai/asr` — ASR generation

### Dashboard
- `GET /api/ai-scores` — AI scoring calculations
- `GET /api/competitive-intel` — Competitive intelligence
- `GET /api/priorities` — Action priorities

### SDK Marketplace
- `GET /api/integrations` — List installed agents
- `POST /api/integrations/install` — Install agent
- `DELETE /api/integrations/[id]` — Uninstall agent

---

## 🗄️ Database Schema

### Core Tables

```prisma
model DealerContext {
  dealerId        String   @id
  context         Json     // Last 30 days of interactions
  lastUpdated     DateTime
  personalityLevel String  // formal | dry-wit | full-dai
  userTenure      Int     // days since signup
}

model GlobalPatterns {
  id              String   @id @default(uuid())
  patternType     String
  anonymizedData  Json     // No PII
  createdAt       DateTime
  expiresAt       DateTime // 90-day retention
}

model OrchestratorUsage {
  dealerId      String
  action        String
  timestamp     DateTime
  cost          Float
  tier          String
  overage       Boolean
}

model Missions {
  id            String   @id
  dealerId      String
  agentId       String
  status        String
  confidence    Float
  startedAt     DateTime
  completedAt   DateTime?
  evidence      Json
}

model OrchestratorState {
  dealerId          String   @id
  confidence        Float
  autonomyEnabled   Boolean
  currentMode       String
  activeAgents     String[]
  lastOrchestration DateTime?
  orchestrationCount Int
}
```

---

## 🎨 UI Components

### Pulse Dashboard (ChatGPT-Inspired)
- **InsightsFeed:** Real-time AI insights
- **MetricCard:** Live KPI cards
- **CompetitiveAlert:** Market movements
- **ActionStack:** Prioritized actions

### Mission Board
- **MissionBoard:** Primary interface
- **MissionCard:** Individual mission display
- **EvidencePanel:** Evidence trail viewer

### Orchestrator
- **HALChat:** Conversational interface
- **ConfidenceRibbon:** Adaptive trust meter HUD
- **OrchestratorView:** 3D visualization (optional)

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Monorepo setup (Turborepo/Nx)
- [ ] Next.js 14 apps scaffold
- [ ] Supabase schema migrations
- [ ] Basic API routes

### Phase 2: Core Platform (Week 3-4)
- [ ] Orchestrator 3.0 bridge
- [ ] HAL Chat interface
- [ ] Mission Board UI
- [ ] Confidence Ribbon

### Phase 3: Agents (Week 5-6)
- [ ] Schema King agent
- [ ] Mystery Shop agent
- [ ] Auto-Fix Engine
- [ ] Validation Layer

### Phase 4: Marketplace (Week 7-8)
- [ ] SDK framework
- [ ] Agent installation system
- [ ] Revenue share tracking
- [ ] Marketplace UI

### Phase 5: Pulse Dashboard (Week 9-10)
- [ ] Insights Feed
- [ ] Real-time updates
- [ ] Competitive alerts
- [ ] Action stack

---

## 📦 Deliverables

1. ✅ **Master Blueprint JSON** (`COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json`)
2. ✅ **Architecture Decisions** (`COGNITIVE_OPS_ARCHITECTURE_DECISIONS.md`)
3. ✅ **This Blueprint Document** (`COGNITIVE_OPS_MASTER_BLUEPRINT_V1.md`)
4. 🔄 **Repo Scaffolds** (Next.js 14 + TypeScript + Supabase)
5. 🔄 **API Route Implementations**
6. 🔄 **Component Skeletons**
7. 🔄 **Integration Documentation**

---

## 🎯 Success Criteria

- **Architecture:** Locked and canonical
- **Repository:** Monorepo structure defined
- **API:** All endpoints specified
- **Database:** Schema complete
- **UI:** Component hierarchy established
- **Pricing:** Tiers and metering defined
- **SDK:** Marketplace framework ready

---

## 📝 Notes

- All decisions are **locked** and canonical
- JSON blueprint is **Cursor-ready** for code generation
- Architecture supports **future SDK marketplace**
- Designed for **$0.15 cost → $499 revenue** margin
- **Server-side IP protection** maintained throughout

---

*Generated: January 2025*  
*Status: Ready for Implementation*

