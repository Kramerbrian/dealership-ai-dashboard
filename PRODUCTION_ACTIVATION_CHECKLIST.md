# 🚀 DEALERSHIPAI PRODUCTION ACTIVATION CHECKLIST

## Phase 1: Clerk Production Configuration (15 minutes)

### ✅ Step 1: Get Production Clerk Keys
- [ ] Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
- [ ] Select your **PRODUCTION** instance (not development)
- [ ] Navigate to **API Keys**
- [ ] Copy **Publishable Key** (`pk_live_...`)
- [ ] Copy **Secret Key** (`sk_live_...`)

### ✅ Step 2: Configure Vercel Environment Variables
- [ ] Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Select `dealership-ai-dashboard` project
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add for **Production** environment:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
  CLERK_SECRET_KEY=sk_live_YOUR_KEY_HERE
  ```
- [ ] **CRITICAL:** Remove any `pk_test_` or `sk_test_` values!

### ✅ Step 3: Configure Clerk Domains
- [ ] Go to your **PRODUCTION** Clerk instance
- [ ] Navigate to **Domains** → **Satellites**
- [ ] Add domains:
  - `dealershipai.com`
  - `www.dealershipai.com`
  - Your Vercel preview domain

### ✅ Step 4: Test Clerk Configuration
- [ ] Run: `node configure-clerk-production.js YOUR_SECRET_KEY`
- [ ] Verify domains are added successfully
- [ ] Check for any errors in the output

## Phase 2: Deploy to Production (10 minutes)

### ✅ Step 5: Deploy to Vercel
- [ ] Run: `npx vercel --prod`
- [ ] Wait for deployment to complete
- [ ] Note your production URL

### ✅ Step 6: Verify Production Deployment
- [ ] Visit your production URL
- [ ] Check browser console for Clerk warnings
- [ ] Verify no "development keys" warnings
- [ ] Test sign-up flow
- [ ] Test sign-in flow
- [ ] Verify redirect to `/dashboard` works

## Phase 3: Supabase Production Database (20 minutes)

### ✅ Step 7: Create Supabase Production Project
- [ ] Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Create new project: `dealershipai-production`
- [ ] Note your project URL and API keys

### ✅ Step 8: Deploy Database Schema
- [ ] Run the SQL from `lib/database/schema.sql` in Supabase SQL Editor
- [ ] Verify all tables are created
- [ ] Test database connection

### ✅ Step 9: Configure Supabase Environment Variables
- [ ] Add to Vercel environment variables:
  ```
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

## Phase 4: Redis/Upstash Configuration (10 minutes)

### ✅ Step 10: Set up Upstash Redis
- [ ] Go to [https://console.upstash.com](https://console.upstash.com)
- [ ] Create new Redis database
- [ ] Note your Redis URL and token

### ✅ Step 11: Configure Redis Environment Variables
- [ ] Add to Vercel environment variables:
  ```
  UPSTASH_REDIS_REST_URL=your_redis_url
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```

## Phase 5: Test All Systems (15 minutes)

### ✅ Step 12: Test API Endpoints
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/dealerships/[id]/qai` endpoint
- [ ] Test `/api/dealerships/[id]/competitors` endpoint
- [ ] Test `/api/dealerships/[id]/quick-wins` endpoint

### ✅ Step 13: Test Authentication Flow
- [ ] Test sign-up with new user
- [ ] Test sign-in with existing user
- [ ] Test protected routes
- [ ] Test user session persistence

### ✅ Step 14: Test Dashboard Features
- [ ] Test Executive Summary tab
- [ ] Test 5 Pillars Deep Dive tab
- [ ] Test Quick Wins tab
- [ ] Test Mystery Shop tab
- [ ] Test Competitive Intelligence tab

## Phase 6: Launch Waitlist (10 minutes)

### ✅ Step 15: Configure Waitlist
- [ ] Go to Clerk Dashboard → **Waitlist**
- [ ] Configure waitlist settings
- [ ] Set up email templates
- [ ] Test waitlist signup

### ✅ Step 16: Launch Traffic Campaigns
- [ ] Share on social media
- [ ] Send to your network
- [ ] Post in relevant communities
- [ ] Start collecting emails

## Phase 7: Start Selling (Ongoing)

### ✅ Step 17: Target Underperforming Dealers
- [ ] Use the targeting dashboard
- [ ] Identify dealers with poor AI visibility
- [ ] Reach out with demo offers
- [ ] Close your first $499 deal!

## Success Metrics

### Technical Success
- ✅ No Clerk "development keys" warnings
- ✅ Authentication flow works end-to-end
- ✅ All API endpoints respond correctly
- ✅ Database connections working
- ✅ Redis caching operational

### Business Success
- ✅ Waitlist signups coming in
- ✅ Demo calls scheduled
- ✅ First $499 deal closed
- ✅ Revenue pipeline building

## Emergency Contacts

- **Clerk Support:** [https://clerk.com/support](https://clerk.com/support)
- **Supabase Support:** [https://supabase.com/support](https://supabase.com/support)
- **Vercel Support:** [https://vercel.com/support](https://vercel.com/support)
- **Upstash Support:** [https://upstash.com/support](https://upstash.com/support)

---

## 🎯 GOAL: First $499 Deal Within 24 Hours!

**Remember:** Every minute you're not live is a minute you're not collecting revenue. Let's get this done! 🚀💰
