# 🔧 Fixing Deployment Issues

## Issues Found

1. ✅ **Wrong Directory** - You were in `~` instead of project directory
2. ⚠️ **Supabase Migration** - Remote migrations not found locally
3. ⚠️ **Port Conflict** - Port 3001 already in use
4. ⚠️ **Build Memory Error** - JavaScript heap out of memory

---

## Solutions

### 1. Navigate to Correct Directory

```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
```

### 2. Fix Supabase Migration

The error indicates remote migrations exist but aren't in your local directory. You have two options:

**Option A: Pull remote migrations (Recommended)**
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
supabase db pull
```

**Option B: Run migration manually via SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `supabase/migrations/20250111000001_create_telemetry_events.sql`
3. Paste and click **Run**

### 3. Fix Port Conflict

**Kill process on port 3001:**
```bash
lsof -ti:3001 | xargs kill -9
```

**Or use a different port:**
```bash
pnpm run dev -- -p 3002
```

### 4. Fix Build Memory Error

**Increase Node.js memory limit:**
```bash
# Add to package.json scripts
NODE_OPTIONS=--max-old-space-size=4096 pnpm run build
```

Or create a `.nvmrc` or update your build script.

---

## Quick Fix Commands

Run these in order:

```bash
# 1. Navigate to project
cd /Users/stephaniekramer/dealership-ai-dashboard

# 2. Kill port 3001 if needed
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 3. Pull Supabase migrations
supabase db pull

# 4. Build with increased memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm run build
```

---

## Alternative: Manual Supabase Migration

If `supabase db pull` doesn't work, run the migration manually:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy the SQL from `supabase/migrations/20250111000001_create_telemetry_events.sql`
5. Paste and click **Run**

---

## Updated Build Script

I'll update your `package.json` to include the memory fix.

