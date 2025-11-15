# 🚀 GO LIVE: 100% Activation Checklist

**Domains**: `dealershipai.com` + `dash.dealershipai.com`  
**Status**: Ready for immediate activation  
**Time**: ~30 minutes

---

## ✅ PHASE 1: Environment Variables (10 min)

### 🔴 Critical - Must Set Now

#### 1. Clerk Authentication
```bash
# Set in Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
# Get from: Clerk Dashboard → API Keys → Publishable Key
# Set for: Production, Preview, Development

CLERK_SECRET_KEY=sk_live_...
# Get from: Clerk Dashboard → API Keys → Secret Key
# Set for: Production, Preview (NOT Development)
```

**Quick Set**:
```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

#### 2. Supabase Database
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gzlgfghpkbqlhgfozjkb.supabase.co
# Already known from MCP

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Already known from MCP

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Get from: Supabase Dashboard → Settings → API → service_role key
```

**Quick Set**:
```bash
echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste service role key when prompted
```

#### 3. Database URL (if using Prisma)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.gzlgfghpkbqlhgfozjkb.supabase.co:5432/postgres
# Get from: Supabase Dashboard → Settings → Database → Connection String
```

---

## ✅ PHASE 2: Clerk Configuration (5 min)

### 1. Clerk Dashboard Setup

**Go to**: https://dashboard.clerk.com

#### Allowed Origins
Add these to **Configure → Allowed Origins**:
- `https://dealershipai.com`
- `https://www.dealershipai.com`
- `https://dash.dealershipai.com`
- `https://*.vercel.app` (for preview deployments)

#### Domain & Cookies (for SSO)
1. Go to **Configure → Domain & Cookies**
2. Set **Cookie Domain**: `.dealershipai.com`
3. Enable **SSO** if needed

#### Redirect URLs
- **After Sign In**: `/onboarding`
- **After Sign Up**: `/onboarding`
- **Sign In URL**: `/sign-in`
- **Sign Up URL**: `/sign-up`

---

## ✅ PHASE 3: DNS & Domain Configuration (5 min)

### 1. Verify Domains in Vercel

**Check**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains

**Required Domains**:
- ✅ `dealershipai.com` (apex domain)
- ✅ `www.dealershipai.com` (www subdomain)
- ✅ `dash.dealershipai.com` (dashboard subdomain)

### 2. DNS Records

**For `dealershipai.com` (Apex)**:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

**For `www.dealershipai.com`**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For `dash.dealershipai.com`**:
```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
```

**Verify**: DNS propagation (can take 5-60 minutes)

---

## ✅ PHASE 4: Code Verification (5 min)

### 1. Middleware Configuration

**File**: `middleware.ts`

**Verify**:
- ✅ `dealershipai.com` → Public routes (no Clerk)
- ✅ `dash.dealershipai.com` → Protected routes (with Clerk)
- ✅ Root path (`/`) on dashboard domain redirects to `/dash`

### 2. ClerkProviderWrapper

**File**: `components/providers/ClerkProviderWrapper.tsx`

**Verify**:
- ✅ Renders ClerkProvider on `dash.dealershipai.com`
- ✅ Skips ClerkProvider on `dealershipai.com` (landing page)

### 3. Sign-In Page

**File**: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

**Verify**:
- ✅ Uses Clerk `<SignIn>` component
- ✅ Has proper Suspense fallback
- ✅ Redirects correctly after sign-in

---

## ✅ PHASE 5: Database Verification (5 min)

### 1. Supabase Tables

**Verify these tables exist**:
```sql
-- Check via Supabase Dashboard or MCP
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'pulse_cards',
  'pulse_incidents',
  'pulse_digest',
  'pulse_mutes',
  'pulse_threads'
);
```

**Status**: ✅ Already created (migration applied)

### 2. RPC Functions

**Verify these functions exist**:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'ingest_pulse_card',
  'get_pulse_inbox'
);
```

**Status**: ✅ Already created (migration applied)

---

## ✅ PHASE 6: Final Deployment (5 min)

### 1. Redeploy After Env Vars

```bash
# After setting all environment variables
vercel --prod
```

### 2. Verify Deployment

**Check**:
- ✅ Build succeeds
- ✅ No errors in build logs
- ✅ Deployment state: "READY"

---

## 🧪 PHASE 7: Testing (10 min)

### 1. Landing Page (`dealershipai.com`)

**Test**:
- [ ] Visit: `https://dealershipai.com`
- [ ] Page loads (no errors)
- [ ] Hero section displays
- [ ] Analyzer form works
- [ ] No Clerk authentication required

### 2. Sign-In Page (`dash.dealershipai.com`)

**Test**:
- [ ] Visit: `https://dash.dealershipai.com/sign-in`
- [ ] Page loads (not stuck on "Loading...")
- [ ] Clerk sign-in form appears
- [ ] Can type in email/password fields
- [ ] "Continue with Google" button works (if configured)

### 3. Authentication Flow

**Test**:
- [ ] Sign in with Clerk
- [ ] Redirects to `/onboarding` after sign-in
- [ ] Onboarding page loads
- [ ] Can navigate to `/pulse` after onboarding

### 4. Dashboard Routes

**Test**:
- [ ] `/dash` - Main dashboard loads
- [ ] `/pulse` - Pulse dashboard loads
- [ ] `/onboarding` - Onboarding flow works
- [ ] Protected routes require authentication

### 5. API Endpoints

**Test**:
- [ ] `GET /api/health` - Returns healthy status
- [ ] `GET /api/pulse?dealerId=demo-tenant` - Returns cards (with auth)
- [ ] `GET /api/marketpulse/compute?dealer=example.com` - Works (public)

---

## 📊 Success Criteria

### ✅ 100% Ready When:

1. **Environment Variables**: All set in Vercel
2. **Clerk Configuration**: Domains and redirects configured
3. **DNS**: All domains point to Vercel
4. **Database**: All tables and functions exist
5. **Deployment**: Latest deployment is READY
6. **Landing Page**: Loads without errors
7. **Sign-In Page**: Shows Clerk form (not "Loading...")
8. **Authentication**: Sign-in flow works end-to-end
9. **Dashboard**: All routes accessible after auth
10. **API Endpoints**: All return expected responses

---

## 🚨 Critical Blockers

### If Sign-In Shows "Loading...":

1. **Check**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
2. **Check**: Clerk Dashboard allowed origins include `dash.dealershipai.com`
3. **Check**: Browser console for errors
4. **Fix**: Set missing env vars and redeploy

### If Landing Page Doesn't Load:

1. **Check**: DNS records are correct
2. **Check**: Domain is verified in Vercel
3. **Check**: Deployment is READY
4. **Fix**: Wait for DNS propagation or fix DNS records

### If Database Errors:

1. **Check**: `SUPABASE_SERVICE_ROLE_KEY` is set
2. **Check**: Tables exist (run migration if needed)
3. **Check**: RPC functions exist
4. **Fix**: Set service role key and verify schema

---

## 🎯 Quick Activation Script

```bash
# 1. Set environment variables
./scripts/sync-env-to-vercel-interactive.sh

# 2. Verify deployment
vercel --prod

# 3. Test endpoints
curl https://dealershipai.com/api/health
curl https://dash.dealershipai.com/sign-in
```

---

## 📋 Final Checklist

### Before Going Live:

- [ ] All environment variables set in Vercel
- [ ] Clerk Dashboard configured (domains, redirects)
- [ ] DNS records configured and propagated
- [ ] Database tables and functions verified
- [ ] Latest deployment is READY
- [ ] Landing page tested (`dealershipai.com`)
- [ ] Sign-in page tested (`dash.dealershipai.com`)
- [ ] Authentication flow tested
- [ ] Dashboard routes tested
- [ ] API endpoints tested

### After Going Live:

- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify all features work
- [ ] Test on mobile devices
- [ ] Check performance (Lighthouse)

---

**Status**: Ready for activation  
**Estimated Time**: 30 minutes  
**Priority**: Complete Phase 1 (Environment Variables) first

