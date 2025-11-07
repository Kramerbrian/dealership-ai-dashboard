# Migration Instructions - Bypass Sentry Error

## ⚠️ Issue
The Sentry DSN error is blocking Supabase CLI commands. This is just a configuration warning and doesn't affect the migrations themselves.

## ✅ Solution: Apply Migrations via Supabase Dashboard

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb

### Step 2: Open SQL Editor
Click **SQL Editor** in the left sidebar

### Step 3: Apply First Migration
1. Copy the contents of: `supabase/migrations/20251108_integrations_reviews_visibility.sql`
2. Paste into SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)
4. Should see: "Success. No rows returned"

### Step 4: Apply Second Migration
1. Copy the contents of: `supabase/migrations/20251109_fix_receipts.sql`
2. Paste into SQL Editor
3. Click **Run**
4. Should see: "Success. No rows returned"

### Step 5: Verify
In SQL Editor, run:
```sql
-- Check if tables/indexes exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('integrations', 'fix_receipts');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%integrations%' OR indexname LIKE '%fix_receipts%';
```

---

## 📋 Migration Files

### Migration 1: `20251108_integrations_reviews_visibility.sql`
Creates indexes on the `integrations` table for:
- `kind` and `tenant_id` lookups
- JSON metadata queries for `place_id` and `engines`

### Migration 2: `20251109_fix_receipts.sql`
Creates the `fix_receipts` table for:
- Tracking applied fixes
- 10-minute undo window
- Impact Ledger functionality

---

## ✅ After Migrations

Once migrations are applied:
1. ✅ Set missing environment variables: `./scripts/quick-env-setup.sh`
2. ✅ Configure Clerk dashboard (add domain)
3. ✅ Deploy: `./scripts/deploy.sh`

---

## 🆘 Alternative: Fix Sentry Config

If you want to fix the Sentry error (optional):

1. Check your `.env` or Vercel environment variables for `SENTRY_DSN`
2. Either:
   - Set a valid Sentry DSN: `SENTRY_DSN=https://xxx@sentry.io/xxx`
   - Or remove/comment out Sentry initialization in your code

The Sentry error is just a warning and won't affect your dashboard functionality.
