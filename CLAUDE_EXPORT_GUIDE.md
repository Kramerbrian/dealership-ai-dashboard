# 🚀 Claude Export Guide

**Quick Reference:** How to create and use the Claude export bundle

---

## ⚡ One-Command Export

```bash
./export_for_claude.sh
```

**Output:**
- Creates `dealershipai_claude_export.zip` (~2-4 MB)
- Includes: `app/`, `components/`, `lib/`, `exports/`, `package.json`
- Adds `INDEX.md` and `README.md` for LLM orientation

---

## 📦 What's Included

```
claude-export/
├── app/                    # All Next.js pages and API routes
├── components/             # React components (including cinematic)
├── lib/                    # Utilities, hooks, stores
├── exports/                # Manifest and project metadata
├── package.json            # Dependencies
├── INDEX.md                # Entry points guide
└── README.md               # Claude instructions
```

---

## 🌐 Hosting Options

### Option A: Vercel API Route (Recommended) ✅

**Download Export:**
```
https://[your-vercel-url]/api/claude/download
```

**Manifest:**
```
https://[your-vercel-url]/api/claude/manifest
```

**Why API Route:**
- ✅ Works with Next.js standalone mode
- ✅ Proper Content-Type headers
- ✅ Publicly accessible (no auth required)
- ✅ Cached appropriately

**Deploy:**
```bash
# Push to git (triggers auto-deploy) or:
vercel deploy --prod
```

### Option B: GitHub Releases

```bash
git tag v3.0-claude
git push origin v3.0-claude
# Upload ZIP to release via GitHub UI
```

**URL:**
```
https://github.com/[user]/[repo]/releases/download/v3.0-claude/dealershipai_claude_export.zip
```

### Option C: Direct Upload

Upload to any public file host (Dropbox, Drive, etc.)

---

## 🤖 Claude Handoff Prompt

Copy-paste this into Claude:

```
Load project from:
https://[your-vercel-url]/api/claude/download

Manifest: https://[your-vercel-url]/api/claude/manifest

Objective:
Build a Next.js 14 cinematic landing + onboarding + dashboard bundle 
using Clerk middleware and brand-tinted motion continuity.
Use Framer Motion + Tailwind.

Output new or updated .tsx files only.
```

**Example URLs:**
- Download: `https://dealership-ai-dashboard-[hash].vercel.app/api/claude/download`
- Manifest: `https://dealership-ai-dashboard-[hash].vercel.app/api/claude/manifest`

---

## ✅ After Claude Generation

1. **Unzip Claude's output** over your repo root
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run dev server:**
   ```bash
   npm run dev
   ```
4. **Test routes:**
   - `/` → Landing page
   - `/onboarding` → Onboarding flow
   - `/dashboard/preview` → Orchestrator preview

---

## 📋 Key Entry Points (for Claude)

### Core Pages
- **Landing:** `app/(mkt)/page.tsx` - Cinematic landing with Clerk CTA
- **Onboarding:** `app/(marketing)/onboarding/page.tsx` - 5-step onboarding flow with PVR inputs
- **Dashboard Preview:** `app/(dashboard)/preview/page.tsx` - Orchestrator with cinematic sequence
- **Main Dashboard:** `app/(dashboard)/dashboard/page.tsx` - Full dashboard experience

### Infrastructure
- **Middleware:** `middleware.ts` - Clerk authentication & route protection
- **Layout:** `app/layout.tsx` - Root layout with providers (Clerk, Monitoring)

### Cinematic Components
- `components/cognitive/TronAcknowledgment.tsx` - System acknowledgment (Tron-style)
- `components/cognitive/OrchestratorReadyState.tsx` - Ready state with status grid
- `components/cognitive/PulseAssimilation.tsx` - Animated pulse data assimilation
- `components/cognitive/SystemOnlineOverlay.tsx` - Final system online confirmation

### Key Hooks & Utilities
- `lib/hooks/useBrandHue.ts` - Brand color personalization (deterministic HSL hue)
- `lib/store.ts` - Zustand store for onboarding state

### API Routes
- `app/api/save-metrics/route.ts` - Save PVR and Ad Expense PVR
- `app/api/pulse/snapshot/route.ts` - Fetch pulse data for assimilation
- `app/api/user/onboarding-complete/route.ts` - Mark onboarding complete

### Manifest
- `exports/manifest.json` - Master file map and project structure

---

## 🔄 Update Workflow

1. **Make changes** to codebase
2. **Run export script:**
   ```bash
   ./export_for_claude.sh
   ```
3. **Move zip to public folder:**
   ```bash
   mv dealershipai_claude_export.zip public/claude/
   ```
   (Or upload to GitHub releases / other hosting)
4. **Deploy to Vercel:**
   ```bash
   vercel deploy --prod
   ```
5. **Share URL with Claude** using the handoff prompt above

**Note:** The script automatically moves the zip to `public/claude/` if run from project root.

---

**Script Location:** `export_for_claude.sh`  
**Export Size:** ~2.1 MB  
**Status:** ✅ Ready for use

