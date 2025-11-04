# 🔧 Running SQL Queries via Supabase CLI

## ⚠️ Important Note

**Supabase CLI does NOT have a direct SQL execution command** (`supabase db execute` doesn't exist).

The CLI is designed for:
- ✅ `supabase db push` - Push migrations
- ✅ `supabase db pull` - Pull schema
- ✅ `supabase db diff` - Compare schemas
- ❌ **NOT** for executing arbitrary SQL queries

---

## ✅ Recommended Method: Supabase SQL Editor

### Step 1: Open SQL Editor
🔗 **Direct Link**: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new

### Step 2: Copy Query
The queries are ready in:
- `scripts/run-policy-check.sql` - Check RLS policy optimization
- `scripts/run-index-check.sql` - Check index counts
- `scripts/check-policies.sql` - Full policy check
- `scripts/check-indexes.sql` - Full index check

### Step 3: Run Query
1. Paste query into SQL Editor
2. Click **"Run"** (or Cmd/Ctrl + Enter)
3. View results

---

## 🔄 Alternative: Using psql (If Direct Connection Works)

If you have direct database access (not always available with Supabase):

```bash
# Get database URL from .env
DB_URL=$(grep "^DATABASE_URL=" .env | sed 's/^DATABASE_URL=//' | tr -d '"')

# Run query
psql "$DB_URL" -c "SELECT tablename, COUNT(*) as index_count FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' GROUP BY tablename ORDER BY index_count DESC;"
```

**Note**: This often fails due to Supabase firewall/IP restrictions.

---

## 📋 Ready-to-Run Queries

### Query 1: Check RLS Policy Optimization
```sql
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN definition LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%(select auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%auth.uid()%' THEN '⚠️ Needs Fix'
        ELSE 'N/A'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Query 2: Check Index Counts
```sql
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY index_count DESC;
```

### Query 3: Complete RLS Performance Check
```sql
SELECT * FROM check_rls_performance();
```

---

## 🎯 Quick Copy-Paste Method

**Fastest way to run queries:**

1. **Open SQL Editor**: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new
2. **View query file**: `cat scripts/run-policy-check.sql`
3. **Copy output** and paste into SQL Editor
4. **Click Run**

---

## 📊 Expected Results

### RLS Policy Check:
- Should show: `✅ Optimized` for all policies
- If you see: `⚠️ Needs Fix` - Those policies need optimization

### Index Count Check:
- Should show: 20+ indexes total
- Multiple indexes per table (users, tenants, dealerships, etc.)

---

**Bottom Line**: Use the **Supabase SQL Editor** for running queries - it's the most reliable method!

