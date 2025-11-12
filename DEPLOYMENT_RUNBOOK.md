# Deployment Runbook - 100% Completion Guide

## 🎯 Mission: Deploy Cupertino × ChatGPT Fusion to Production

This runbook will take you from current state to 100% production deployment with all features live.

---

## 📋 Pre-Deployment Checklist

### 1. Code Status
- ✅ PulseInbox component created
- ✅ Design tokens resolved
- ✅ Settings modal integrated
- ✅ Voice Orb with PG easter eggs
- ✅ Middleware configured for Clerk v5
- ✅ TypeScript build passing
- ✅ All dependencies installed

### 2. Build Verification
```bash
# Run production build
npm run build

# Expected output:
# ✓ Compiled successfully
# Route (app)                              Size     First Load JS
# ├ ○ /                                    ...      ...
# ├ ○ /dashboard/cognitive                 ...      ...
# └ ...
```

### 3. Environment Variables Check
```bash
# Run verification script
./scripts/verify-env.sh

# Expected output:
# ✅ VERIFICATION PASSED
# All required environment variables are set.
```

---

## 🚀 Deployment Steps

### Phase 1: Environment Setup (15 minutes)

#### Step 1.1: Configure Vercel Environment Variables

**Navigate to:** https://vercel.com/your-project/settings/environment-variables

**Add the following REQUIRED variables:**

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
```

**For each variable:**
1. Click "Add New"
2. Enter Name and Value
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click "Save"

**Add OPTIONAL variables (recommended):**

```bash
# AI Features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Review Aggregation
GOOGLE_PLACES_API_KEY=AIza...
YELP_API_KEY=...

# Monitoring
SENTRY_DSN=https://...
LOGTAIL_SOURCE_TOKEN=...
```

#### Step 1.2: Configure Clerk Dashboard

**Navigate to:** https://dashboard.clerk.com/apps/[your-app]

**Set URLs:**
1. Go to "Paths" section
2. Set **Sign-in URL:** `https://dash.dealershipai.com/sign-in`
3. Set **Sign-up URL:** `https://dash.dealershipai.com/sign-up`
4. Set **Home URL:** `https://dash.dealershipai.com/dashboard`
5. Add **Redirect URLs:**
   - `https://dash.dealershipai.com/*`
   - `https://dash.dealershipai.com/dashboard/*`

**Enable Social Providers (optional):**
- Google OAuth
- GitHub OAuth
- Microsoft OAuth

---

### Phase 2: Domain Configuration (20 minutes)

#### Step 2.1: Configure Vercel Domains

**Navigate to:** https://vercel.com/your-project/settings/domains

**Add Marketing Domain:**
1. Click "Add Domain"
2. Enter: `dealershipai.com`
3. Click "Add"
4. Copy the DNS records shown

**Add Dashboard Domain:**
1. Click "Add Domain"
2. Enter: `dash.dealershipai.com`
3. Click "Add"
4. Copy the DNS records shown

#### Step 2.2: Configure DNS (Squarespace)

**Navigate to:** https://account.squarespace.com/domains

**Select your domain** → DNS Settings

**Add records for dealershipai.com:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**Add records for dash.dealershipai.com:**
```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: Auto
```

**Save changes** and wait 5-10 minutes for propagation.

#### Step 2.3: Verify DNS Propagation

```bash
# Check main domain
dig dealershipai.com A +short
# Expected: 76.76.21.21

# Check dashboard subdomain
dig dash.dealershipai.com CNAME +short
# Expected: cname.vercel-dns.com
```

---

### Phase 3: Deploy to Production (10 minutes)

#### Step 3.1: Deploy via Vercel

**Option A: Deploy via CLI**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Expected output:
# ✅ Production: https://dealershipai.com [copied to clipboard]
```

**Option B: Deploy via GitHub**
```bash
# Commit all changes
git add .
git commit -m "feat: Cupertino × ChatGPT fusion complete with Voice Orb"

# Push to main branch
git push origin main

# Vercel will auto-deploy
# Check status at https://vercel.com/your-project
```

#### Step 3.2: Monitor Deployment

**Navigate to:** https://vercel.com/your-project/deployments

**Watch for:**
- ✅ Build: Running → Completed
- ✅ Checks: All passed
- ✅ Domains: Assigned correctly

**Check build logs:**
- No TypeScript errors
- No module not found errors
- All routes compiled successfully

---

### Phase 4: Post-Deployment Verification (15 minutes)

#### Step 4.1: Automated Tests

```bash
# Run deployment verification script
./scripts/verify-deployment.sh https://dealershipai.com https://dash.dealershipai.com

# Expected output:
# ✅ VERIFICATION PASSED
# All tests passed! Deployment is working correctly.
```

#### Step 4.2: Manual Testing

**Marketing Domain (dealershipai.com):**

1. **Landing Page**
   - Visit: https://dealershipai.com
   - ✅ Page loads without errors
   - ✅ No authentication required
   - ✅ All sections visible

2. **Pricing Page**
   - Visit: https://dealershipai.com/pricing
   - ✅ Plans display correctly
   - ✅ CTA buttons work

3. **Claude Export**
   - Visit: https://dealershipai.com/claude
   - ✅ QR code displays
   - ✅ Download button works
   - ✅ Manifest accessible

4. **API Endpoints**
   - Visit: https://dealershipai.com/api/health
   - ✅ Returns: `{"status":"ok"}`

**Dashboard Domain (dash.dealershipai.com):**

1. **Sign-In Flow**
   - Visit: https://dash.dealershipai.com/dashboard
   - ✅ Redirects to /sign-in
   - ✅ Sign-in form displays
   - ✅ Can sign in with test account
   - ✅ Redirects to /dashboard after auth

2. **Cognitive Dashboard**
   - Visit: https://dash.dealershipai.com/dashboard/cognitive
   - ✅ Page loads (requires auth)
   - ✅ Drive mode shows incidents (seed data)
   - ✅ Mode switcher works (Drive/Autopilot/Insights/Pulse)
   - ✅ Clarity score displays

3. **Voice Orb**
   - Long-press the orb (bottom-right)
   - ✅ Speech bubble appears
   - ✅ Neutral coach line shows (~90% probability)
   - ✅ Refresh and try again → Easter egg appears (~10% probability)
   - ✅ Sound plays (if audio enabled)
   - ✅ Haptic feedback (mobile only)

4. **Settings Modal**
   - Click Settings button (gear icon in header)
   - ✅ Modal opens with smooth animation
   - ✅ "Enable PG Easter Eggs" toggle visible
   - ✅ Guardrails panel shows correct info
   - ✅ Toggle OFF → Long-press orb → Only neutral lines
   - ✅ Toggle ON → Long-press orb → Easter eggs return
   - ✅ Refresh page → Preference persists

5. **Pulse Mode**
   - Click "Pulse" in mode switcher
   - ✅ Live event feed displays
   - ✅ 4 seed events visible
   - ✅ Color-coded urgency badges
   - ✅ Auto-scroll to latest

6. **Drive Mode (Triage)**
   - Click "Drive" in mode switcher
   - ✅ 8 incidents display
   - ✅ Sorted by priority
   - ✅ Three-tier buttons (DIY, Auto-Fix, DFY)
   - ✅ Click Auto-Fix → Incident resolves → Toast appears
   - ✅ Pulse event added to stream

---

### Phase 5: Monitoring Setup (10 minutes)

#### Step 5.1: Enable Vercel Analytics

1. Navigate to: https://vercel.com/your-project/analytics
2. Click "Enable Analytics"
3. Verify data collection starts

#### Step 5.2: Configure Sentry (if SENTRY_DSN set)

1. Navigate to: https://sentry.io/your-project
2. Verify source maps uploading
3. Test error tracking:
   ```bash
   # Trigger test error
   curl https://dash.dealershipai.com/api/test-error
   ```
4. Check Sentry dashboard for captured error

#### Step 5.3: Monitor Logs

```bash
# Stream production logs
vercel logs --follow

# Expected output:
# [timestamp] GET /api/health 200
# [timestamp] GET /dashboard/cognitive 200
# [timestamp] POST /api/pulse/events 200
```

---

## 🎯 Success Criteria

Your deployment is **100% complete** when:

### ✅ Infrastructure
- [x] Both domains (dealershipai.com + dash.dealershipai.com) resolve correctly
- [x] SSL certificates issued and active
- [x] Environment variables set in Vercel
- [x] Clerk authentication configured
- [x] DNS propagated fully

### ✅ Marketing Site
- [x] Landing page accessible without auth
- [x] Pricing page loads correctly
- [x] Claude export downloadable
- [x] All API health endpoints return 200

### ✅ Dashboard Application
- [x] Sign-in flow working
- [x] Protected routes require authentication
- [x] Dashboard loads after sign-in
- [x] All modes accessible (Drive, Autopilot, Insights, Pulse)

### ✅ Cognitive Dashboard Features
- [x] Drive mode shows prioritized incidents
- [x] Pulse mode displays live event feed
- [x] Voice Orb interactive (tap, long-press)
- [x] Settings modal opens and saves preferences
- [x] PG easter eggs work with scarcity gating (≤10%)
- [x] Neutral coach lines as primary experience (90%)
- [x] Sound + haptic feedback functional
- [x] Preference persistence across refreshes

### ✅ Security & Performance
- [x] Middleware correctly protects routes
- [x] Public routes accessible without auth
- [x] No CORS errors
- [x] No console errors
- [x] Build completed successfully
- [x] No TypeScript errors

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors during build

**Cause:** Missing dependencies in node_modules

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Middleware loops (too many redirects)

**Cause:** Public route not properly configured

**Fix:**
1. Check `middleware.ts` → `publicRoutes` array
2. Check Clerk options → `publicRoutes` array
3. Ensure route appears in BOTH lists

### Issue: Voice Orb not showing easter eggs

**Cause:** Preferences not hydrated or disabled

**Debug:**
```javascript
// In browser console
localStorage.getItem('dai:prefs:v1')
// Expected: {"state":{"agentEnabled":true,...},"version":1}
```

**Fix:**
1. Open Settings → Enable PG Easter Eggs
2. Clear localStorage and try again
3. Check browser console for hydration errors

### Issue: Dashboard shows "Not authorized"

**Cause:** Clerk environment variables not set

**Fix:**
1. Verify variables in Vercel dashboard
2. Check Clerk dashboard → API Keys
3. Redeploy after setting variables

### Issue: DNS not resolving

**Cause:** Propagation delay or incorrect records

**Fix:**
1. Wait 5-10 minutes for propagation
2. Verify DNS records in Squarespace
3. Use `dig` command to test:
   ```bash
   dig dash.dealershipai.com +short
   ```

---

## 📊 Monitoring Checklist

After deployment, monitor these metrics:

### Day 1 (First 24 Hours)
- [ ] Check error rate in Sentry
- [ ] Verify auth success rate in Clerk dashboard
- [ ] Monitor API response times in Vercel Analytics
- [ ] Check build logs for warnings
- [ ] Test from different devices/browsers

### Week 1
- [ ] Review user sign-up funnel
- [ ] Check Voice Orb interaction rate
- [ ] Monitor incident resolution patterns
- [ ] Verify localStorage persistence across browsers
- [ ] Check mobile responsiveness

### Ongoing
- [ ] Weekly Vercel analytics review
- [ ] Monthly dependency updates (`npm outdated`)
- [ ] Quarterly security audit
- [ ] Monitor Clerk pricing (users, MAUs)
- [ ] Track Supabase usage (storage, queries)

---

## 🎉 Next Steps After 100% Deployment

### Phase 2 Enhancements (Future)
1. **Real API Integration**
   - Replace seed data with live Supabase queries
   - Implement SSE for real-time pulse stream
   - Add webhook endpoints for auto-fix deployments

2. **Advanced Voice Features**
   - Web Speech API for voice input
   - Context-aware quotes (match incident type)
   - Celebration sequences (3+ resolutions)

3. **Team Collaboration**
   - DFY assignment workflow
   - Multi-user incident ownership
   - Real-time sync across tabs
   - Notification system

4. **Analytics & Insights**
   - Track incident resolution time
   - Monitor easter egg engagement
   - A/B test scarcity percentages
   - User preference analytics

---

## 📞 Support & Resources

**Documentation:**
- [CUPERTINO_CHATGPT_FUSION.md](CUPERTINO_CHATGPT_FUSION.md) - Architecture
- [VOICE_ORB_IMPLEMENTATION.md](VOICE_ORB_IMPLEMENTATION.md) - Voice Orb guide
- [SETTINGS_INTEGRATION_COMPLETE.md](SETTINGS_INTEGRATION_COMPLETE.md) - Settings
- [MIDDLEWARE_DEPLOYMENT_CHECKLIST.md](MIDDLEWARE_DEPLOYMENT_CHECKLIST.md) - Middleware

**Scripts:**
- `./scripts/verify-env.sh` - Check environment variables
- `./scripts/verify-deployment.sh` - Test deployment
- `npm run build` - Production build
- `npm run dev` - Local development

**External Resources:**
- Vercel Dashboard: https://vercel.com/dashboard
- Clerk Dashboard: https://dashboard.clerk.com
- Supabase Dashboard: https://app.supabase.com

---

## ✅ Final Sign-Off

When all items above are complete, you've achieved **100% deployment**!

**Celebrate by:**
1. Testing the Voice Orb easter eggs
2. Resolving a few incidents in Drive mode
3. Watching the Pulse stream update in real-time
4. Sharing the dashboard with your team

🚀 **Deployment Status: COMPLETE**

---

**Deployed by:** [Your Name]
**Date:** [Deployment Date]
**Version:** 1.0.0 - Cupertino × ChatGPT Fusion
**Features:** Drive Mode, Pulse Stream, Voice Orb, PG Easter Eggs, Settings Persistence
