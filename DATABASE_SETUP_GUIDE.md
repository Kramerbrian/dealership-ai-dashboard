# 🗄️ DealershipAI - Production Database Configuration

## ✅ **Current Status**

You have **DATABASE_URL** configured in Vercel environment variables, but the database needs to be set up.

---

## 🚀 **Quick Setup (Choose One)**

### **Option 1: Supabase (Recommended - Free Tier)**

1. **Visit**: https://supabase.com
2. **Sign up/Login**: Create account
3. **Create Project**: 
   - Name: `dealershipai`
   - Database Password: Generate secure password
   - Region: Choose closest to users
4. **Wait**: 2-3 minutes for provisioning
5. **Get Connection String**:
   - Go to: Settings → Database
   - Copy "Connection string" → "URI"
6. **Add to Vercel**:
   ```bash
   npx vercel env add DATABASE_URL
   # Paste: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
   ```
7. **Run Migrations** (from Vercel dashboard or CLI):
   - Deploy to trigger migrations automatically

---

### **Option 2: Railway**

1. **Visit**: https://railway.app
2. **Sign up/Login**: Use GitHub
3. **New Project** → **Add Database** → **PostgreSQL**
4. **Copy Connection URL**
5. **Add to Vercel**: `npx vercel env add DATABASE_URL`
6. **Migrations**: Automatically run on deploy

---

### **Option 3: Neon**

1. **Visit**: https://neon.tech
2. **Free Tier**: PostgreSQL with generous limits
3. **Create Project**: "dealershipai"
4. **Copy Connection String**
5. **Add to Vercel**
6. **Migrations**: Run on first deploy

---

## 📊 **Current Database Status**

Your `prisma/schema.production.prisma` is configured for PostgreSQL with these models:

- ✅ Users & Authentication
- ✅ Dealers & Dealerships  
- ✅ Scores (QAI scoring system)
- ✅ E-E-A-T Scores (PRO tier)
- ✅ Sessions (usage tracking)
- ✅ Competitors
- ✅ Mystery Shops (Enterprise)
- ✅ Credentials (Enterprise vault)
- ✅ Cache Entries
- ✅ Webhook Logs

---

## 🔧 **Manual Database Setup**

If you need to run migrations manually:

```bash
# 1. Set DATABASE_URL locally
export DATABASE_URL="postgresql://postgres:password@host:5432/dbname"

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate client
npx prisma generate

# 4. Verify connection
npx prisma studio
```

---

## ✅ **Verification Checklist**

- [ ] Database provider chosen (Supabase/Railway/Neon)
- [ ] Database created
- [ ] DATABASE_URL added to Vercel
- [ ] Connection string is valid
- [ ] Migrations run successfully
- [ ] Prisma client generated
- [ ] Database accessible from Vercel

---

## 🎯 **Next Steps After Database Setup**

1. **Test Connection**:
   ```bash
   npx prisma studio
   # Opens database GUI at http://localhost:5555
   ```

2. **Seed Data** (optional):
   ```bash
   npx prisma db seed
   ```

3. **Deploy to Vercel**:
   ```bash
   npx vercel --prod --force
   ```

4. **Verify in Production**:
   - Check Vercel logs for database connection
   - Test API endpoints
   - Verify data persistence

---

## 💡 **Recommendation**

**Use Supabase** because:
- ✅ Free tier (500MB database)
- ✅ Auto-scaling
- ✅ Built-in PostgreSQL
- ✅ Easy migrations
- ✅ Dashboard included
- ✅ No credit card required

**Quick Start**:
1. Visit: https://supabase.com/dashboard
2. Click "New Project"
3. Copy connection string
4. Run: `npx vercel env add DATABASE_URL`
5. Deploy: `npx vercel --prod --force`

**Your database will be set up automatically!** 🚀