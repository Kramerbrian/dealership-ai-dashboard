# 🚀 DealershipAI - Production Setup Final Steps

## ✅ **Current Status: Production Ready**

Your DealershipAI platform is successfully deployed and protected by Vercel authentication.

---

## 📋 **Next Steps (In Order)**

### **Step 1: Enable Public Access** 🔓

**Via Vercel Dashboard** (Recommended):
1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. Click **Settings** → **Deployment Protection**
3. Toggle **"Protect Vercel URL"** to **OFF**
4. Save changes
5. Redeploy: `npx vercel --prod --force`

**Via CLI** (Alternative):
```bash
# This requires API access or manual dashboard configuration
# Best to use dashboard method above
```

---

### **Step 2: Add Environment Variables** 🔐

Run these commands interactively (Vercel will prompt for values):

```bash
# Database
npx vercel env add DATABASE_URL
# Value: postgresql://[user]:[password]@[host]:5432/[dbname]

# Redis (Upstash)
npx vercel env add UPSTASH_REDIS_REST_URL
# Value: https://your-redis.upstash.io

npx vercel env add UPSTASH_REDIS_REST_TOKEN
# Value: [your-token]

# Stripe
npx vercel env add STRIPE_SECRET_KEY
# Value: sk_live_... (from Stripe dashboard)

npx vercel env add STRIPE_WEBHOOK_SECRET
# Value: whsec_... (from Stripe webhook settings)

# Clerk
npx vercel env add CLERK_SECRET_KEY
# Value: sk_test_... (from Clerk dashboard)

# Google Analytics
npx vercel env add NEXT_PUBLIC_GA
# Value: G-XXXXXXXXX
```

**For each variable**, select:
- **Environments**: Production, Preview, Development
- **Encrypted**: Yes (for secrets)

---

### **Step 3: Set Up PostgreSQL** 🗄️

**Option A: Supabase** (Recommended - Free tier)
1. Visit https://supabase.com
2. Sign up/login
3. Create new project: "dealershipai"
4. Wait for database to initialize
5. Copy connection string from Settings → Database
6. Run: `npx vercel env add DATABASE_URL` (paste connection string)

**Option B: Railway** (Alternative)
1. Visit https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Copy connection string
5. Add to Vercel as above

**Run Migrations**:
```bash
# Set DATABASE_URL locally first
npx vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

### **Step 4: Configure Stripe** 💳

1. **Visit**: https://dashboard.stripe.com
2. **Get Keys**: Settings → API keys
3. **Copy**: Publishable key (starts with `pk_`) and Secret key (starts with `sk_`)
4. **Add to Vercel**:
   ```bash
   npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   npx vercel env add STRIPE_SECRET_KEY
   ```

5. **Set Up Webhooks**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy webhook signing secret
   - Add: `npx vercel env add STRIPE_WEBHOOK_SECRET`

6. **Create Products**:
   - Products → Add Product
   - Create: "Free" (Price: $0)
   - Create: "Pro" (Price: $499/month, recurring)
   - Create: "Enterprise" (Price: $999/month, recurring)
   - Copy product IDs (e.g., `price_xxx`)
   - Update your pricing page with these IDs

---

### **Step 5: Set Up Custom Domain** 🌐

**Via Vercel Dashboard**:
1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `dealershipai.com`
5. Follow DNS configuration instructions

**DNS Records to Add** (at your domain registrar):
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com.
```

**Wait**: SSL certificate auto-provisions (5-10 minutes)

**Update Clerk Redirects**:
1. Go to Clerk Dashboard
2. Configure redirect URLs to include `dealershipai.com`
3. Save changes

---

## 🧪 **Testing Checklist**

After completing the steps above:

### **Test Public Access**
```bash
curl https://your-deployment-url.vercel.app
# Should return HTML (not authentication page)
```

### **Test Database Connection**
```bash
npx prisma studio
# Should open Prisma Studio connected to database
```

### **Test API Endpoints**
```bash
# Health check
curl https://your-url/api/health

# Zero-Click summary
curl https://your-url/api/zero-click/summary?tenantId=demo

# QAI calculation
curl -X POST https://your-url/api/qai/calculate \
  -H "Content-Type: application/json" \
  -d '{"domain": "terryreidhyundai.com"}'
```

### **Test Authentication**
1. Visit your site
2. Click "Sign Up"
3. Complete registration
4. Verify redirect to dashboard works

### **Test Payments**
1. Go to pricing page
2. Click "Upgrade to Pro"
3. Test with Stripe test card: `4242 4242 4242 4242`
4. Verify checkout completes
5. Check webhook events in Stripe dashboard

---

## 🎯 **Quick Reference Commands**

```bash
# View environment variables
npx vercel env ls

# Pull environment to local
npx vercel env pull .env.local

# View recent deployments
npx vercel ls

# Force redeploy
npx vercel --prod --force

# View logs
npx vercel logs <deployment-url>

# Run Prisma migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## 💰 **Free Tier Limits**

### Current Setup (Free)
- **Vercel**: Unlimited bandwidth, 100GB/month
- **Supabase**: 500MB database, free tier
- **Upstash Redis**: 10K commands/day free
- **Clerk**: 10K MAU free
- **Stripe**: Pay-as-you-go (2.9% + $0.30)

### When You Grow
- Monitor usage in each dashboard
- Upgrade when approaching limits
- Plan for ~$100/month when you have 100+ paying customers

---

## ✅ **Final Checklist**

Before going live:

- [ ] Public access enabled
- [ ] DATABASE_URL configured
- [ ] Redis connection string added
- [ ] Stripe keys configured
- [ ] Clerk keys configured
- [ ] Webhook configured
- [ ] Migrations run successfully
- [ ] Test landing page loads publicly
- [ ] Test API endpoints respond
- [ ] Test authentication flow
- [ ] Test payment flow
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking verified

---

## 🚀 **You're Ready to Launch!**

Once all items are checked, your DealershipAI platform will be:
- ✅ Publicly accessible
- ✅ Fully functional
- ✅ Payment-ready
- ✅ Production-grade secure
- ✅ Monitoring enabled

**Let's build a unicorn! 🦄**
