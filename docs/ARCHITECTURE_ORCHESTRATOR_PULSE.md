# DealershipAI Architecture: Orchestrator 3.0 + Pulse + Engines

## 🧠 One Brain, Many Engines, One Face

```
┌─────────────────────────────────────────────────────────────┐
│                    Dealers / Users                          │
│              (GM, Marketing, Owner, Internet Manager)      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ clicks, URLs, logins
                        ▼
            ┌───────────────────────────┐
            │    DealershipAI UI        │
            │  Landing + Dashboard      │
            │  - LandingAnalyzer        │
            │  - PulseOverview          │
            │  - AutopilotPanel         │
            │  - AIStoryPage            │
            └───────────┬───────────────┘
                        │
                        │ HTTP calls
                        ▼
        ┌───────────────────────────────┐
        │      API Routes               │
        │  - /api/clarity/stack         │
        │  - /api/pulse/snapshot        │
        │  - /api/ai-story              │
        │  - /api/agentic/assist        │
        └───────────┬───────────────────┘
                    │
                    │ orchestrates
                    ▼
    ┌───────────────────────────────────────┐
    │      Orchestrator 3.0 (GPT)           │ ◀─── Single "Brain"
    │  - Tool calling                       │
    │  - Multi-step reasoning               │
    │  - State management                   │
    │  - Coordinates all engines            │
    └───────┬───────────────┬───────────────┘
            │               │
            │               │ formats insights
            │               ▼
            │   ┌───────────────────────────┐
            │   │   Pulse GPT (optional)    │
            │   │   - Pulse cards           │
            │   │   - Priority stack        │
            │   │   - Daily digest          │
            │   └───────────┬───────────────┘
            │               │
            │               │ JSON response
            │               ▼
            │   ┌───────────────────────────┐
            │   │   Pulse API Responses      │
            │   │   - Tiles                  │
            │   │   - Priority Actions       │
            │   │   - Daily Digest           │
            │   └───────────────────────────┘
            │
            │ calls tools
            ▼
    ┌───────────────────────────────────────┐
    │           Engines & Feeds             │
    ├───────────────────────────────────────┤
    │  • Clarity Stack Engine               │
    │    (SEO, AEO, GEO, AVI)               │
    ├───────────────────────────────────────┤
    │  • dAI Schema Auto Engine             │
    │    (coverage, generation, validation)  │
    ├───────────────────────────────────────┤
    │  • AIM Valuation Engine               │
    │    (RaR, OCI, EV/ICE, appraisal)      │
    ├───────────────────────────────────────┤
    │  • GBP / UGC / Reviews Engine         │
    │    (health, velocity, trust)          │
    ├───────────────────────────────────────┤
    │  • Competitive Engine                 │
    │    (rank, leaders, gaps)              │
    └───────────────────────────────────────┘
```

---

## 🔄 Data Flow: From URL to Pulse Tiles

### Step 1: Landing Page
```
User enters: naplestoyota.com
↓
LandingAnalyzer component
↓
GET /api/clarity/stack?domain=naplestoyota.com
```

### Step 2: API Route
```
app/api/clarity/stack/route.ts
↓
Calls Orchestrator 3.0 (or individual engines)
↓
Returns unified payload
```

### Step 3: Orchestrator 3.0 Processing
```
Orchestrator receives: { domain: "naplestoyota.com" }
↓
Calls tools in parallel:
  • tool:clarity_stack(domain) → SEO/AEO/GEO/AVI
  • tool:schema_health(domain) → schema score + issues
  • tool:aim_valuation(domain) → RaR, OCI
  • tool:gbp_health(domain) → GBP health + issues
  • tool:ugc_health(domain) → reviews + UGC score
  • tool:competitive_summary(domain) → rank + leaders
  • tool:location_resolve(domain) → lat/lng/city/state
↓
Aggregates all signals
↓
(Optional) Calls Pulse GPT with aggregated data
↓
Returns structured JSON
```

### Step 4: Landing UI Renders
```
Response includes:
  • scores: { seo, aeo, geo, avi }
  • location: { lat, lng, city, state }
  • revenue_at_risk: { monthly, annual }
  • ai_intro_current: "Today AI sees you..."
  • ai_intro_improved: "You could look like..."
↓
UI renders:
  • DealerFlyInMap (location)
  • ClarityStackPanel (scores + $ at risk)
  • AIIntroCard (current vs improved)
```

### Step 5: User Clicks "Unlock Dashboard"
```
Redirects to: /dash?domain=naplestoyota.com
↓
Clerk middleware checks auth
↓
If not signed in → /sign-in?redirect_domain=...
↓
If signed in → /dash page loads
↓
Calls /api/clarity/stack again (or /api/pulse/snapshot)
↓
Renders PulseOverview with tiles + priority actions
```

### Step 6: Dashboard Navigation
```
/dash → Pulse overview
/dash/autopilot → Autopilot panel
/dash/insights/ai-story → AI storyline
/dash/onboarding → Setup flow
```

---

## 🧩 Engine-Centric View (Developer Angle)

```
                        ┌───────────────────────────┐
                        │ Orchestrator 3.0 GPT      │
                        │  - System prompt          │
                        │  - Tool definitions       │
                        │  - State management       │
                        │  - Multi-step reasoning   │
                        └───────────┬───────────────┘
                                    │
                                    │ tool calls
        ┌───────────────────────────┼─────────────────────────────┐
        │                           │                             │
        ▼                           ▼                             ▼
┌────────────────┐        ┌────────────────────┐         ┌────────────────────┐
│ Clarity Engine │        │ dAI Schema Engine  │         │ AIM Valuation      │
│                │        │                    │         │                    │
│ • SEO analyzer │        │ • Schema scanner   │         │ • RaR calculator   │
│ • AEO analyzer │        │ • JSON-LD gen      │         │ • OCI calculator   │
│ • GEO analyzer │        │ • Validation       │         │ • EV/ICE signals    │
│ • AVI composite│        │ • Coverage report  │         │ • Appraisal logic   │
└────────────────┘        └────────────────────┘         └────────────────────┘
        │                           │                             │
        ▼                           ▼                             ▼
┌────────────────┐        ┌────────────────────┐         ┌────────────────────┐
│ GBP / UGC      │        │ Competitive Engine │         │ History / Events   │
│                │        │                    │         │                    │
│ • GBP health   │        │ • Market rank      │         │ • Forecast log     │
│ • Review score │        │ • Leader analysis  │         │ • Change events    │
│ • UGC velocity │        │ • Gap analysis     │         │ • Timeline          │
└────────────────┘        └────────────────────┘         └────────────────────┘
                                    │
                                    │ aggregated signals
                                    ▼
                        ┌───────────────────────────┐
                        │  Pulse Layer              │
                        │  (inside Orchestrator     │
                        │   today, or separate GPT  │
                        │   later per spec)         │
                        └───────────┬───────────────┘
                                    │
                                   JSON
                                    │
                                    ▼
                        ┌───────────────────────────┐
                        │  Pulse API Responses      │
                        │  - /api/clarity/stack     │
                        │  - /api/pulse/snapshot    │
                        │  - /api/pulse/changes     │
                        └───────────┬───────────────┘
                                    │
                                    ▼
                        ┌───────────────────────────┐
                        │  UI (Landing + Dashboard)  │
                        └───────────────────────────┘
```

---

## 🤖 Where GPTs Live

### 1. Orchestrator 3.0 GPT (Primary Brain)
- **Location**: Backend service (API route or separate service)
- **Model**: GPT-4o or Claude Sonnet 4.5 (heavy reasoning)
- **Capabilities**:
  - Tool calling
  - Multi-step reasoning
  - State management
  - Coordination of all engines
- **Tools**: See tool definitions below
- **Cost**: Higher (complex reasoning, tool calls)

### 2. Pulse GPT (Optional, Future)
- **Location**: Separate service or function
- **Model**: GPT-4o-mini or Claude Haiku (lightweight)
- **Capabilities**:
  - Narrative generation
  - Card formatting
  - Priority ranking
  - Daily digest summaries
- **Tools**: None (read-only)
- **Cost**: Lower (simple formatting, no tool calls)

### 3. Engine Models (Specialized)
- **dAI Schema Engine**: May use GPT for JSON-LD generation
- **AIM Valuation Engine**: Primarily tabular ML + guardrails
- **Clarity Engine**: Rule-based + some LLM for explanations

---

## 🛠️ Orchestrator 3.0 Tool Definitions

See `docs/ORCHESTRATOR_TOOLS.md` for complete tool schemas.

---

## 📁 Code Mapping

### Frontend (UI Layer)
```
app/
  page.tsx                          # Landing page
  dash/
    page.tsx                        # Pulse overview
    onboarding/
      page.tsx                      # Setup flow
    autopilot/
      page.tsx                      # Autopilot panel
    insights/
      ai-story/
        page.tsx                    # AI storyline

components/
  landing/
    LandingAnalyzer.tsx             # Main landing component
    DealerFlyInMap.tsx              # Mapbox fly-in
    ClarityStackPanel.tsx           # SEO/AEO/GEO/AVI
    AIIntroCard.tsx                 # Current vs improved
  dashboard/
    DashboardShell.tsx               # Layout + nav
    PulseOverview.tsx               # Pulse tiles + priority
    AutopilotPanel.tsx              # Autopilot UI
```

### Backend (API Layer)
```
app/api/
  clarity/
    stack/
      route.ts                       # Main clarity endpoint
  pulse/
    snapshot/
      route.ts                       # Pulse snapshot
    changes/
      route.ts                       # What changed feed
  ai-story/
    route.ts                         # AI storyline
  agentic/
    assist/
      route.ts                       # Agentic assist
    execute/
      route.ts                       # Action execution
    webhook/
      route.ts                       # Agent webhook
```

### Engine Layer (Future)
```
lib/engines/
  clarity/
    analyzer.ts                      # SEO/AEO/GEO/AVI
  schema/
    scanner.ts                       # Schema coverage
    generator.ts                     # JSON-LD generation
  aim/
    valuation.ts                     # RaR, OCI
  gbp/
    health.ts                        # GBP analysis
  ugc/
    reviews.ts                       # Review analysis
  competitive/
    rank.ts                          # Competitive analysis
```

---

## 🎯 Summary

**Orchestrator 3.0** = The brain that coordinates everything
**Engines** = Specialists that do specific analysis
**Pulse** = The face that explains what the brain knows
**UI** = The screens where Pulse shows up

This architecture is:
- ✅ Modular (engines can evolve independently)
- ✅ Scalable (can split Pulse GPT later)
- ✅ Testable (each engine is isolated)
- ✅ Future-proof (ready for OEM/agency white-labeling)

