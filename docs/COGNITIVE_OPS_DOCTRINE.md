# DealershipAI Cognitive Ops Platform - Core Doctrine

## 🎯 Fundamental Principle

> **DealershipAI is a Cognitive Ops Platform — each rooftop operates with an embedded AI Chief Strategy Officer that continuously audits, predicts, fixes, and explains its own decisions.**

This is not a feature. This is the **system law** that defines every component, API call, and user interaction.

---

## Core Doctrines

### 1. Algorithmic Trust Doctrine
Every dealership is scored by:
- **AI Visibility Index (AIV)** - Presence across ChatGPT, Claude, Gemini, Perplexity
- **Algorithmic Trust Index (ATI)** - Credibility and E-E-A-T signals
- **Clarity Intelligence Score (CIS)** - Structured data quality

### 2. Public-Signal Proof
Visibility is determined **only** by publicly verifiable signals:
- Structured data (Schema.org, JSON-LD)
- PageSpeed metrics
- robots.txt / sitemap access
- Cached and validated through Redis

### 3. Multi-Agent Consensus
Cross-verifies findings across multiple AI platforms, creating unified consensus scores with confidence levels.

### 4. Continuous Auto-Fix Loop
Autonomous Auto-Fix Engine:
- Detects schema and SEO issues
- Auto-generates fixes (JSON-LD, LocalBusiness markup)
- Deploys and verifies via APIs
- Creates evidence trail

### 5. Cupertino-Minimalist UX
- Liquid-glass Apple Park aesthetic
- Modular cards with live KPIs
- Adaptive tabs
- Plan-based gating (Awareness → DIY Guide → Done-For-You)

---

## Architecture Layers

### Intelligence Architecture
| Layer | Function | Orchestrator Integration |
|-------|----------|------------------------|
| **Signal Layer** | Streams metrics (SEO → AEO → GEO → AI Visibility) | `/api/ai-scores`, `/api/pulse/events` |
| **Inference Layer** | Runs QAI / PIQR models | Orchestrator 3.0 prompt chains |
| **Autonomy Layer** | Generates ASRs (autonomous strategy recommendations) | GPT actions via orchestrator |
| **Execution Layer** | Triggers Auto-Fix or dealer workflows | `/api/ai/autofix` + AutoFixEngine |
| **Validation Layer** | Monitors post-fix impact (β-Calibration) | Feeds back to Orchestrator learning loop |

### Five Pillars (Enforcement)
1. **Autonomy Loop** - Runs every 6h: Scan → Diagnose → Prescribe → Deploy → Validate
2. **Accountability Layer** - Every recommendation logged as "ASR Decision" with rationale & cost delta
3. **Cognition Bar** - Dashboard ribbon showing "AI CSO Confidence Level ▮▮▮ 92%"
4. **Human Override** - One-click Pause Autonomy toggle with reason logging
5. **Self-Training** - β-Calibration feedback loop re-weights models quarterly

---

## Technical Implementation

### Environment Variables
```env
PLATFORM_MODE=CognitiveOps
ORCHESTRATOR_ROLE=AI_CSO
AUTONOMY_INTERVAL_HOURS=6
```

### API Middleware
All API routes (except public) automatically include:
```
X-Orchestrator-Role: AI_CSO
```

### Data Model
```prisma
model OrchestratorState {
  dealerId          String
  confidence        Float       // 0-1 confidence level
  autonomyEnabled   Boolean     // Auto-execute fixes
  currentMode       String      // "AI_CSO"
  activeAgents     String[]    // List of active agents
  lastOrchestration DateTime?
  orchestrationCount Int
}
```

---

## Cognitive Personality

**Voice Archetype:** Calm analyst meets irreverent pilot. Blunt truth, small smirk. Never snarky, never cute.

**Rules:**
- Use sparingly (1 witty line per screen max)
- Never block flow (humor in secondary text, tooltips)
- Self-deprecating AI (jokes at itself, never at user)
- Confidence > comedy (humor vanishes during serious actions)

---

## Scoring Formulas

### Order of Operations
1. `SEO = 0.4*CWV + 0.3*CrawlIndex + 0.3*ContentQuality`
2. `AEO = 0.35*PAA_Share + 0.35*FAQ_Schema + 0.3*Local_Citations`
3. `GEO = CSGV - λ_HRP*Hallucination_Risk` (capped to [0,1])
4. `PillarSum = SEO + AEO + GEO`
5. `QAI = λ_PIQR * PillarSum * VDP_Quality`
6. `TrustScore = 100 * (0.60*normalize(QAI) + 0.40*EEAT_Multiplier)`

### Financials
- `OCI = (ΔLeads_Potential * AvgGPPU_Org) / Risk_Adjustment_Factor`
- `AIA = (Σ(TouchpointValue_i * Proximity_i)) * ClosingRate`
- `DecayTax = CAC_Increase * Monthly_Lead_Volume * TSM`

---

## PLG Growth Loop

**Flow:** Free scan → Personalized insights → HAL invites to activate paid agents → Natural upsell

**Onboarding:** Radar scan → Clerk SSO → GBP/Competitors pre-found → User confirms → Reveal

---

## Expansion Strategy

1. **Cognitive Moat** - Dealer behavior telemetry → unique behavioral dataset
2. **Switching Costs** - Unified identity graph, cross-agent memory, embedded workflows
3. **Cognitive Economy** - Credits + usage tokens, reputation exchange, data leasing
4. **Self-Improving Loop** - Pulse ingestion, autonomous R&D agents, quarterly updates
5. **Cultural Moats** - Define category, certification programs, proprietary language

---

## File Organization

```
app/
├── (dashboard)/
│   ├── dashboard/page.tsx      # Main dashboard
│   └── orchestrator/page.tsx    # Orchestrator view
├── api/
│   ├── ai/compute/route.ts      # Score computation
│   ├── orchestrator/
│   │   ├── status/route.ts      # AI CSO status
│   │   ├── run/route.ts         # Trigger orchestration
│   │   └── autonomy/route.ts    # Toggle autonomy
│   └── zero-click/
│       ├── recompute/route.ts   # Daily recompute
│       └── summary/route.ts     # Summary data
components/
├── cognitive/
│   ├── IntelligenceShell.tsx    # Main container
│   ├── CognitionBar.tsx          # Confidence indicator
│   └── OrchestratorView.tsx     # HAL status panel
└── zero-click/
    ├── ZeroClickCard.tsx
    ├── AiriCard.tsx
    └── modals/
lib/
├── score/
│   ├── formulas.ts              # Mathematical functions
│   └── schemas.ts              # Zod validation
├── cognitive-personality.ts     # Voice system
└── design-tokens.ts            # Brand tokens
```

---

## Governance

Every new feature PR must include:
```markdown
# aligns-with: CognitiveOpsPlatform
```

Internal RFC: `001-CognitiveOps-Platform.md` defines architecture requirements.

---

## External Narrative

Every deck, demo, and onboarding opens with:

> "You already have a GM, GSM, and F&I Manager. Now you have your AI Chief Strategy Officer — always on, never guessing."

---

## References

- **GitHub Project:** `dealership-ai-dashboard` - Production reference
- **Brand Book:** Design tokens, SF Pro, liquid-glass aesthetic
- **Scoring Formulas:** Minimal explicit math (lib/score/formulas.ts)
- **Personality System:** Dry wit, intelligent humor (lib/cognitive-personality.ts)

