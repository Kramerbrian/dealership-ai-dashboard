# Deployment Execution Plan

Based on the provided deployment guide, here's the current status and next steps:

## ✅ Already Completed

1. ✅ **Repository cloned and up-to-date**
   - Working on `main` branch
   - Latest code pulled

2. ✅ **Landing page updated**
   - `app/page.tsx` uses `HeroSection_CupertinoNolan`
   - No Clerk imports on landing page
   - Static CTA button (no Clerk hooks)

3. ✅ **SendGrid/Cheerio mostly removed**
   - Most routes cleaned
   - One remaining: `app/api/trust/scan/route.ts`

4. ✅ **Code pushed to GitHub**
   - Latest commits pushed
   - Vercel deployment triggered

---

## ⏳ Remaining Tasks

### 1. Cherry-pick Commit 443cfa3 (if needed)

The commit exists and contains:
- `AIIntroCard.tsx`, `AutopilotPanel.tsx`, `ClarityStackPanel.tsx`
- `DashboardShell.tsx`, `DealerFlyInMap.tsx`, `LandingAnalyzer.tsx`
- `PulseOverview.tsx`, `page.tsx`, `route.ts`

**Check if already applied:**
```bash
git log --oneline | grep 443cfa3
```

If not present, cherry-pick:
```bash
git fetch origin
git cherry-pick 443cfa3e1893d1173a1f7d568d417e51f3161d0f
```

---

### 2. Remove Remaining SendGrid/Cheerio Import

**File:** `app/api/trust/scan/route.ts`

**Action:** Remove or comment out any `@sendgrid/mail` or `cheerio` imports

---

### 3. Handle Mapbox (Note: You mentioned not using Mapbox)

**Current state:** `DealerFlyInMap.tsx` still uses Mapbox

**Options:**
- **A.** Remove Mapbox component entirely
- **B.** Keep but make it optional (check for env var)
- **C.** Replace with alternative map solution

**Recommendation:** Since you said Mapbox is not being used, we should remove or disable it.

---

### 4. Verify Build

```bash
npm install
npm run build
```

---

### 5. Set Environment Variables in Vercel

**Required:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_BASE_URL` (optional)

**If using Mapbox:**
- `NEXT_PUBLIC_MAPBOX_KEY`

**For Orchestrator:**
- `OPENAI_API_KEY`
- `SLACK_WEBHOOK_URL`
- `VERCEL_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 6. Final Commit and Push

```bash
git add .
git commit -m "Deploy new landing page, disable legacy routes, update dashboard and API stubs"
git push origin main
```

---

## 🎯 Quick Execution

Run this to execute all steps:

```bash
# 1. Check if commit needs cherry-picking
git log --oneline | grep 443cfa3 || git cherry-pick 443cfa3e1893d1173a1f7d568d417e51f3161d0f

# 2. Remove SendGrid/Cheerio from trust/scan
# (Will be done automatically)

# 3. Test build
npm run build

# 4. Commit and push
git add .
git commit -m "Deploy new landing page, disable legacy routes, update dashboard and API stubs"
git push origin main
```

---

## 📋 Verification Checklist

After deployment:

- [ ] Landing page loads: `https://dealershipai.com`
- [ ] Dashboard accessible: `https://dash.dealershipai.com`
- [ ] Onboarding works: `/dash/onboarding`
- [ ] AI Story page: `/dash/insights/ai-story`
- [ ] Autopilot page: `/dash/autopilot`
- [ ] No build errors in Vercel logs
- [ ] All environment variables set

---

**Ready to execute?** Let me know and I'll proceed with the remaining tasks.

