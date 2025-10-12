# Fix "relation ati_signals does not exist" Error

## ❌ Error You're Seeing

```
ERROR: 42P01: relation "ati_signals" does not exist
LINE 2: SELECT * FROM ati_signals;
```

## ✅ Quick Fix (3 Steps)

### Step 1: Find Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Look at the URL - it will be like:
   ```
   https://supabase.com/dashboard/project/abc123xyz
                                              ↑
                                      This is your PROJECT_ID
   ```

### Step 2: Open SQL Editor

Click this link (replace `[PROJECT_ID]` with yours):
```
https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
```

Or navigate manually:
- Supabase Dashboard → Your Project → SQL Editor → New Query

### Step 3: Copy, Paste, Run

1. **Open this file** in your code editor:
   ```
   supabase/migrations/20250115000005_ati_signals.sql
   ```

2. **Copy ALL the contents** (Cmd+A, Cmd+C)

3. **Paste into Supabase SQL Editor** (Cmd+V)

4. **Click "Run"** button (bottom right corner)

5. **Wait for success message** ✅

---

## 🔍 Verify It Worked

Run this query in SQL Editor:

```sql
SELECT * FROM ati_signals LIMIT 1;
```

**Expected Result**: Empty table (no error)

Or check the table editor:
```
https://supabase.com/dashboard/project/[PROJECT_ID]/editor
```

You should see `ati_signals` in the left sidebar.

---

## 📋 What Gets Created

The migration creates:

✅ **Table**: `ati_signals`
  - precision_pct (30% weight)
  - consistency_pct (25% weight)
  - recency_pct (20% weight)
  - authenticity_pct (15% weight)
  - alignment_pct (10% weight)
  - ati_pct (calculated automatically)

✅ **RLS Policies**: Tenant isolation for security

✅ **Indexes**: Fast queries by tenant + date

✅ **Triggers**: Auto-update timestamps

---

## 🎯 After Migration

You'll be able to:

1. **Query the API**:
   ```bash
   curl "https://yourdomain.com/api/tenants/[TENANT_ID]/ati/latest"
   ```

2. **Run the cron job**:
   ```bash
   curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
     -H "Authorization: Bearer $ADMIN_API_KEY"
   ```

3. **See ATI in dashboard**: The HeaderTiles component will show ATI score

---

## 🐛 Still Getting Errors?

### "permission denied"
- Make sure you're logged into Supabase
- Check you're using the correct project

### "syntax error"
- Make sure you copied the ENTIRE file
- Check there are no extra characters at the beginning/end

### "already exists"
- The table is already created! You're good to go
- Just try querying it: `SELECT * FROM ati_signals;`

---

## 📞 Need Help?

The full migration file is at:
```
supabase/migrations/20250115000005_ati_signals.sql
```

It's ~110 lines of SQL that creates everything you need for the ATI system.

---

**Once you run this migration, the error will disappear!** ✅

*DealershipAI v5.0 - Command Center*
*Quick Fix Guide*
*January 2025*
