# ⚡ Claude Export - Quick Start

## 🎯 3 Ways to Use (Pick One)

### Option 1: Use with Claude ⭐ (30 seconds)

Copy & paste into Claude:

```
Load project from https://dealership-ai-dashboard-pfkuf9x7p-brian-kramer-dealershipai.vercel.app/claude/dealershipai_claude_export.zip

Manifest: /exports/manifest.json

Build cinematic Next.js 14 interface with Clerk + Framer Motion.
Use the cognitive interface patterns in components/cognitive/*.
Maintain brand hue continuity using the useBrandHue hook.
```

Then ask Claude to help you build!

---

### Option 2: Set Up Auto-Export (5 minutes)

Your Vercel IDs:
- ORG_ID: `team_bL2iJEcPCFg7kKTo6T2Ajwi4`
- PROJECT_ID: `prj_OenY0LJkWxuHWo5aJk0RaaFndjg5`

Steps:
1. Get token: https://vercel.com/account/tokens
2. Add 3 secrets: https://github.com/Kramerbrian/dealership-ai-dashboard/settings/secrets/actions
   - VERCEL_TOKEN = [your token]
   - VERCEL_ORG_ID = team_bL2iJEcPCFg7kKTo6T2Ajwi4
   - VERCEL_PROJECT_ID = prj_OenY0LJkWxuHWo5aJk0RaaFndjg5
3. Test: `git tag v3.0.1-test && git push origin v3.0.1-test`

---

### Option 3: Manual Export (3 minutes)

```bash
./scripts/export-for-claude.sh
npx vercel --prod --yes
```

---

## 📚 Full Docs

- CLAUDE_EXPORT_COMPLETE.md - Complete guide ⭐
- GITHUB_ACTIONS_SETUP.md - Automation details
- AUTOMATION_COMPLETE.md - Features overview

---

🎊 Pick an option and start! Recommended: Try Claude prompt now! 🚀
