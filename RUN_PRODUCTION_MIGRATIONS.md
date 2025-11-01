# 🗄️ Run Production Migrations - Step by Step

## ✅ **Migration Files Ready**

1. **ShareEvent Table**: `supabase/migrations/001_add_share_events.sql`
2. **Opportunities Index**: Included in migration

---

## 🚀 **Option 1: Via Supabase Dashboard** (Recommended - Easiest)

### **Step 1: Access Supabase SQL Editor**
1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### **Step 2: Copy & Run Migration SQL**
Copy the contents of `supabase/migrations/001_add_share_events.sql` and paste into SQL Editor, then click **Run** (or Cmd/Ctrl + Enter)

### **Step 3: Verify Tables Created**
1. Go to **Table Editor**
2. Verify `share_events` table exists
3. Verify indexes are created:
   - `idx_share_events_domain`
   - `idx_share_events_feature_name`
   - `idx_share_events_unlock_expires`
   - `idx_share_events_session_id`
   - `idx_opportunities_domain_status`
   - `idx_opportunities_impact_id`

---

## 🚀 **Option 2: Via Supabase CLI**

### **Step 1: Link Project**
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
supabase link --project-ref gzlgfghpkbqlhgfozjkb
```

### **Step 2: Push Migrations**
```bash
supabase db push
```

### **Step 3: Verify**
```bash
supabase migration list
```

---

## 🚀 **Option 3: Via Prisma Migrate** (Alternative)

### **Step 1: Set Environment Variables**
```bash
# Pull production env vars
npx vercel env pull .env.production

# Or set manually
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-supabase-direct-url"
```

### **Step 2: Generate Prisma Client**
```bash
npx prisma generate
```

### **Step 3: Run Migration**
```bash
npx prisma migrate deploy
```

---

## ✅ **Verification Queries**

After migration, run these in Supabase SQL Editor:

```sql
-- Check share_events table exists
SELECT * FROM share_events LIMIT 1;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('share_events', 'opportunities')
ORDER BY tablename, indexname;

-- Check opportunities index
SELECT * FROM pg_indexes 
WHERE indexname = 'idx_opportunities_domain_status';
```

---

## 📋 **Migration SQL**

The complete migration SQL is in:
- `supabase/migrations/001_add_share_events.sql`

**Quick Copy:**
```sql
CREATE TABLE IF NOT EXISTS share_events (
  id TEXT PRIMARY KEY,
  domain TEXT,
  "featureName" TEXT NOT NULL,
  platform TEXT NOT NULL,
  "shareUrl" TEXT NOT NULL,
  "referralCode" TEXT,
  "unlockExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "sessionId" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_events_domain ON share_events(domain);
CREATE INDEX IF NOT EXISTS idx_share_events_feature_name ON share_events("featureName");
CREATE INDEX IF NOT EXISTS idx_share_events_unlock_expires ON share_events("unlockExpiresAt");
CREATE INDEX IF NOT EXISTS idx_share_events_session_id ON share_events("sessionId");
CREATE INDEX IF NOT EXISTS idx_opportunities_domain_status ON opportunities (domain, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id ON opportunities (impact_score DESC, id DESC);
```

---

## 🎯 **Recommended Method**

**Use Supabase Dashboard** - It's the fastest and most reliable:
1. Copy SQL from migration file
2. Paste in SQL Editor
3. Run
4. Verify in Table Editor

**Time**: ~2 minutes ⚡

---

**Status**: Ready to run migrations
