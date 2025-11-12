# 🚀 100% Deployment Checklist

## Status: Pre-Deployment (Build Errors Need Fixing)

This checklist identifies **everything** needed to deploy the DealershipAI dashboard to production with 100% confidence.

---

## 🔴 CRITICAL: Build Errors (Must Fix First)

### 1. Missing Component: PulseInbox
**Error:** `Module not found: Can't resolve '@/components/pulse/PulseInbox'`

**Files Affected:**
- `app/(dashboard)/dashboard/page.tsx:19`
- `components/dashboard/CinematicDashboard.tsx:14`

**Options:**
- **Option A:** Create `components/pulse/PulseInbox.tsx` component
- **Option B:** Comment out imports and usages (if not critical for MVP)
- **Option C:** Replace with existing `components/modes/PulseStream.tsx`

**Recommendation:** Option B (comment out) unless Pulse Inbox is critical for Alpha launch

---

### 2. Missing Dependencies
**Errors:** Module not found for multiple packages

| Package | Used In | Critical? | Action |
|---------|---------|-----------|--------|
| `@sentry/nextjs` | `lib/monitoring/sentry.ts` | ⚠️ Yes (monitoring) | Already installed - check imports |
| `@vercel/analytics/react` | `app/layout.tsx` | ⚠️ Yes (analytics) | Install: `npm i @vercel/analytics` |
| `jsonwebtoken` | `lib/authz-unified.ts` | ⚠️ Yes (auth) | Install: `npm i jsonwebtoken @types/jsonwebtoken` |
| `googleapis` | `lib/google-apis.ts` | 🟡 No (optional) | Install OR comment out if not used |

**Commands to Run:**
```bash
# Install missing packages
npm install @vercel/analytics jsonwebtoken googleapis
npm install -D @types/jsonwebtoken

# Verify build
npm run build
```

---

### 3. Next.js Config Warning
**Warning:** `Invalid next.config.js options detected: 'serverExternalPackages'`

**Fix:** Update `next.config.js` to use correct syntax for Next.js 14

```javascript
// OLD (Next.js 13):
experimental: {
  serverExternalPackages: ['...']
}

// NEW (Next.js 14):
serverComponentsExternalPackages: ['...']
```

---

## ✅ Pre-Deployment Checklist

### Phase 1: Code Quality

- [ ] **Fix build errors above** (critical)
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` with no errors
- [ ] Run `npm run type-check` with no errors
- [ ] All tests passing: `npm run test`

---

### Phase 2: Environment Variables

#### Required for Production

| Variable | Purpose | Where to Get | Status |
|----------|---------|--------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Supabase dashboard | ❓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | Supabase dashboard | ❓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access | Supabase dashboard → Settings → API | ❓ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth (client) | Clerk dashboard | ❓ |
| `CLERK_SECRET_KEY` | Auth (server) | Clerk dashboard | ❓ |
| `DATABASE_URL` | Postgres connection | Supabase pooler URL | ❓ |
| `DIRECT_URL` | Direct Postgres | Supabase direct URL | ❓ |

#### Optional (Analytics & Monitoring)

| Variable | Purpose | Required? | Status |
|----------|---------|-----------|--------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | 🟡 Recommended | ❓ |
| `SENTRY_DSN` | Error tracking | 🟡 Recommended | ❓ |
| `SENTRY_AUTH_TOKEN` | Sentry uploads | 🟡 Recommended | ❓ |
| `VERCEL_ANALYTICS_ID` | Vercel analytics | 🟡 Auto-generated | ✅ |

#### Optional (API Integrations)

| Variable | Purpose | Required? | Status |
|----------|---------|-----------|--------|
| `OPENAI_API_KEY` | AI features | 🟢 Optional | ❓ |
| `ANTHROPIC_API_KEY` | Claude AI | 🟢 Optional | ❓ |
| `GOOGLE_PLACES_API_KEY` | Maps integration | 🟢 Optional | ❓ |
| `GOOGLE_API_KEY` | Google APIs | 🟢 Optional | ❓ |

#### Commands to Verify

```bash
# Check local .env.local
cat .env.local | grep -E "SUPABASE|CLERK|DATABASE"

# Verify Vercel env vars (after deployment)
npx vercel env ls

# Pull Vercel env vars to local
npx vercel env pull .env.production.local
```

---

### Phase 3: Database Setup

#### Supabase Production Database

- [ ] **Create production Supabase project**
  - Go to https://supabase.com/dashboard
  - Click "New Project"
  - Choose region (closest to users)
  - Note down connection strings

- [ ] **Apply all migrations**
  ```bash
  # Link to production project
  npx supabase link --project-ref YOUR_PROJECT_REF

  # Push migrations
  npx supabase db push
  ```

- [ ] **Verify tables created**
  - Open Supabase Studio → Table Editor
  - Check for:
    - `users` (auth)
    - `dealers` (core data)
    - `dealership_locations` (multi-location)
    - `pulse_cards` (decision inbox)
    - `pulse_threads` (event correlation)
    - `analytics_events` (tracking)

- [ ] **Set up Row-Level Security (RLS)**
  ```sql
  -- Enable RLS on all tables
  ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE dealership_locations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE pulse_cards ENABLE ROW LEVEL SECURITY;

  -- Create policies (see supabase/migrations for full policies)
  ```

- [ ] **Seed initial data (if needed)**
  ```bash
  node scripts/seed-production.js
  ```

---

### Phase 4: Authentication (Clerk)

#### Clerk Production Setup

- [ ] **Create production Clerk application**
  - Go to https://clerk.com/dashboard
  - Click "Add Application"
  - Choose "Next.js" template
  - Note down API keys

- [ ] **Configure domains**
  - Production URL: `https://dealershipai.com`
  - Dashboard URL: `https://dash.dealershipai.com`
  - Add to Clerk → Settings → Domains

- [ ] **Set up user metadata schema**
  ```typescript
  {
    publicMetadata: {
      role: "admin" | "user",
      dealershipId: string,
      domain: string
    }
  }
  ```

- [ ] **Configure webhooks (if used)**
  - Go to Clerk → Webhooks
  - Add endpoint: `https://dash.dealershipai.com/api/webhooks/clerk`
  - Select events: `user.created`, `user.updated`

---

### Phase 5: Vercel Deployment

#### Pre-Deployment

- [ ] **Install Vercel CLI**
  ```bash
  npm i -g vercel
  ```

- [ ] **Link project to Vercel**
  ```bash
  vercel link
  ```

- [ ] **Set environment variables in Vercel**
  ```bash
  # Option 1: Via CLI
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add SUPABASE_SERVICE_ROLE_KEY production
  # ... add all vars

  # Option 2: Via dashboard
  # Go to Vercel dashboard → Project → Settings → Environment Variables
  ```

#### Deployment Steps

- [ ] **Deploy to preview first**
  ```bash
  vercel
  ```

- [ ] **Test preview deployment**
  - Visit preview URL
  - Test auth flow (sign up, sign in, sign out)
  - Test dashboard load
  - Check console for errors
  - Test API endpoints: `/api/health`

- [ ] **Deploy to production**
  ```bash
  vercel --prod
  ```

- [ ] **Verify production deployment**
  - Visit `https://dealershipai.com` or `https://dash.dealershipai.com`
  - Smoke test all critical features
  - Check monitoring dashboards (Sentry, Vercel Analytics)

---

### Phase 6: Domain Configuration

#### DNS Setup

- [ ] **Point domains to Vercel**
  - Vercel dashboard → Domains → Add Domain
  - Add `dealershipai.com` and `dash.dealershipai.com`
  - Follow DNS instructions (A record + CNAME)

- [ ] **Configure HTTPS**
  - Vercel handles SSL automatically
  - Verify certificate: `https://www.ssllabs.com/ssltest/`

- [ ] **Set up redirects**
  ```javascript
  // next.config.js
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  }
  ```

---

### Phase 7: Monitoring & Observability

#### Sentry Setup

- [ ] **Create Sentry project**
  - Go to https://sentry.io
  - Create new project (Next.js)
  - Note down DSN

- [ ] **Add Sentry to Vercel**
  ```bash
  vercel env add SENTRY_DSN production
  vercel env add SENTRY_AUTH_TOKEN production
  ```

- [ ] **Verify error tracking**
  - Trigger test error: Visit `/api/test-error`
  - Check Sentry dashboard for event

#### Vercel Analytics

- [ ] **Enable Vercel Analytics**
  - Vercel dashboard → Analytics → Enable
  - Verify events flowing in

- [ ] **Set up custom events (optional)**
  ```typescript
  import { track } from '@vercel/analytics';

  track('dashboard_loaded', { userId: user.id });
  ```

#### Logging

- [ ] **Configure log drains**
  - Vercel dashboard → Integrations → Log Drains
  - Options: Datadog, LogDNA, Better Stack

---

### Phase 8: Performance Optimization

#### Build Optimization

- [ ] **Analyze bundle size**
  ```bash
  npm run build -- --analyze
  ```

- [ ] **Optimize images**
  - Use Next.js `<Image>` component
  - Configure `next.config.js`:
    ```javascript
    images: {
      formats: ['image/avif', 'image/webp'],
      domains: ['your-cdn.com'],
    }
    ```

- [ ] **Enable caching**
  ```javascript
  // app/layout.tsx
  export const revalidate = 3600; // ISR: revalidate every hour
  ```

#### Runtime Performance

- [ ] **Optimize API routes**
  - Add response caching headers
  - Use edge runtime where possible
    ```typescript
    export const runtime = 'edge';
    ```

- [ ] **Database query optimization**
  - Add indexes (see `db/migrations/0019_performance_indexes.sql`)
  - Use connection pooling (Supabase pooler)

---

### Phase 9: Security Checklist

- [ ] **Enable HTTPS only**
  - Vercel → Settings → Force HTTPS: ON

- [ ] **Configure CSP headers**
  ```javascript
  // next.config.js
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.clerk.com; ...",
          },
        ],
      },
    ];
  }
  ```

- [ ] **Review API route security**
  - All routes check authentication
  - Use Clerk's `auth()` helper
  - Validate input with Zod

- [ ] **Enable rate limiting**
  - Use Vercel Edge Config or Upstash Redis
  - Limit API routes to 100 req/min per IP

- [ ] **Audit dependencies**
  ```bash
  npm audit
  npm audit fix
  ```

---

### Phase 10: Final Testing

#### Smoke Tests

- [ ] **Authentication**
  - [ ] Sign up new user
  - [ ] Sign in existing user
  - [ ] Sign out
  - [ ] Password reset

- [ ] **Dashboard**
  - [ ] Dashboard loads without errors
  - [ ] Data displays correctly
  - [ ] Voice Orb works (long-press)
  - [ ] Preferences modal opens (Settings icon)

- [ ] **API Endpoints**
  - [ ] `/api/health` returns 200
  - [ ] `/api/auth/session` works
  - [ ] `/api/dashboard/metrics` returns data

- [ ] **Mobile Responsiveness**
  - [ ] Test on mobile device or DevTools
  - [ ] Dashboard is usable on phone
  - [ ] No horizontal scroll

#### Load Testing

- [ ] **Run load tests**
  ```bash
  # Using Artillery or k6
  artillery quick --count 100 --num 10 https://dash.dealershipai.com
  ```

- [ ] **Monitor during load test**
  - Vercel dashboard → Analytics
  - Check response times
  - Check error rates

---

### Phase 11: Documentation

- [ ] **Update README.md**
  - Deployment instructions
  - Environment variables list
  - API documentation links

- [ ] **Create runbook**
  - How to deploy
  - How to rollback
  - Common troubleshooting steps

- [ ] **Document architecture**
  - [POP_CULTURE_AGENT_ARCHITECTURE.md](POP_CULTURE_AGENT_ARCHITECTURE.md) ✅
  - [PREFERENCES_INTEGRATION_COMPLETE.md](PREFERENCES_INTEGRATION_COMPLETE.md) ✅
  - API documentation (Swagger/OpenAPI)

---

### Phase 12: Post-Deployment Monitoring

#### First 24 Hours

- [ ] **Monitor error rates**
  - Sentry dashboard
  - Vercel logs
  - Target: <0.1% error rate

- [ ] **Monitor performance**
  - Vercel Analytics
  - Target: <2s page load time
  - Target: <100ms API response time

- [ ] **Monitor usage**
  - Active users
  - Dashboard visits
  - Feature engagement (Voice Orb, Preferences)

#### First Week

- [ ] **Review user feedback**
  - Support tickets
  - User interviews
  - Feature requests

- [ ] **Optimize based on data**
  - Slow queries
  - High error routes
  - Unused features

---

## 🎯 Quick Action Plan

### Immediate (Next 1 Hour)

1. **Fix build errors:**
   ```bash
   npm install @vercel/analytics jsonwebtoken googleapis
   npm run build
   ```

2. **Comment out PulseInbox** (if not critical):
   ```typescript
   // import PulseInbox from '@/components/pulse/PulseInbox';
   // <PulseInbox ... />
   ```

3. **Fix next.config.js** warning

### Short Term (Next 4 Hours)

4. **Set up Supabase production**
   - Create project
   - Apply migrations
   - Enable RLS

5. **Set up Clerk production**
   - Create app
   - Configure domains
   - Get API keys

6. **Deploy to Vercel preview**
   - Set env vars
   - Deploy: `vercel`
   - Test preview URL

### Medium Term (Next 24 Hours)

7. **Deploy to production**
   - `vercel --prod`
   - Configure domains
   - Enable monitoring

8. **Run smoke tests**
   - Auth flow
   - Dashboard load
   - API endpoints

9. **Monitor and optimize**
   - Watch Sentry for errors
   - Check Vercel Analytics
   - Fix any issues

---

## 📊 Deployment Scorecard

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| Build Errors | 3 | 0/3 | 🔴 Blocked |
| Code Quality | 5 | 0/5 | ⚪ Not Started |
| Environment Vars | 15 | 0/15 | ⚪ Not Started |
| Database Setup | 5 | 0/5 | ⚪ Not Started |
| Authentication | 4 | 0/4 | ⚪ Not Started |
| Vercel Deployment | 6 | 0/6 | ⚪ Not Started |
| Domain Config | 3 | 0/3 | ⚪ Not Started |
| Monitoring | 4 | 0/4 | ⚪ Not Started |
| Performance | 4 | 0/4 | ⚪ Not Started |
| Security | 5 | 0/5 | ⚪ Not Started |
| Testing | 8 | 0/8 | ⚪ Not Started |
| Documentation | 3 | 2/3 | 🟡 In Progress |
| **TOTAL** | **65** | **2/65** | **3% Complete** |

---

## 🚨 Blockers

1. **Missing PulseInbox component** - Need to decide: create, comment out, or replace
2. **Missing dependencies** - Need to install: `@vercel/analytics`, `jsonwebtoken`, `googleapis`
3. **No production Supabase** - Need to create and configure
4. **No production Clerk** - Need to create and configure
5. **No Vercel project linked** - Need to link and configure env vars

---

## ✅ Next Steps

**Run these commands NOW:**

```bash
# 1. Fix dependencies
npm install @vercel/analytics jsonwebtoken googleapis
npm install -D @types/jsonwebtoken

# 2. Test build
npm run build

# 3. If PulseInbox error persists, comment out usage:
# Edit app/(dashboard)/dashboard/page.tsx and components/dashboard/CinematicDashboard.tsx

# 4. Set up production services (manual steps in browser):
# - Supabase: https://supabase.com/dashboard
# - Clerk: https://clerk.com/dashboard

# 5. Deploy preview:
vercel

# 6. Deploy production (after testing preview):
vercel --prod
```

---

**Estimated Time to 100% Deployment:** 6-8 hours (assuming no major blockers)

**Current Status:** 3% complete (documentation only)
**Next Milestone:** Fix build errors (Target: 15% complete)
