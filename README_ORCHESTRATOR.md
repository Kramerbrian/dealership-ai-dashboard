# DealershipAI Orchestrator 3.0 — Cursor Import

## 🚀 Quick Start

```bash
npm run dev
```

Visit `/onboarding` to experience the cinematic onboarding flow.

## 🎬 Cinematic Onboarding Flow

1. **Form Collection** → Collects PVR, Ad Expense, Role
2. **Nolan Acknowledgment** → Christopher Nolan-style transition sequence
3. **Orchestrator Ready State** → Dashboard boot-up with progress indicators
4. **Pulse Assimilation** → Dissolve into live dashboard grid
5. **System Online** → Final confirmation overlay

## 📁 Project Structure

```
app/
├── onboarding/
│   └── page.tsx              # Main onboarding page
├── preview/
│   └── orchestrator/
│       └── page.tsx           # Dashboard preview
├── components/
│   ├── NolanAcknowledgment.tsx
│   ├── OrchestratorReadyState.tsx
│   ├── PulseAssimilation.tsx
│   ├── SystemOnlineOverlay.tsx
│   └── MotionOrchestrator.tsx
└── api/
    ├── marketpulse/
    │   └── compute/
    │       └── route.ts       # KPI computation endpoint
    └── save-metrics/
        └── route.ts           # Metrics persistence

lib/
├── hooks/
│   └── useBrandTint.ts        # Clerk-aware brand tint hook
├── store/
│   ├── prefs.ts               # User preferences (PG toggle, etc.)
│   └── cognitive.ts          # Triage + pulse state
└── utils/
    └── brandHue.ts            # Deterministic hue generator
```

## 🎨 Brand Hue System

The brand hue is deterministically generated from:
- Organization ID (if available)
- User ID (fallback)
- Default seed

This ensures consistent color identity across all cinematic components.

## 🔧 API Endpoints

### `GET /api/marketpulse/compute`
Computes market pulse KPIs:
- VAI (AI Visibility Index)
- PIQR (Perplexity Inclusion Quality Rate)
- HRP (Hallucination Risk Probability)
- QAI (Query Answerability Index)

**Query Params:**
- `dealerId` (optional)
- `pvr` (Monthly Vehicle Revenue)
- `adExpense` (optional)

### `POST /api/save-metrics`
Saves onboarding metrics to Clerk metadata:
- `pvr` (required)
- `adExpensePvr` (required)

## 🎯 Features

- ✅ Cinematic onboarding with Framer Motion
- ✅ Brand-aware color system
- ✅ Real-time KPI computation
- ✅ Persisted user preferences
- ✅ Pulse state management
- ✅ Clerk authentication integration

## 🚢 Deploy

```bash
vercel --prod
```

Deploys to your Vercel project (e.g., `dash.dealershipai.com`).

## 📝 Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## 🎭 Customization

- **Colors**: Modify `lib/utils/brandHue.ts` to change hue generation
- **Transitions**: Adjust timing in `app/onboarding/page.tsx`
- **KPIs**: Update computation logic in `app/api/marketpulse/compute/route.ts`

---

Built with Next.js 14, TypeScript, Framer Motion, and Clerk.

