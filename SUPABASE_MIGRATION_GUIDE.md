# 🚀 Supabase Migration Guide - Opportunities Table

## ✅ Migration SQL File Ready

**File**: `prisma/migrations/001_add_opportunities_table.sql`  
**Status**: ✅ Ready to execute

---

## 🎯 Method 1: Supabase Dashboard (Easiest & Recommended)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button

### Step 3: Paste Migration SQL

Copy this SQL:

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

### Step 4: Execute
1. Paste the SQL into the editor
2. Click **"Run"** or press `Cmd/Ctrl + Enter`
3. **Expected**: "Success. No rows returned"

---

## 🎯 Method 2: Supabase CLI

### Prerequisites
- Supabase CLI installed (✅ You have version 2.54.11)
- Linked to your remote project

### Step 1: Link to Project (One-time)

```bash
# Get your project reference ID from Supabase Dashboard
# Dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF

supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Execute Migration

**Option A: Using file path**
```bash
supabase db execute --file prisma/migrations/001_add_opportunities_table.sql
```

**Option B: Using stdin**
```bash
cat prisma/migrations/001_add_opportunities_table.sql | supabase db execute
```

**Option C: Direct SQL**
```bash
supabase db execute << 'EOF'
-- [paste SQL here]
EOF
```

---

## ✅ Step 3: Verify Migration

### Check Table Exists

Run in Supabase SQL Editor:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'opportunities'
ORDER BY ordinal_position;
```

**Expected**: 13 columns listed

### Verify Performance Index

```sql
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' 
  AND indexname = 'idx_opportunities_impact_id';
```

**Expected**:
```
indexname: idx_opportunities_impact_id
indexdef: CREATE INDEX idx_opportunities_impact_id ON opportunities ("impactScore" DESC, id DESC)
```

---

## ✅ Step 4: Test API

After migration completes:

```bash
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"
```

**Expected**: JSON response (may be empty array initially, but structure will be correct)

---

## 📋 What Gets Created

### Table: `opportunities`
- 13 columns including `impactScore`, `priority`, `estimatedROI`, etc.
- Primary key: `id`
- Foreign keys: None (standalone table)

### Indexes (4 total):
1. ✅ `idx_opportunities_domain` - Domain filtering
2. ✅ **`idx_opportunities_impact_id`** - **Cursor pagination (critical)**
3. ✅ `idx_opportunities_status` - Status filtering  
4. ✅ `idx_opportunities_category` - Category filtering

---

## 🎯 Quick Start Commands

### Using Dashboard (Recommended):
1. Copy SQL from `prisma/migrations/001_add_opportunities_table.sql`
2. Paste into Supabase Dashboard → SQL Editor
3. Click "Run"

### Using CLI:
```bash
# Link project (one-time)
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db execute --file prisma/migrations/001_add_opportunities_table.sql
```

---

## ⚠️ Troubleshooting

### CLI Error: "Cannot connect to Docker"
- **Cause**: CLI trying to use local Docker
- **Solution**: Use Dashboard method or link to remote project first

### "relation opportunities already exists"
- **Solution**: Table exists, this is OK. Indexes will still be created.

### "permission denied"
- **Solution**: Ensure you're using the correct project and have admin access

---

**Status**: ⏳ Ready to execute  
**Recommended Method**: Supabase Dashboard  
**Time**: ~3 minutes
