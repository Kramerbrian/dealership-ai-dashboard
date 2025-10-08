# 🔍 Database Setup Verification Guide

## Method 1: Quick Visual Check in Supabase

### In Supabase Dashboard:

1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ tenants
   - ✅ users
   - ✅ dealership_data
   - ✅ ai_query_results
   - ✅ audit_logs
   - ✅ api_keys
   - ✅ notification_settings
   - ✅ reviews
   - ✅ review_templates

**If you see 9 tables = SUCCESS! ✅**

---

## Method 2: SQL Verification Query

Run this in SQL Editor:

```sql
-- Check all tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check sample data
SELECT COUNT(*) as tenant_count FROM tenants;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as dealership_count FROM dealership_data;
```

**Expected Results:**
- 9 tables listed
- tenant_count: 3
- user_count: 3
- dealership_count: 1

---

## Method 3: Check from Terminal

```bash
# Test Supabase connection (replace with your actual keys)
curl -X GET 'https://vxrdvkhkombwlhjvtsmw.supabase.co/rest/v1/tenants?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return JSON with 3 tenants
```

---

## ✅ Success Indicators

### You're all set if:

1. **Table Editor shows 9 tables**
2. **Tables have sample data** (3 tenants, 3 users, 1 dealership)
3. **No SQL errors** when running verification queries
4. **Custom types exist** (tenant_type, user_role, etc.)

---

## ⚠️ Common Issues

### Issue: "Tables not showing"
**Solution:** Refresh browser, check you're on correct project

### Issue: "Some tables missing"
**Solution:** Re-run the schema (it will skip existing, add missing)

### Issue: "RLS policies not working"
**Solution:** Check if policies were created in SQL Editor

---

## 🎯 Next Steps After Verification

Once verified, you need to:

1. **Get API Keys** from Supabase
2. **Add to Vercel** environment variables
3. **Redeploy** application
4. **Test** database connection

---

## 📊 Quick Status Check

Run this to see everything at once:

```sql
-- Complete verification query
SELECT 'Tables' as type, COUNT(*)::text as count
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 'Custom Types', COUNT(*)::text
FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e'
UNION ALL
SELECT 'Tenants', COUNT(*)::text FROM tenants
UNION ALL
SELECT 'Users', COUNT(*)::text FROM users
UNION ALL
SELECT 'Dealerships', COUNT(*)::text FROM dealership_data
UNION ALL
SELECT 'Reviews', COUNT(*)::text FROM reviews;
```

**Expected output:**
```
Tables:        9
Custom Types:  6
Tenants:       3
Users:         3
Dealerships:   1
Reviews:       2
```

---

## 🔑 Get Your Supabase Credentials

After verification, get these from Supabase:

### Step 1: Go to Project Settings
https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/api

### Step 2: Copy These Values

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://vxrdvkhkombwlhjvtsmw.supabase.co

# Anon/Public Key (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key (KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 3: Add to Vercel

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

vercel --prod
```

---

## 🧪 Test Connection

After deploying with credentials:

```bash
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health

# Should show:
# "database": { "status": "healthy", "latency": 45 }
```

---

**Current Status:** Verifying database setup ⏳
**Next:** Get API credentials and deploy
