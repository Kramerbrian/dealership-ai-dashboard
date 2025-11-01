# 🚀 DealershipAI - Custom Domain & Database Setup Guide

## Step 1: Set Up Custom Domain (dealershipai.com)

### **Option A: Via Vercel CLI**
```bash
# Add custom domain to project
npx vercel domains add dealershipai.com

# Follow the prompts to verify domain ownership
```

### **Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project: `brian-kramer-dealershipai/dealership-ai-dashboard`
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter `dealershipai.com`
6. Follow DNS configuration instructions

### **DNS Configuration**
You'll need to add these DNS records:

#### **For Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com.
```

---

## Step 2: Configure Production Database

### **Current Database Setup**
We already have Prisma configured. Now we need to:

1. **Set up PostgreSQL on Supabase/Railway**
2. **Configure DATABASE_URL in Vercel**
3. **Run migrations**

### **A. Supabase Setup** (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create dealershipai

# Get connection string
supabase projects api-keys list

# Copy the connection string to Vercel environment variables
```

### **B. Railway Setup** (Alternative)

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Copy connection string

### **C. Configure Vercel Environment Variables**

```bash
# Add DATABASE_URL to Vercel
npx vercel env add DATABASE_URL

# Add other required variables
npx vercel env add REDIS_URL
npx vercel env add UPSTASH_REDIS_REST_URL
npx vercel env add UPSTASH_REDIS_REST_TOKEN
```

---

## Step 3: Run Database Migrations

### **Option A: Via Vercel CLI**
```bash
# Run migrations from local
npx prisma migrate deploy

# Or via Vercel build command
# This will run automatically during deployment
```

### **Option B: Via Prisma Studio**
```bash
# Open Prisma Studio
npx prisma studio

# This will allow you to inspect and manage the database
```

### **Option C: Seed Database**
```bash
# If you have seed data
npx prisma db seed
```

---

## Step 4: Test Production Setup

### **API Health Check**
```bash
curl https://dealershipai.com/api/health
```

### **Zero-Click API Test**
```bash
curl https://dealershipai.com/api/zero-click/summary
```

### **QAI Calculation Test**
```bash
curl -X POST https://dealershipai.com/api/qai/calculate \
  -H "Content-Type: application/json" \
  -d '{"domain": "terryreidhyundai.com"}'
```

---

## Step 5: Update Environment Variables

Add these to Vercel production environment:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Clerk Auth (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Analytics
NEXT_PUBLIC_GA="G-XXXXXXX"
```

---

## Step 6: Verify SSL Certificate

Vercel automatically provisions SSL certificates. Check:

```bash
curl -I https://dealershipai.com
# Should return HTTP/2 200 with valid SSL
```

---

## Step 7: Monitor Deployment

### **Check Logs**
```bash
npx vercel logs --follow
```

### **Check Build Status**
```bash
npx vercel inspect https://dealershipai.com --logs
```

---

## 🎯 **Quick Commands**

```bash
# Force redeploy
npx vercel --prod --force

# Check domain status
npx vercel domains ls

# View environment variables
npx vercel env ls

# Run Prisma migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## ✅ **Success Checklist**

- [ ] Custom domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Database connection string added
- [ ] Migrations run successfully
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] Zero-Click APIs responding
- [ ] PLG landing page accessible
- [ ] Analytics tracking active

---

**Once completed, DealershipAI will be fully operational at https://dealershipai.com! 🚀**
