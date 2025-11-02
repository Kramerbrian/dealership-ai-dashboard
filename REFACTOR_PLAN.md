# Systematic Refactor Plan

## Phase 1: Dependency Audit & Fix (Est: 2 hours)

### Issues Found:
1. Missing @tanstack/react-query (required by landing pages)
2. Missing @react-email/components imports
3. Conflicting Redis clients (ioredis vs redis package)
4. @sentry/nextjs present but causing issues in one branch
5. @react-three packages present but may not be used

### Actions:
```bash
# Install missing critical dependencies
npm install @tanstack/react-query@latest

# Fix Redis - use ioredis consistently
npm uninstall redis

# Optional: Keep or remove @react-three (check usage first)
# npm uninstall @react-three/drei @react-three/fiber three @types/three

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Phase 2: Runtime Initialization Refactor (Est: 3-4 hours)

### Files Needing Fixes:

#### 1. lib/redis.ts ✅ (Already partially fixed)
- Add NEXT_PHASE guard
- Make lazy-loaded

#### 2. lib/cache.ts ✅ (Already partially fixed)  
- Add build-time guard to RedisCache constructor
- Add null checks to all methods

#### 3. lib/monitoring.ts ⚠️ (Reverted to Sentry version)
- Need to make Sentry init conditional
- Add build-time guard

#### 4. Find all BullMQ usage:
```bash
grep -r "from 'bullmq'" --include="*.ts" --include="*.tsx"
```
- Wrap in runtime guards
- Make queue initialization lazy

#### 5. Check all module-level initializations:
```bash
grep -r "new Redis\|new Queue\|new BullMQ" --include="*.ts"
```

## Phase 3: Feature Flags (Est: 1 hour)

Create `lib/feature-flags.ts`:
```typescript
export const BUILD_TIME_FLAGS = {
  ENABLE_REDIS: process.env.NEXT_PHASE !== 'phase-production-build',
  ENABLE_BULLMQ: process.env.NEXT_PHASE !== 'phase-production-build',
  ENABLE_SENTRY: process.env.NEXT_PHASE !== 'phase-production-build',
  ENABLE_EMAIL_TEMPLATES: false, // Disabled until fixed
  ENABLE_REACT_EMAIL: false, // Disabled until fixed
};
```

## Phase 4: Missing Files (Est: 30 min)

Create stub files for missing imports:
- `app/hooks/useLandingPage.ts`
- `components/landing/UrlEntryModal.tsx`
- `components/landing/ProfileSection.tsx`
- `lib/landing-page-schema.json`

## Phase 5: Test Strategy

1. Clean build test:
```bash
rm -rf .next
NODE_ENV=production npm run build
```

2. If fails, disable feature and retry:
```bash
# Disable in feature-flags.ts
# Test again
```

3. Once builds, test critical paths:
- Home page loads
- Dashboard loads  
- API routes respond
- Auth works

## Phase 6: Deployment

1. Commit all changes
2. Push to staging branch
3. Deploy to Vercel preview
4. Test preview URL
5. Merge to main
6. Deploy to production

## Estimated Timeline

- Phase 1: 2 hours
- Phase 2: 4 hours  
- Phase 3: 1 hour
- Phase 4: 30 min
- Phase 5: 1 hour
- Phase 6: 30 min

**Total: ~9 hours**

## Quick Win Option (2 hours)

If timeline too long, do minimal viable fix:

1. Install @tanstack/react-query
2. Add build guards to lib/cache.ts and lib/redis.ts (done)
3. Disable problematic routes via .vercelignore
4. Deploy and test

```bash
# .vercelignore
emails/
lib/email/
app/landing/enhanced-schema/
```

This gets you deployed fast, then fix properly over time.
