# 🚀 DealershipAI - Add Database to Vercel (Manual Steps)

## ✅ **Quick Setup Instructions**

Since Supabase CLI requires manual installation, here are the **exact steps** to add your database:

---

## 📝 **Step 1: Get Supabase Connection String**

### **Option A: From Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Sign up/Login
3. Click **"New Project"**
4. Enter:
   - **Name**: `dealershipai`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait 2-3 minutes for provisioning
6. Go to: **Settings** → **Database**
7. Find **"Connection string"** section
8. Copy the **"URI"** connection string
9. It will look like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### **Option B: If You Already Have Supabase Project**
1. Visit: https://supabase.com/dashboard
2. Select your existing project
3. Go to: **Settings** → **Database**
4. Copy the **"URI"** connection string

---

## 🔐 **Step 2: Add to Vercel via CLI**

Run this command (interactive):

```bash
npx vercel env add DATABASE_URL
```

When prompted:
1. **Value**: Paste your Supabase connection string
2. **For which environments**: Select all (Production, Preview, Development)
3. **Encrypt**: Yes

**Or** via Vercel Dashboard:
1. Visit: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
2. Click **"Add New"**
3. Name: `DATABASE_URL`
4. Value: Paste connection string
5. Environments: Select all three
6. Click **"Save"**

---

## 🗄️ **Step 3: Run Migrations**

### **Automatic (Recommended)**
Migrations will run automatically on next deployment:
```bash
npx vercel --prod --force
```

### **Manual (If needed)**
```bash
# Pull environment variables
npx vercel env pull .env.local

# Run migrations with DATABASE_URL
export DATABASE_URL="your-connection-string"
npx prisma migrate deploy
```

---

## ✅ **Step 4: Verify Database**

### **Via Prisma Studio**
```bash
# Set environment variable
export DATABASE_URL="your-connection-string"

# Open database GUI
npx prisma studio
# Opens at http://localhost:5555
```

### **Via Supabase Dashboard**
1. Visit your Supabase project
2. Go to **Table Editor**
3. You should see tables:
   - users
   - dealers
   - scores
   - sessions
   - competitors
   - mystery_shops
   - credentials
   - cache_entries
   - webhook_logs

---

## 🎯 **Current Database Schema**

Your production schema (`prisma/schema.production.prisma`) includes:

### **Core Models** ✅
- `User` - User accounts with tier management
- `Dealer` - Dealership information
- `Score` - QAI scoring system
- `Session` - Usage tracking

### **Zero-Click System** ✅
- `ZeroClickDaily` - Daily ZCR metrics
- `CtrBaseline` - CTR baselines

### **PRO Tier** ✅
- `EATScore` - E-E-A-T scoring

### **Enterprise Tier** ✅
- `MysteryShop` - AI query testing
- `Credential` - Encrypted credential vault

### **Infrastructure** ✅
- `Competitor` - Competitive intelligence
- `CacheEntry` - Caching system
- `WebhookLog` - Webhook logging

---

## 📊 **Verification Checklist**

After adding DATABASE_URL to Vercel:

- [ ] DATABASE_URL added to Vercel environment
- [ ] Connection string is valid
- [ ] Supabase project is active
- [ ] Next deployment will run migrations automatically
- [ ] Tables will be created automatically
- [ ] Prisma client is generated

---

## 🚀 **Quick Commands Reference**

```bash
# Add environment variable
npx vercel env add DATABASE_URL

# View environment variables
npx vercel env ls

# Pull environment locally
npx vercel env pull .env.local

# Deploy with migrations
npx vercel --prod --force

# Test database locally
export DATABASE_URL="your-connection-string"
npx prisma studio
```

---

## 💡 **After Setup**

Once DATABASE_URL is configured and you deploy:

1. **Migrations run automatically** ✅
2. **Database tables created** ✅
3. **Prisma client generated** ✅
4. **API endpoints connect** ✅
5. **Data persistence enabled** ✅

**Your DealershipAI platform will have full database functionality!** 🗄️🚀
