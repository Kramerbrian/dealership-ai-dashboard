# Quick Start - Get Dashboard Live in 15 Minutes

## 🎯 Fastest Path to Demo

### Step 1: Environment Variables (5 min)

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these required variables:

```bash
# Clerk (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJ...

# Upstash Redis (get from https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Your domain
PUBLIC_BASE_URL=https://dash.dealershipai.com
# OR
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
```

**Quick Links:**
- [Clerk Dashboard](https://dashboard.clerk.com) → Create app → Copy keys
- [Supabase Dashboard](https://supabase.com/dashboard) → Create project → Settings → API
- [Upstash Console](https://console.upstash.com) → Create Redis database

---

### Step 2: Supabase Migrations (2 min)

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251108_integrations_reviews_visibility.sql`
3. Paste and run
4. Copy contents of `supabase/migrations/20251109_fix_receipts.sql`
5. Paste and run

**Option B: Via CLI**
```bash
# If you have Supabase CLI installed
supabase migration up
```

---

### Step 3: Clerk Configuration (3 min)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your production domain: `dash.dealershipai.com`
5. Go to **Settings** → **Paths**
6. Verify redirect URLs:
   - After sign in: `/dashboard`
   - After sign up: `/dashboard`

---

### Step 4: Deploy (5 min)

```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

---

### Step 5: Test (5 min)

1. **Sign Up**
   - Go to `https://dash.dealershipai.com/sign-up`
   - Create an account
   - Should redirect to `/dashboard`

2. **View Dashboard**
   - Should see pulses (mock data)
   - AIV composite chip with hovercard
   - Impact Ledger (empty initially)

3. **Test Fix Flow**
   - Click a pulse → Fix drawer opens
   - Click "Preview Fix" → See simulation
   - Click "Apply" → Receipt appears in ledger
   - Receipt shows "pending..." until final delta arrives

4. **Test AIV Sparkline**
   - Hover over AIV composite chip
   - Should see 7-day trend sparkline

---

## ✅ Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase migrations applied
- [ ] Clerk domain configured
- [ ] Deployment successful
- [ ] Can sign up/sign in
- [ ] Dashboard loads with pulses
- [ ] Fix drawer works
- [ ] Impact Ledger shows receipts
- [ ] AIV sparkline displays

---

## 🚨 Troubleshooting

### "Authentication required" errors
- Check Clerk keys are correct
- Verify domain is added to Clerk
- Check redirect URLs match

### "Supabase not configured" errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are set
- Check migrations were applied
- Verify service role key has correct permissions

### Receipts stuck on "pending..."
- QStash is optional - receipts will work without it
- If using QStash, verify `QSTASH_TOKEN` is set
- Check `/api/jobs/fix-consumer` logs in Vercel

### Sparkline not showing
- Check `/api/visibility/history` returns data
- Verify domain parameter is passed
- Check browser console for errors

---

## 🎉 You're Live!

Once these steps are complete, your dashboard is **demo-ready** with:
- ✅ Full authentication flow
- ✅ Working fix APIs
- ✅ Real-time receipt polling
- ✅ AIV trends visualization
- ✅ Mock data (fully functional)

**Next:** Wire real data sources incrementally as needed.
