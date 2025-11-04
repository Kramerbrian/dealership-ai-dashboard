# ⚠️ Supabase CLI SQL Execution Limitation

## 🚨 The Issue

**Supabase CLI does NOT support executing arbitrary SQL queries.**

The CLI is designed for:
- ✅ `supabase db push` - Apply migrations
- ✅ `supabase db pull` - Pull schema
- ✅ `supabase db diff` - Compare schemas
- ✅ `supabase migration` - Manage migrations
- ❌ **NOT** for running SELECT queries or ad-hoc SQL

---

## ✅ Solution: Use the Helper Script

I've created a helper script that displays your queries:

```bash
# Run both queries
bash scripts/execute-sql-cli.sh

# Or run individually
bash scripts/execute-sql-cli.sh policy
bash scripts/execute-sql-cli.sh index
```

This script will:
1. Display the SQL queries formatted nicely
2. Provide direct links to the SQL Editor
3. Explain the limitation

---

## 🔄 Alternatives

### Option 1: Supabase SQL Editor (Recommended)
1. Open: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new
2. Copy query from `scripts/run-policy-check.sql` or `scripts/run-index-check.sql`
3. Paste and click "Run"

### Option 2: Use psql (If Connection Works)
```bash
# Get database URL
DB_URL=$(grep "^DATABASE_URL=" .env | sed 's/^DATABASE_URL=//' | tr -d '"')

# Try connection pooler (port 6543)
POOLER_URL=$(echo "$DB_URL" | sed 's/:5432/:6543/' | sed 's/db\./postgres.@aws-0-us-east-2.pooler./')

# Run query
psql "$POOLER_URL" -f scripts/run-policy-check.sql
```

**Note**: Direct connections often fail due to Supabase firewall/IP restrictions.

### Option 3: Create a Migration (Not Recommended for Queries)
You could create a migration file, but this is meant for schema changes, not SELECT queries.

---

## 📋 Your Queries Are Ready

The queries are saved in:
- `scripts/run-policy-check.sql` - RLS policy check
- `scripts/run-index-check.sql` - Index count check

**Quick access:**
```bash
cat scripts/run-policy-check.sql
cat scripts/run-index-check.sql
```

---

## 🎯 Bottom Line

**The Supabase SQL Editor is the most reliable way to run these queries.**

The CLI simply doesn't have this capability. Use the helper script I created to quickly view and copy the queries.

