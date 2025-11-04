# 🚀 DealershipAI v2 Migration Plan

## 📊 Project Overview

**Old Project**: `/Users/briankramer/dealership-ai-dashboard` (Next.js 14 + React 18)
**New Project**: `/Users/briankramer/dealership-ai-v2` (Next.js 15 + React 19)

**Goal**: Migrate to a clean Next.js 15 setup to resolve webpack/jsx-runtime issues and implement audit improvements from the start.

---

## ✅ Phase 1: Foundation Setup (1-2 hours)

### Step 1.1: Create Fresh Project ✅
```bash
npx create-next-app@latest dealership-ai-v2 \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

### Step 1.2: Install Core Dependencies
```bash
cd dealership-ai-v2
npm install \
  @tanstack/react-query \
  @clerk/nextjs \
  @supabase/supabase-js \
  @prisma/client \
  stripe \
  @stripe/stripe-js \
  zod \
  date-fns \
  lucide-react \
  framer-motion \
  recharts
```

### Step 1.3: Install Dev Dependencies
```bash
npm install -D \
  prisma \
  @types/node \
  tsx \
  prettier \
  eslint-config-prettier
```

### Step 1.4: Copy Configuration Files
- [ ] Copy `.env.local` (all environment variables)
- [ ] Copy `tailwind.config.ts` (custom theme)
- [ ] Copy `tsconfig.json` (TypeScript settings)
- [ ] Copy `.prettierrc` (code formatting)
- [ ] Copy `.gitignore` (ignore patterns)

---

## 📁 Phase 2: Database & API Layer (2-3 hours)

### Step 2.1: Database Schema
```bash
# Copy Prisma schema
cp dealership-ai-dashboard/prisma/schema.prisma dealership-ai-v2/prisma/

# Generate Prisma client
cd dealership-ai-v2
npx prisma generate
```

### Step 2.2: Copy Utility Libraries
- [ ] Copy `lib/prisma.ts` (Prisma client)
- [ ] Copy `lib/supabase.ts` (Supabase client)
- [ ] Copy `lib/stripe.ts` (Stripe config)
- [ ] Copy `lib/react-query-config.ts` (React Query setup)
- [ ] Copy `lib/api-response.ts` (API helpers)

### Step 2.3: Copy API Routes (Test Each)
```bash
# Copy all API routes
cp -r dealership-ai-dashboard/app/api/ dealership-ai-v2/src/app/api/

# Priority API routes to test first:
# 1. app/api/health/route.ts
# 2. app/api/dashboard/overview/route.ts
# 3. app/api/analytics/route.ts
```

**Testing Strategy**:
- Start dev server
- Test each endpoint with curl
- Fix any import path issues (`@/lib` should work with new setup)

---

## 🎨 Phase 3: UI Components (3-4 hours)

### Step 3.1: Copy Shared UI Components
```bash
# Create components directory
mkdir -p dealership-ai-v2/src/components/ui

# Copy base UI components
cp dealership-ai-dashboard/components/ui/*.tsx dealership-ai-v2/src/components/ui/
```

**Priority Components**:
- [ ] `LoadingSpinner.tsx`
- [ ] `LoadingSkeleton.tsx`
- [ ] `Button.tsx`
- [ ] `Card.tsx`
- [ ] `Modal.tsx`

### Step 3.2: Copy Dashboard Components
```bash
mkdir -p dealership-ai-v2/src/components/dashboard

# Copy and test incrementally
cp dealership-ai-dashboard/components/dashboard/TabbedDashboard.tsx dealership-ai-v2/src/components/dashboard/
```

**Testing Strategy**:
- Copy one component at a time
- Fix import paths
- Test in isolation
- Move to next component

### Step 3.3: Copy Landing Page Components
```bash
mkdir -p dealership-ai-v2/src/components/landing

# Start with SimplifiedLandingPage
cp dealership-ai-dashboard/components/landing/SimplifiedLandingPage.tsx dealership-ai-v2/src/components/landing/
```

---

## 🔧 Phase 4: Pages & Routes (2-3 hours)

### Step 4.1: Root Layout
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/components/QueryProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <QueryProvider>
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 4.2: Landing Page
```bash
# Copy landing page
cp dealership-ai-dashboard/app/page.tsx dealership-ai-v2/src/app/
```

### Step 4.3: Dashboard Page
```bash
# Create dashboard route
mkdir -p dealership-ai-v2/src/app/dash
cp dealership-ai-dashboard/app/dash/page.tsx dealership-ai-v2/src/app/dash/
```

### Step 4.4: Onboarding Flow
```bash
mkdir -p dealership-ai-v2/src/app/onboarding
cp dealership-ai-dashboard/app/onboarding/page.tsx dealership-ai-v2/src/app/onboarding/
```

---

## 🎯 Phase 5: Authentication & Middleware (1-2 hours)

### Step 5.1: Clerk Setup
```bash
# Copy middleware
cp dealership-ai-dashboard/middleware.ts dealership-ai-v2/src/
```

### Step 5.2: Environment Variables
```env
# Copy these from old .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## 🧪 Phase 6: Testing & Verification (2-3 hours)

### Step 6.1: Smoke Tests
- [ ] Landing page loads without errors
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Dashboard loads with data
- [ ] API endpoints respond correctly

### Step 6.2: Integration Tests
- [ ] Stripe checkout flow
- [ ] Supabase data fetching
- [ ] Real-time updates
- [ ] Analytics tracking

### Step 6.3: Performance Tests
```bash
# Run Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools > Lighthouse
```

**Target Metrics**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 95+

---

## 📋 Phase 7: Production Deployment (1-2 hours)

### Step 7.1: Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd dealership-ai-v2
vercel link

# Set environment variables
vercel env pull .env.local
```

### Step 7.2: Domain Configuration
- [ ] Add custom domain to Vercel
- [ ] Update DNS records
- [ ] Enable HTTPS
- [ ] Test production deployment

### Step 7.3: Final Verification
- [ ] Test all critical user flows in production
- [ ] Verify analytics tracking
- [ ] Check error monitoring (Sentry)
- [ ] Confirm payments work (Stripe)

---

## 🎯 Success Criteria

### Technical Criteria
- ✅ No webpack/jsx-runtime errors
- ✅ All API routes functional
- ✅ Authentication working (Clerk)
- ✅ Payments working (Stripe)
- ✅ Database queries working (Prisma + Supabase)
- ✅ Build completes without errors
- ✅ Lighthouse scores: All 90+

### Business Criteria
- ✅ Landing page converts visitors
- ✅ Onboarding flow completes
- ✅ Dashboard displays real data
- ✅ No critical bugs in production

---

## 🚨 Risk Mitigation

### Backup Strategy
- Keep old project intact until v2 is fully verified
- Test with staging environment first
- Gradual rollout (10% → 50% → 100% traffic)

### Rollback Plan
If critical issues arise:
1. Revert DNS to old deployment
2. Keep old Vercel deployment active
3. Switch back instantly with DNS change

---

## 📊 Migration Checklist

### Pre-Migration
- [x] Complete audit of current codebase
- [x] Create migration plan
- [ ] Backup current database
- [ ] Document all environment variables
- [ ] Notify team of migration schedule

### During Migration
- [ ] Create new Next.js 15 project
- [ ] Copy and test API routes
- [ ] Copy and test components
- [ ] Copy and test pages
- [ ] Set up authentication
- [ ] Configure deployment

### Post-Migration
- [ ] Run full smoke test suite
- [ ] Verify all integrations work
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics
- [ ] Gather user feedback

---

## ⏱️ Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| **Phase 1: Foundation** | 1-2 hours | 🟡 In Progress |
| **Phase 2: Database & API** | 2-3 hours | ⏳ Pending |
| **Phase 3: UI Components** | 3-4 hours | ⏳ Pending |
| **Phase 4: Pages & Routes** | 2-3 hours | ⏳ Pending |
| **Phase 5: Auth & Middleware** | 1-2 hours | ⏳ Pending |
| **Phase 6: Testing** | 2-3 hours | ⏳ Pending |
| **Phase 7: Deployment** | 1-2 hours | ⏳ Pending |
| **TOTAL** | **12-19 hours** | |

---

## 🎯 Next Immediate Actions

1. ✅ Create new Next.js 15 project
2. ⏳ Install core dependencies
3. ⏳ Copy environment variables
4. ⏳ Copy Prisma schema
5. ⏳ Test basic API route

**Current Status**: Creating new project...

---

**Migration Started**: November 4, 2025
**Target Completion**: November 5, 2025
**Lead**: Claude + Brian Kramer
