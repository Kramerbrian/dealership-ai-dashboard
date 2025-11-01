# ✅ Opportunities Table Migration - Ready to Execute

## 📋 Migration File Created

**File**: `prisma/migrations/001_add_opportunities_table.sql`  
**Status**: ✅ Ready  
**Copy-Paste File**: `COPY_PASTE_MIGRATION.sql` (for easy copying)

---

## 🚀 Execute Migration (3 Steps, 3 Minutes)

### Step 1: Open Supabase Dashboard

1. **Go to**: https://supabase.com/dashboard
2. **Sign in** to your account
3. **Select** your DealershipAI project

### Step 2: Open SQL Editor

1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"** button (or use existing query tab)

### Step 3: Paste & Run SQL

**Option A: Copy from file**
```bash
cat prisma/migrations/001_add_opportunities_table.sql
```
Copy the output and paste into SQL Editor.

**Option B: Use copy-paste file**
Open `COPY_PASTE_MIGRATION.sql` and copy all contents.

**Option C: Copy from below**

Full SQL (copy this entire block):

```sql
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

CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON opportunities(domain);
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id 
  ON opportunities("impactScore" DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);

COMMENT ON INDEX idx_opportunities_impact_id IS 
  'Supports cursor-based pagination queries ordering by impactScore DESC, id DESC';
```

4. **Click "Run"** or press `Cmd/Ctrl + Enter`
5. **Expected Result**: "Success. No rows returned"

---

## ✅ Step 4: Verify Migration

### Check Table Created

Run this in SQL Editor:

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

**Expected Result**:
```
indexname: idx_opportunities_impact_id
indexdef: CREATE INDEX idx_opportunities_impact_id ON opportunities ("impactScore" DESC, id DESC)
```

---

## ✅ Step 5: Test API Endpoint

After migration, test the API:

```bash
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"
```

**Expected**: JSON response with `opportunities` array and `nextCursor` field

---

## 📊 What Gets Created

### Table: `opportunities`
- ✅ 13 columns
- ✅ Primary key: `id`
- ✅ Constraints: impact, effort, status enums

### Indexes (4 total):
1. ✅ `idx_opportunities_domain` - Fast domain filtering
2. ✅ **`idx_opportunities_impact_id`** - **Cursor pagination performance**
3. ✅ `idx_opportunities_status` - Status filtering
4. ✅ `idx_opportunities_category` - Category filtering

---

## 🎯 Quick Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy SQL from `COPY_PASTE_MIGRATION.sql` or file above
- [ ] Paste and Run
- [ ] Verify table exists (13 columns)
- [ ] Verify index `idx_opportunities_impact_id` exists
- [ ] Test API endpoint
- [ ] ✅ Migration complete!

---

## ⚠️ Troubleshooting

### "relation opportunities already exists"
- **Solution**: Table already exists, indexes will still be created
- **Action**: Continue - migration uses `IF NOT EXISTS`

### "permission denied"
- **Solution**: Make sure you're using the correct project
- **Action**: Check project selection in dashboard

### No errors but table doesn't appear
- **Solution**: Refresh the Table Editor
- **Action**: Click "Refresh" in Supabase Dashboard

---

**Status**: ⏳ Ready to execute  
**Time**: ~3 minutes  
**Difficulty**: Easy (just copy-paste)

