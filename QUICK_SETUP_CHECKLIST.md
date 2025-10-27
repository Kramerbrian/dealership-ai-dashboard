# ✅ DealershipAI Quick Setup Checklist

## Prerequisites
- [x] Vercel account
- [x] GitHub repository
- [ ] Supabase account
- [ ] Upstash account
- [ ] Stripe account
- [ ] Clerk account

---

## 🚀 5-Minute Deploy (Mock Data First)

### Step 1: Deploy with Default Settings (2 minutes)
```bash
npx vercel --prod --yes
```

✅ **Status**: Live at https://dealership-ai-dashboard-1vux486pg-brian-kramer-dealershipai.vercel.app

### Step 2: Add Clerk Keys (1 minute)
1. Get keys from: https://dashboard.clerk.com
2. Add to Vercel: https://vercel.com/dashboard/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables

**Add these:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

### Step 3: Redeploy (1 minute)
```bash
npx vercel --prod
```

**Test**: Visit https://your-domain.vercel.app/sign-up

---

## 📊 Full Setup (30 minutes for complete SaaS)

### 1. Supabase Setup (10 min)
- [ ] Create account: https://supabase.com
- [ ] Create project: `dealershipai-production`
- [ ] Copy database URL
- [ ] Add to Vercel: `DATABASE_URL=...`
- [ ] Run migrations: `npx prisma db push`

### 2. Upstash Setup (5 min)
- [ ] Create account: https://upstash.com
- [ ] Create Redis database
- [ ] Copy REST URL and token
- [ ] Add to Vercel:
  - `UPSTASH_REDIS_REST_URL=...`
  - `UPSTASH_REDIS_REST_TOKEN=...`

### 3. Stripe Setup (10 min)
- [ ] Create account: https://stripe.com
- [ ] Get API keys
- [ ] Add to Vercel:
  - `STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
  - `STRIPE_SECRET_KEY=sk_live_xxx`
  - `STRIPE_WEBHOOK_SECRET=whsec_xxx`
- [ ] Configure webhook endpoint
- [ ] Create products (Pro $499, Enterprise $999)

### 4. Optional Services (5 min)
- [ ] Google Analytics: `NEXT_PUBLIC_GA_ID=G-XXX`
- [ ] Sentry: `SENTRY_DSN=https://...`
- [ ] PostHog: `NEXT_PUBLIC_POSTHOG_KEY=...`

---

## 🧪 Testing Checklist

### After Each Step, Test:

**Authentication:**
- [ ] Can sign up
- [ ] Can sign in
- [ ] Can sign out
- [ ] Redirects work correctly

**Dashboard:**
- [ ] Landing page loads
- [ ] Dashboard accessible after login
- [ ] Mystery Shop tab works
- [ ] Intelligence dashboard loads

**API:**
- [ ] `/api/zero-click/recompute` returns data
- [ ] `/api/zero-click/summary` returns data
- [ ] Database queries work (if connected)

**Payments (if Stripe configured):**
- [ ] Can start checkout
- [ ] Webhook receives events
- [ ] User tier updates correctly

---

## 💡 Pro Tips

1. **Start with Clerk** - Authentication is most important
2. **Add Supabase next** - Database for real data
3. **Stripe last** - Payments work without until needed
4. **Use Stripe test mode first** - Don't charge real money during testing

---

## 🎯 Current Status

✅ **Deployed**: Live on Vercel  
✅ **Build**: Successful  
✅ **Features**: All working with mock data  
⏳ **Next**: Add environment variables for real data

---

## Quick Commands

```bash
# Deploy updates
npx vercel --prod

# View logs
npx vercel logs

# Pull env vars locally
npx vercel env pull .env.local

# Open project
vercel --open
```

---

**You're 5 minutes away from a fully functional SaaS!** 🚀

Start with the "5-Minute Deploy" section above, then gradually add real services as needed.
