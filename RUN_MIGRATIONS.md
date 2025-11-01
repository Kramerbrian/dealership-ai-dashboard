# 🗄️ Database Migrations - Production Setup

## ✅ **Current Status**

Database is configured but migrations need to be run in production.

---

## 🚀 **Option 1: Run Migrations via Supabase Dashboard** (Recommended)

### **Step 1: Access Supabase SQL Editor**
1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### **Step 2: Generate Migration SQL**
```bash
# In your local terminal:
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
```

### **Step 3: Run SQL in Supabase**
1. Copy contents of `migration.sql`
2. Paste into Supabase SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)

---

## 🚀 **Option 2: Run Migrations via Vercel CLI** (Alternative)

### **Step 1: Pull Production Environment**
```bash
npx vercel env pull .env.production
```

### **Step 2: Set Direct URL**
```bash
# Add DIRECT_URL to .env.production
echo "DIRECT_URL=your-supabase-direct-url" >> .env.production
```

### **Step 3: Run Migrations**
```bash
# Run migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 🚀 **Option 3: Run via Prisma Studio** (Development)

```bash
# Install Prisma Studio (if not installed)
npm install -g prisma-studio

# Open Studio
npx prisma studio

# Use the UI to manage your database
```

---

## ✅ **Verification**

After migrations, verify tables exist:
1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb
2. Go to **Table Editor**
3. Verify these tables exist:
   - `users`
   - `dealerships`
   - `scores`
   - `zero_click_daily`
   - `ctr_baseline`
   - etc.

---

## 🎯 **Recommended: Use Supabase Dashboard**

**Fastest Path:**
1. Generate migration SQL locally
2. Run in Supabase SQL Editor
3. Verify tables in Table Editor

This avoids environment variable issues and gives you full control.

---

**Status**: ⏳ Ready to run migrations
