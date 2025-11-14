# DealershipAI Architecture Diagram

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Landing    │  │  Dashboard   │  │  Autopilot   │                 │
│  │   Page       │  │  /dash       │  │  /autopilot  │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                              │
└────────────────────────────┼──────────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ /api/clarity/    │  │ /api/pulse/     │  │ /api/agentic/    │   │
│  │ stack            │  │ snapshot        │  │ assist           │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                      │                      │              │
└───────────┼──────────────────────┼──────────────────────┼──────────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                                   │ Orchestrates
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR 3.0 (GPT)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  System Prompt:                                                  │  │
│  │  "You coordinate all dealership intelligence. Use tools to      │  │
│  │   gather signals and format insights for Pulse."                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Tool Calling Layer                                              │  │
│  │  • clarity_stack(domain)                                        │  │
│  │  • schema_health(domain)                                        │  │
│  │  • aim_valuation(domain)                                        │  │
│  │  • gbp_health(domain)                                           │  │
│  │  • ugc_health(domain)                                           │  │
│  │  • competitive_summary(domain)                                 │  │
│  │  • location_resolve(domain)                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Pulse Formatting (Today: Inside Orchestrator)                   │  │
│  │  (Future: Separate Pulse GPT)                                    │  │
│  │  • Generates pulse_cards[]                                       │  │
│  │  • Generates priority_stack[]                                    │  │
│  │  • Generates daily_digest[]                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                │ Tool Calls
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ENGINE LAYER                                    │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ Clarity Engine   │  │ Schema Engine    │  │ AIM Engine       │      │
│  │                  │  │                  │  │                  │      │
│  │ • SEO analyzer   │  │ • Scanner        │  │ • RaR calc       │      │
│  │ • AEO analyzer   │  │ • Generator      │  │ • OCI calc       │      │
│  │ • GEO analyzer   │  │ • Validator      │  │ • EV/ICE signals │      │
│  │ • AVI composite  │  │ • Coverage       │  │ • Appraisal      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ GBP/UGC Engine   │  │ Competitive     │  │ Location Engine  │      │
│  │                  │  │ Engine          │  │                  │      │
│  │ • GBP health     │  │ • Market rank   │  │ • Geo resolve    │      │
│  │ • Review score   │  │ • Leader analysis│  │ • DMA mapping    │      │
│  │ • UGC velocity   │  │ • Gap analysis  │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

### 1. Landing Page Request
```
User → LandingAnalyzer → GET /api/clarity/stack?domain=...
```

### 2. API Route Processing
```
/api/clarity/stack/route.ts
  → Calls Orchestrator 3.0
  → Orchestrator calls tools
  → Returns unified JSON
```

### 3. Orchestrator Tool Execution
```
Orchestrator 3.0
  ├─ tool:clarity_stack(domain)
  ├─ tool:schema_health(domain)
  ├─ tool:aim_valuation(domain)
  ├─ tool:gbp_health(domain)
  ├─ tool:ugc_health(domain)
  ├─ tool:competitive_summary(domain)
  └─ tool:location_resolve(domain)
```

### 4. Response Formatting
```
Orchestrator aggregates → Formats as Pulse → Returns JSON
```

### 5. UI Rendering
```
Landing: Map + Clarity Stack + AI Intro Card
Dashboard: Pulse Tiles + Priority Actions
```

---

## Component Mapping

### Frontend Components
- `LandingAnalyzer` → Calls `/api/clarity/stack`
- `PulseOverview` → Calls `/api/clarity/stack` or `/api/pulse/snapshot`
- `AutopilotPanel` → Calls `/api/agentic/assist`
- `AIIntroCard` → Uses `ai_intro_current` + `ai_intro_improved` from API

### Backend Routes
- `/api/clarity/stack` → Main entry point
- `/api/pulse/snapshot` → Pulse-formatted snapshot
- `/api/agentic/assist` → Orchestrator 3.0 interface
- `/api/ai-story` → AI storyline history

### Engine Services
- `lib/engines/clarity/` → SEO/AEO/GEO/AVI
- `lib/engines/schema/` → Schema analysis + generation
- `lib/engines/aim/` → Valuation + RaR/OCI
- `lib/engines/gbp/` → GBP health
- `lib/engines/ugc/` → Reviews + UGC
- `lib/engines/competitive/` → Market analysis

---

## Future Architecture (When Splitting Pulse)

```
Today:
  Orchestrator 3.0 → [tools] → [Pulse formatting] → JSON

Future:
  Orchestrator 3.0 → [tools] → aggregated signals
                                    ↓
                            Pulse GPT (separate)
                                    ↓
                              Pulse JSON
```

This allows:
- Independent evolution of Pulse voice
- Different rate limits
- Cost optimization
- A/B testing
- Partner white-labeling

