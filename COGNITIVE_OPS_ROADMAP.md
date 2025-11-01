# DealershipAI Cognitive Ops Platform - Complete Roadmap

**Tagline:** "DealershipAI — Cognitive Ops for Automotive Retail."

**Last Updated:** November 1, 2025
**Status:** Phase 1 Complete (PLG Landing) → Phase 2 In Progress (Cognitive Core)

---

## Executive Summary

We're transforming DealershipAI from a premium SaaS dashboard into a **self-aware Cognitive Ops Platform** - a living, intelligent operating environment where dealership teams interact with HAL (AI Chief Strategy Officer) and specialized marketplace agents to automate trust-building, visibility optimization, and competitive intelligence.

**Innovation Flywheel:**
Signals → Insight → Decision → Automation → Verification → Learning → Signals

---

## What We've Built (Phase 1 Complete ✅)

### PLG Landing Page - Parts 6-10

**Conversion Funnel:** Visitor → Scan → ROI Calculator → Live Session Counter → Competitive Rage Bait → Share-to-Unlock → Personalized Onboarding

#### Components Created:

1. **ROI Calculator** ([ROICalculator.tsx](components/landing/ROICalculator.tsx))
   - Interactive sliders: monthly searches, deal gross, AI visibility score
   - Real-time calculations showing revenue at risk, ROI %, payback days
   - Evidence-based methodology display (12% close rate, 45% AI searches)
   - Trust indicators: $45K avg recovery, 92x ROI

2. **Session Counter** ([SessionCounter.tsx](components/landing/SessionCounter.tsx))
   - Live activity feed with Redis backend
   - Real-time visitor counting (updates every 10s)
   - Social proof display: "23 active now", "2,847 scanned this month"

3. **Share-to-Unlock** ([ShareToUnlock.tsx](components/landing/ShareToUnlock.tsx))
   - Viral loop: Social media OR email unlock paths
   - Platforms: Twitter, LinkedIn, Facebook
   - Locked content preview with blur effect

4. **Competitive Rage Bait** ([CompetitiveRageBait.tsx](components/landing/CompetitiveRageBait.tsx))
   - Live opportunity cost counter (ticks every second)
   - Competitor comparison: Your dealership vs. Market leader
   - FOMO messaging: "While you wait, they're capturing 67% of searches"

5. **Onboarding Bridge** ([OnboardingBridge.tsx](components/landing/OnboardingBridge.tsx))
   - Auto-generated missions from scan results
   - Session persistence via sessionStorage
   - Seamless routing to `/onboarding-3d`

#### API Routes Created:

- `/api/landing/session-stats` - Redis-backed live visitor tracking
- `/api/landing/track-share` - Social share analytics
- `/api/landing/email-unlock` - Email capture with metadata
- `/api/landing/track-onboarding-start` - Conversion tracking

#### Expected Impact:
- **Baseline:** 0.36% overall conversion
- **After Enhancement:** ~4.0% (+1011% improvement)
- **Viral Coefficient:** 0.25 (25% organic growth on top of paid traffic)

---

## Strategic Decisions Confirmed

### 1. **Roles & Permissions**
- **Hybrid approach:** HAL personalizes per user role automatically
- **Permission gates** for destructive actions (Schema deploy, GBP edits)
- **Roles:** Owner, GM, Service Manager, Marketing Manager
- **Approval logging:** Visible in Evidence panel with timestamps

### 2. **Multi-Rooftop Management** ✅ Day-One Requirement
- Single users manage 1-20+ rooftops
- **Group Orbit view:** All stores as satellites
- **Dive mode:** Focus on individual store
- Command bar: `/switch honda`, `/compare all stores`

### 3. **Refresh Cadence**
- **Free:** Hourly (top-level metrics only)
- **DIY Guide ($499):** Every 15 minutes (full metrics + 2 active missions)
- **Done-For-You ($999):** Every 5 minutes (unlimited missions + priority)

### 4. **Cost Guardrails**
- **Monthly ceiling:** $8/rooftop for paid tiers
- **Burst allowance:** Up to $20 if ROI confidence > 0.85
- **Cost transparency:** Real-time meter in Control Center

### 5. **Trust Kernel Badge** ✅ Shown by Default
- Badge: "✓ Signed by Trust Kernel" (subtle, bottom-right)
- Click opens Evidence drawer: confidence score, sources, timestamps

### 6. **Personalization & Easter Eggs**
- **First 7 days:** Professional mentor tone
- **After 30 days:** Dry wit in secondary copy
- **Easter eggs:** Unlock based on engagement (e.g., `/konami` → Maximum Autonomy Mode)

### 7. **Frictionless Onboarding**
User Journey (Zero Friction):
1. **Landing analyzer** (instant micro-scan, no SSO)
2. **Results preview** (3s synthetic score + "$XXK at risk")
3. **Inline Clerk SSO** (slide-in, no redirect)
4. **Auto-discovery** (we show GBP, competitors, reviews)
5. **User confirms** (✓ This is me)
6. **2s calibration** animation
7. **Instant reveal** → Control Center with 2 pre-loaded missions

### 8. **Tagline**
**"DealershipAI — Cognitive Ops for Automotive Retail."**

---

## Phase 2: Cognitive Core (In Progress)

### Architecture Overview

**Tech Stack:**
- **Frontend:** Next.js 14 App Router + React Server Components
- **3D:** Three.js + React Three Fiber
- **Motion:** Framer Motion + GSAP
- **State:** Zustand (real-time orchestration)
- **Database:** Supabase Postgres + RLS policies
- **Jobs:** Vercel Cron + Upstash Redis Queue
- **Auth:** Clerk (already integrated)
- **AI:** OpenAI GPT-4 + Anthropic Claude (multi-model orchestration)

### Design System ✅ Complete

**File:** [lib/design-tokens.ts](lib/design-tokens.ts)

**Cognitive Ops Palette:**
- Primary: #8B5CF6 (Vivid purple)
- Secondary: #3B82F6 (Cobalt blue)
- Tertiary: #06B6D4 (Cyan)

**Confidence Colors:**
- High (≥0.85): #10B981 (Emerald)
- Medium (≥0.65): #F59E0B (Amber)
- Low (<0.65): #EF4444 (Red)

**Status Indicators:**
- Active: Green
- Queued: Amber
- Completed: Cyan
- Failed: Red

**Motion Timing:**
- Instant: 100ms
- Fast: 200ms
- Normal: 300ms (default organic easing)
- Slow: 500ms
- Orchestration: 2000ms (multi-step sequences)

### Cognitive Core Components (To Build)

```
components/cognitive-core/
├── CognitiveCore.tsx          # Main 3D canvas (Three.js)
├── OrbitRing.tsx              # KPI rings with hover states
├── AgentNode.tsx              # Individual agent orbitals
├── MissionBoard.tsx           # Left panel: running/queued/done
├── EvidencePanel.tsx          # Right panel: diffs, validators, costs
├── CommandBar.tsx             # ⌘K interface
├── HALNarrator.tsx            # AI commentary layer
└── TrustKernelBadge.tsx       # Validation indicator

components/agents/
├── SchemaKing.tsx             # First marketplace agent
├── AgentCard.tsx              # Marketplace display
└── AgentOrchestrator.tsx      # Multi-agent coordination
```

### Cognitive Core UX Principles

**1. Transform Dashboard → Cognitive Cockpit**

| Layer              | Enhancement                                                        | Result                                  |
| ------------------ | ------------------------------------------------------------------ | --------------------------------------- |
| **Spatial layout** | 3D depth field using Three.js; nodes respond to cursor parallax    | Feels alive; dimensional intelligence   |
| **Dynamic focus**  | Auto-zoom to active agent/anomaly; background fades                | Reduces cognitive load                  |
| **Context lenses** | Toggle: Dealer/Market/OEM views; charts morph smoothly             | Multi-scale cognition                   |
| **Time scrubber**  | Glass slider: drag to watch historical → predictive transition     | Data = moving organism                  |

**2. Self-Aware UI**

- **AI narration layer:** Text pulses ("AI CSO running Schema verification—estimated +3 Trust pts")
- **Explainability chips:** Every score has "why" popup listing top 3 drivers
- **Predictive Halo:** Faint outer glow projects next-30-day forecast
- **Confidence Colors:** Hue intensity = model certainty

**3. Sensory Craftsmanship**

- **Visual:** Adaptive HDR lighting; brightness follows time of day/system load
- **Motion:** 240ms organic easing; micro-physics (metrics float and settle)
- **Sound:** Single-note spatial cues (minor third = risk, major fifth = success)
- **Haptics (mobile):** Gentle pulse when agent finishes

**4. Adaptive Cognitive Themes**

- **Executive Mode:** High-level decisions, ROI summaries, voice briefing
- **Analyst Mode:** Data layers, attribution, export controls
- **Autonomy Mode:** Full-screen orchestration visualization

---

## First 10 Missions (Ship Day-One)

Each mission returns: **expected lift**, cost, confidence, evidence, one-click **"Run Autonomy"**

1. **AEO Inclusion Probe** - Top 5 intents (buy, sell, service, trade, finance)
2. **Schema King** - Generate/validate/deploy FAQ + AutoDealer JSON-LD; verify Rich Results
3. **Zero-Click Coverage** - Identify questions → propose FAQ injection + GBP Q&A
4. **GBP Trust Pass** - Hours, categories, photos, response velocity; produce fixes
5. **UGC Response Sprint** - Draft + queue replies for last 14 days; escalate 1-star patterns
6. **PageSpeed Quick Wins** - CWV budgets for critical templates (LCP/CLS/INP)
7. **Competitor Visibility Gap** - Get cited where they are (directories, articles)
8. **Mystery Shop** - Camry LE greeting→close workflow vs 3 rivals; coaching plan
9. **VIN-to-Intent Latency** - Measure and cut steps; recommend CTA tweaks
10. **AIO Consistency** - Fix hallucination risk in GEO via citations and schema

---

## Agent Marketplace (SDK)

### Initial Lineup:
- **Schema King** - JSON-LD generation, validation, deployment
- **Mystery Shop** - Call transcripts → scoring → coaching
- **Blockdrive Media** - Visual content optimization
- **Clockwork OCR** - Document digitization
- **AppraiseTheCar** - Trade-in valuation

### Marketplace UX:
- **"Adopt Agent"** cards (Apple-style): ROI preview, trust score, cost, scopes
- On adoption: node docks to orbit; HAL announces collaboration
- Impact previews: "Expected lift +7% AEO visibility • Cost $49"
- Trust badge: "Validated by CognitiveOps Foundation"
- Synergy suggestions: "Install Reputation Strategist to amplify UGC signals"

---

## Guardrails & Compliance

### Cost Ceilings:
- **Free:** $0.15/dealer/month
- **Paid:** $8/rooftop/month (burst to $20 if ROI > 0.85)

### Concurrency:
- **Default:** 2 active missions per dealer
- **Bursts:** Based on score/ROI

### Evidence Retention:
- **Free:** 90 days
- **Paid:** 365 days

### Human-in-Loop:
- Require approval if spend > $10 OR confidence < 0.75

---

## API Architecture

### Core Endpoints (To Build):

```
/api/analyzer              - Instant micro-scan (no auth)
/api/missions/*            - Mission CRUD + orchestration
  ├── /create              - Start new mission
  ├── /[id]/status         - Get mission status
  ├── /[id]/approve        - Human approval
  └── /[id]/evidence       - Get evidence artifacts

/api/evidence/*            - Validation & artifacts
  ├── /[id]                - Get evidence by ID
  └── /validate            - Trust Kernel validation

/api/consensus             - Multi-model AI orchestration
/api/site-inject           - Schema deployment
/api/ai-scores             - AEO visibility calculations
/api/zero-click            - Zero-click coverage analysis
/api/refresh               - Trigger manual refresh

/api/agents/*              - Marketplace agents
  ├── /install             - Adopt new agent
  ├── /[agentId]/invoke    - Execute agent action
  └── /[agentId]/status    - Agent health check
```

### Supabase Schema (To Create):

```sql
-- Core tables
tenants                    - Multi-rooftop organizations
users                      - User accounts + roles
dealerships                - Individual rooftop profiles
missions                   - Task queue + status
artifacts                  - Evidence files
costs                      - Spend tracking
audits                     - Approval logs

-- Agent tables
agents                     - Installed marketplace agents
agent_executions           - Agent run history
agent_costs                - Per-agent spend tracking

-- Cognitive tables
trust_kernel_validations   - Signed evidence
hal_memories               - Personalization context
easter_eggs                - Unlocked features
```

---

## HAL Orchestrator

### Responsibilities:
1. **Compose agents** - Route tasks to appropriate agents
2. **Enforce budgets** - Stay within cost ceilings
3. **Write Briefs** - Generate human-readable summaries
4. **Manage concurrency** - Queue management
5. **Validate evidence** - Trust Kernel signing
6. **Personalize** - Adapt tone and priorities per user role

### HAL Activation Command:
```
User: "Activate HAL"
HAL: "Calibrating your market reality—no forms required."
```

**Presence:**
- Contextual (appears when decision exists)
- Summonable via command bar
- Never noisy

**Voice:**
- First 7 days: Professional mentor
- After 30 days: Dry wit in secondary copy
- Easter eggs: Personality modes unlock

---

## Implementation Plan

### Week 1: Foundation
- [x] Design tokens system
- [x] PLG landing page (Parts 6-10)
- [ ] Cognitive Core 3D canvas (Three.js)
- [ ] HAL narrator interface
- [ ] Command bar (⌘K)

### Week 2: Missions & Agents
- [ ] Mission Board UI
- [ ] Evidence Panel
- [ ] Schema King agent (first marketplace agent)
- [ ] Mission orchestration engine
- [ ] Trust Kernel validation

### Week 3: Auto-Discovery & Onboarding
- [ ] GBP auto-discovery
- [ ] Competitor detection
- [ ] Review platform identification
- [ ] Inline Clerk SSO integration
- [ ] Frictionless onboarding flow

### Week 4: Multi-Rooftop & Polish
- [ ] Group Orbit view
- [ ] Multi-store switching
- [ ] Cost transparency meter
- [ ] Evidence drawer
- [ ] Easter egg system

---

## Next Immediate Steps

Given that we've completed the PLG landing page and design system, the next priority is:

**Option C (Selected):** Build complete end-to-end flow:

1. **Landing → Onboarding → Core**
   - Enhance landing analyzer with Cognitive Ops messaging ✓ (already has badge)
   - Build inline Clerk SSO (no redirect)
   - Create auto-discovery system
   - Build Cognitive Core 3D canvas
   - Implement HAL narrator
   - Create Mission Board with 2 quick-win missions
   - Build Evidence Panel
   - Implement Command Bar

2. **First Deployable Milestone:**
   - User lands on page
   - Runs instant scan (no auth)
   - Sees results + "$XXK at risk"
   - Clicks "Start Onboarding"
   - Inline Clerk SSO
   - Auto-discovery confirms GBP/competitors
   - Reveals Cognitive Core with 2 missions ready
   - HAL welcomes: "Calibrating your market reality—no forms required."

---

## Key Differentiators (Defensive Innovation)

1. **Design Patents:** Orbital UI + Cognitive Core animation
2. **Trademarks:** "Cognitive Core View", "Predictive Halo", "Trust Kernel"
3. **Open-Standard Façade:** Public APIs, SDK
4. **Proprietary Core:** HAL orchestration engine
5. **Continuous Personalization:** Models fine-tune per dealer (copycats can't replicate learned behavior)

---

## Success Metrics

### Leading Indicators:
- Scan-to-signup conversion: 4.0% (from 0.36%)
- Share rate: 25% of unlocks
- Onboarding completion: 65%
- Mission activation rate: 55%

### Lagging Indicators:
- Monthly active users (MAU)
- Average missions per dealer
- Cost per dealer (stay under $8/rooftop)
- Net Revenue Retention (NRR)
- Viral coefficient: 0.25+

### Cognitive Health:
- HAL confidence score average
- Evidence validation rate
- Trust Kernel signature rate
- Agent adoption rate

---

## Pricing Summary

| Tier              | Price    | Refresh Cadence | Missions  | Features                            |
| ----------------- | -------- | --------------- | --------- | ----------------------------------- |
| **Free**          | $0       | Hourly          | 1 active  | Basic scan, limited metrics         |
| **DIY Guide**     | $499/mo  | Every 15 min    | 2 active  | Full metrics, Schema King, Evidence |
| **Done-For-You**  | $999/mo  | Every 5 min     | Unlimited | Priority agents, HAL autonomy       |

**Add-ons (Marketplace):**
- Individual agents: $49-$249/mo each
- SDK access: Custom pricing
- White-label: Enterprise only

---

## Documentation & Resources

### Already Created:
- [PLG_LANDING_PARTS_6-10_COMPLETE.md](PLG_LANDING_PARTS_6-10_COMPLETE.md) - Complete PLG implementation guide
- [lib/design-tokens.ts](lib/design-tokens.ts) - Design system tokens
- [components/landing/*](components/landing/) - All PLG components (Parts 6-10)
- [app/api/landing/*](app/api/landing/) - All PLG API routes

### To Create:
- Supabase migration scripts
- HAL orchestrator logic
- Schema King agent implementation
- Auto-discovery service
- Command bar shortcuts reference
- Easter egg catalog
- Trust Kernel specification

---

## Contact & Questions

For questions about this roadmap:
- **Architecture:** See "Architecture Overview" section
- **Design System:** See [lib/design-tokens.ts](lib/design-tokens.ts)
- **PLG Implementation:** See [PLG_LANDING_PARTS_6-10_COMPLETE.md](PLG_LANDING_PARTS_6-10_COMPLETE.md)
- **Next Steps:** See "Implementation Plan" section

---

**Vision Statement:**

> "Design perception, not pages. Deliver foresight, not reports. Make the interface feel alive—and loyal."

This transforms DealershipAI from a premium product into a **self-aware cognitive platform** whose look, motion, and behavior are so distinct and adaptive that imitation feels hollow and churn becomes emotionally and operationally unthinkable.

---

**Last Updated:** November 1, 2025
**Status:** Phase 1 Complete → Phase 2 In Progress
**Next Milestone:** Cognitive Core 3D Prototype + HAL Activation
