# Apply ATI Migration - Quick Guide

## Error: relation "ati_signals" does not exist

You're seeing this error because the `ati_signals` table hasn't been created yet. Let's fix it!

---

## ✅ Solution: Apply Migration in Supabase SQL Editor

### Step 1: Get Your Project ID

```bash
# Extract from your .env file
grep "NEXT_PUBLIC_SUPABASE_URL" .env.local

# Example output: https://gzlgfghpkbqlhgfozjkb.supabase.co
# Project ID: gzlgfghpkbqlhgfozjkb (the part before .supabase.co)
```

### Step 2: Open Supabase SQL Editor

Replace `[PROJECT_ID]` with your actual project ID:

```
https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
```

Or run this command to open it automatically:

```bash
# Extract project ID and open SQL Editor
PROJECT_ID=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'/' -f3 | cut -d'.' -f1)
open "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
```

### Step 3: Copy Migration SQL

Open this file:
```
supabase/migrations/20250115000005_ati_signals.sql
```

**Copy the entire contents** (all 100+ lines)

### Step 4: Paste and Run

1. Paste into Supabase SQL Editor
2. Click **"Run"** button (bottom right)
3. Wait for success message

### Step 5: Verify Table Created

Run this query to verify:

```sql
SELECT * FROM ati_signals LIMIT 1;
```

Expected: Empty result (no rows) but no error

Or check the table editor:
```
https://supabase.com/dashboard/project/[PROJECT_ID]/editor
```

Look for `ati_signals` table in the left sidebar.

---

## 🔧 Alternative: Using psql Command

If you prefer command-line:

### Step 1: Get Database Password

1. Go to: `https://supabase.com/dashboard/project/[PROJECT_ID]/settings/database`
2. Copy your database password (or reset if needed)

### Step 2: Run Migration

```bash
# Replace [PROJECT_ID] and [PASSWORD]
PGPASSWORD='[PASSWORD]' psql \
  "postgresql://postgres.[PROJECT_ID]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20250115000005_ati_signals.sql
```

### Step 3: Verify

```bash
PGPASSWORD='[PASSWORD]' psql \
  "postgresql://postgres.[PROJECT_ID]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -c "SELECT COUNT(*) FROM ati_signals;"
```

Expected output: `0` (table exists, no rows yet)

---

## 📋 What This Migration Creates

### Tables
- `ati_signals` - Five-pillar trust measurements per tenant/week

### Columns
- `precision_pct` (30% weight) - Data accuracy
- `consistency_pct` (25% weight) - Cross-channel parity
- `recency_pct` (20% weight) - Freshness
- `authenticity_pct` (15% weight) - Review/backlink credibility
- `alignment_pct` (10% weight) - Search intent matching
- `ati_pct` (calculated) - Composite score

### RLS Policies
- `ati_tenant_sel` - SELECT restricted by tenant
- `ati_tenant_ins` - INSERT restricted by tenant
- `ati_tenant_upd` - UPDATE restricted by tenant

### Indexes
- `idx_ati_signals_tenant_week` - Efficient queries by tenant + date

---

## ✅ After Migration Applied

You should be able to:

1. Query the table:
   ```sql
   SELECT * FROM ati_signals;
   ```

2. Test the API endpoint:
   ```bash
   curl "https://yourdomain.com/api/tenants/[TENANT_ID]/ati/latest"
   ```

3. Run the cron job:
   ```bash
   curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
     -H "Authorization: Bearer $ADMIN_API_KEY"
   ```

---

## 🐛 Troubleshooting

### Error: "permission denied for schema public"
**Solution**: You need the service role key, not anon key
```bash
# Make sure you're using:
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Error: "relation already exists"
**Solution**: Table is already created! Try:
```sql
SELECT * FROM ati_signals LIMIT 1;
```

### Error: "could not connect to server"
**Solution**: Check your database password is correct

### Error: "SSL connection required"
**Solution**: Add `?sslmode=require` to connection string

---

## 📝 Quick Command Reference

```bash
# Open SQL Editor
PROJECT_ID=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'/' -f3 | cut -d'.' -f1)
open "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"

# Open Table Editor
open "https://supabase.com/dashboard/project/$PROJECT_ID/editor"

# Open Database Settings
open "https://supabase.com/dashboard/project/$PROJECT_ID/settings/database"

# View migration file
cat supabase/migrations/20250115000005_ati_signals.sql

# Count lines (should be ~100+)
wc -l supabase/migrations/20250115000005_ati_signals.sql
```

---

## ✅ Success Checklist

After applying migration, verify:

- [ ] Table exists: `SELECT * FROM ati_signals;` (no error)
- [ ] RLS enabled: Check in Supabase UI (Authentication > Policies)
- [ ] Index created: Check in Database > Indexes
- [ ] Trigger exists: Check in Database > Triggers
- [ ] Can insert: Test with a sample row
- [ ] API works: Test `/api/tenants/[ID]/ati/latest`

---

**Once migration is applied, the "relation does not exist" error will be gone!** ✅

*DealershipAI v5.0 - Command Center*
*ATI Migration Guide*
*January 2025*
