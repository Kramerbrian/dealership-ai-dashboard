# 🚀 Run Opportunities Table Migration

## ✅ Step 1: Copy Migration SQL

The SQL file is ready at: `prisma/migrations/001_add_opportunities_table.sql`

**Full SQL Content**:

```sql
-- Create opportunities table for cursor-based pagination
-- Migration: Add opportunities table with impact_score ordering

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
  "impactScore" DOUBLE PRECISION NOT NULL,
  priority INTEGER NOT NULL,
  "estimatedROI" DOUBLE PRECISION NOT NULL,
  "estimatedAIVGain" DOUBLE PRECISION NOT NULL,
  effort TEXT NOT NULL CHECK (effort IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Index for domain filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON opportunities(domain);

-- Performance index for cursor-based pagination (ORDER BY impactScore DESC, id DESC)
-- This is critical for efficient pagination queries
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id 
  ON opportunities("impactScore" DESC, id DESC);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);

-- Comment explaining the pagination index
COMMENT ON INDEX idx_opportunities_impact_id IS 
  'Supports cursor-based pagination queries ordering by impactScore DESC, id DESC';
```

---

## ✅ Step 2: Execute via Supabase Dashboard (Recommended)

### Method A: Supabase Dashboard ⭐ (Easiest)

1. **Go to**: https://supabase.com/dashboard
2. **Select** your project
3. **Click**: "SQL Editor" (left sidebar)
4. **Click**: "New query"
5. **Paste** the SQL above
6. **Click**: "Run" or press `Cmd/Ctrl + Enter`
7. **Verify**: Should see "Success. No rows returned"

### Method B: Supabase CLI (If Linked)

If you're linked to a remote Supabase project:

```bash
# Link to your project (one-time setup)
supabase link --project-ref YOUR_PROJECT_REF

# Execute the SQL
supabase db execute --file prisma/migrations/001_add_opportunities_table.sql
```

**Or using direct SQL**:
```bash
# Save SQL to temp file first
cat > /tmp/migration.sql << 'EOF'
-- [paste SQL above]
EOF

# Execute
supabase db execute --file /tmp/migration.sql
```

---

## ✅ Step 3: Verify Migration

### Check Table Exists

Run this in Supabase SQL Editor:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'opportunities'
ORDER BY ordinal_position;
```

**Expected**: Should show all 13 columns

### Verify Performance Index

```sql
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' 
  AND indexname = 'idx_opportunities_impact_id';
```

**Expected Result**:
```
indexname                      | indexdef
-------------------------------+---------------------------------------------------------
idx_opportunities_impact_id    | CREATE INDEX idx_opportunities_impact_id ON opportunities ("impactScore" DESC, id DESC)
```

---

## ✅ Step 4: Test API Endpoint

After migration, test the API:

```bash
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"
```

**Expected**: JSON response with opportunities array (may be empty initially) and nextCursor field

---

## 🎯 Quick Checklist

- [ ] Copy SQL from `prisma/migrations/001_add_opportunities_table.sql`
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Paste and run SQL
- [ ] Verify table exists
- [ ] Verify `idx_opportunities_impact_id` index exists
- [ ] Test API endpoint
- [ ] Verify cursor pagination works

---

## ⚠️ Troubleshooting

### "relation opportunities already exists"
- **Solution**: Table already exists, skip table creation or drop it first

### "permission denied"
- **Solution**: Make sure you're using the correct project and have admin access

### "index already exists"
- **Solution**: Index already created, this is OK

### Supabase CLI not working
- **Solution**: Use Dashboard method (Method A) - it's easier and more reliable

---

## 📊 What Gets Created

1. **Table**: `opportunities` with 13 columns
2. **Indexes**: 
   - `idx_opportunities_domain` - For domain filtering
   - `idx_opportunities_impact_id` - **For cursor pagination (critical)**
   - `idx_opportunities_status` - For status filtering
   - `idx_opportunities_category` - For category filtering

---

**Status**: ⏳ Ready to execute  
**Time**: ~5 minutes  
**Method**: Supabase Dashboard (recommended)
