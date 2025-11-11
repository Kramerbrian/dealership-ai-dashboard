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

### Option A: Vercel Static (Recommended)

```bash
# Export is already in public/claude/
# Just deploy:
vercel deploy --prod
```

**URL:**
```
https://dealership-ai-dashboard-[hash].vercel.app/claude/dealershipai_claude_export.zip
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
https://[your-domain]/claude/dealershipai_claude_export.zip

Manifest: /exports/manifest.json

Objective:
Build a Next.js 14 cinematic landing + onboarding + dashboard bundle 
using Clerk middleware and brand-tinted motion continuity.
Use Framer Motion + Tailwind.

Output new or updated .tsx files only.
```

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

- **Landing:** `app/(mkt)/page.tsx`
- **Onboarding:** `app/(marketing)/onboarding/page.tsx`
- **Dashboard:** `app/(dashboard)/preview/page.tsx`
- **Middleware:** `middleware.ts`
- **Layout:** `app/layout.tsx`

**Cinematic Components:**
- `components/cognitive/TronAcknowledgment.tsx`
- `components/cognitive/OrchestratorReadyState.tsx`
- `components/cognitive/PulseAssimilation.tsx`
- `components/cognitive/SystemOnlineOverlay.tsx`

**Hooks:**
- `lib/hooks/useBrandHue.ts` (brand personalization)

**Manifest:**
- `exports/manifest.json` (master file map)

---

## 🔄 Update Workflow

1. Make changes to codebase
2. Run `./export_for_claude.sh`
3. Move zip to `public/claude/` (or upload to hosting)
4. Deploy to make it publicly accessible
5. Share URL with Claude

---

**Script Location:** `export_for_claude.sh`  
**Export Size:** ~2.1 MB  
**Status:** ✅ Ready for use

