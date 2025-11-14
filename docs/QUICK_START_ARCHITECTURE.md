# Quick Start: Understanding the Architecture

## 🎯 The Simple Version

**One brain (Orchestrator 3.0) talks to specialists (engines) and explains what it knows through Pulse (the face).**

---

## 🧠 The Brain: Orchestrator 3.0

**What it does:**
- Coordinates all analysis
- Calls tools to gather signals
- Formats insights for the dashboard
- Makes decisions about what matters most

**Where it lives:**
- Backend service (API route or separate service)
- Uses GPT-4o or Claude Sonnet 4.5
- Has access to all tools

**What it knows:**
- How to call each engine
- How to format Pulse cards
- How to rank priorities
- How to explain things in plain language

---

## 🔧 The Specialists: Engines

**Clarity Engine** → SEO, AEO, GEO, AVI scores
**Schema Engine** → Schema coverage and generation
**AIM Engine** → Revenue at Risk, Opportunity Cost
**GBP Engine** → Google Business Profile health
**UGC Engine** → Reviews and user content
**Competitive Engine** → Market position

**Each engine:**
- Does one thing really well
- Returns structured data
- Can be called independently
- Evolves on its own schedule

---

## 🎭 The Face: Pulse

**What it does:**
- Shows dealers what matters
- Explains things simply
- Ranks actions by impact
- Tells the story of their visibility

**Where it lives:**
- Today: Inside Orchestrator 3.0
- Later: Can be its own GPT (cheaper, faster)

**What it shows:**
- Pulse cards (tiles with scores and issues)
- Priority actions (what to fix first)
- Daily digest (small updates)

---

## 🔄 How It All Works Together

### Step 1: User enters domain
```
Landing page → User types "naplestoyota.com"
```

### Step 2: API calls Orchestrator
```
/api/clarity/stack → Orchestrator 3.0
```

### Step 3: Orchestrator calls engines
```
Orchestrator calls:
  • Clarity Engine → SEO/AEO/GEO/AVI
  • Schema Engine → Schema health
  • AIM Engine → Revenue at Risk
  • GBP Engine → GBP health
  • UGC Engine → Review score
  • Competitive Engine → Market rank
```

### Step 4: Orchestrator formats response
```
Orchestrator combines all signals
→ Formats as Pulse cards
→ Returns JSON
```

### Step 5: UI renders
```
Landing: Map + Clarity Stack + AI Intro Card
Dashboard: Pulse Tiles + Priority Actions
```

---

## 📁 Where Code Lives

### Frontend
- `app/page.tsx` → Landing page
- `app/dash/page.tsx` → Dashboard
- `components/landing/` → Landing components
- `components/dashboard/` → Dashboard components

### Backend
- `app/api/clarity/stack/route.ts` → Main API
- `app/api/pulse/snapshot/route.ts` → Pulse snapshot
- `app/api/agentic/assist/route.ts` → Orchestrator interface

### Engines (Future)
- `lib/engines/clarity/` → Clarity analysis
- `lib/engines/schema/` → Schema tools
- `lib/engines/aim/` → Valuation
- `lib/engines/gbp/` → GBP analysis
- `lib/engines/ugc/` → Reviews
- `lib/engines/competitive/` → Market analysis

---

## 🎯 Key Takeaways

1. **Orchestrator 3.0 is the brain** — it coordinates everything
2. **Engines are specialists** — each does one thing well
3. **Pulse is the face** — it explains what the brain knows
4. **UI is the screen** — where Pulse shows up

**Today:** Keep Pulse inside Orchestrator
**Later:** Split Pulse out when you need:
- More scale
- Different cost controls
- A/B testing
- Partner white-labeling

---

## 📚 Related Docs

- `ARCHITECTURE_ORCHESTRATOR_PULSE.md` → Full architecture
- `ORCHESTRATOR_TOOLS.md` → Tool definitions
- `ARCHITECTURE_DIAGRAM.md` → Visual diagrams

