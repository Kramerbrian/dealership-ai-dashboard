# AVI Dashboard Quick Start Guide

## Prerequisites Check

Run these commands to verify your setup:

```bash
# Check Supabase CLI
which supabase  # ✅ You have this!

# Check environment file
cat .env.local | grep SUPABASE  # Need to add these
```

---

## Step-by-Step Setup

### 1. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AVI Configuration
AVI_CACHE_TTL=300
AVI_USE_MOCK_FALLBACK=true
```

**To get your Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Setup Database

**Option A: Automated Script (Recommended)**

```bash
# Make script executable (if not already)
chmod +x scripts/setup-avi-database.sh

# Run setup
./scripts/setup-avi-database.sh
```

**Option B: Manual Setup**

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project (get ref from URL)
supabase link --project-ref YOUR-PROJECT-REF

# 3. Run migration
supabase db push

# 4. Verify in Supabase Dashboard → SQL Editor:
SELECT * FROM avi_reports LIMIT 1;
SELECT * FROM pg_policies WHERE tablename='avi_reports';
```

**Option C: Via Supabase Dashboard (No CLI needed)**

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy entire contents of `supabase/migrations/20250110000001_create_avi_reports.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify: `SELECT * FROM avi_reports LIMIT 1;`

---

### 3. Seed Demo Data (Optional)

```bash
# Update tenant IDs in scripts/seed-avi-reports.ts first!
# Then run:
npx tsx scripts/seed-avi-reports.ts
```

**Or skip seeding** - The API will use mock data automatically if `AVI_USE_MOCK_FALLBACK=true`

---

### 4. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000/dashboard

---

### 5. Test API

```bash
# In another terminal:
curl http://localhost:3000/api/avi-report

# Should return JSON with AVI report data
```

---

### 6. Deploy to Vercel

```bash
# 1. Commit changes
git add .
git commit -m "feat: add AVI dashboard with Supabase integration"

# 2. Push (triggers automatic deployment)
git push origin main

# 3. Configure environment variables in Vercel Dashboard:
#    - Go to: https://vercel.com/your-project/settings/environment-variables
#    - Add all SUPABASE and AVI variables
#    - Set AVI_USE_MOCK_FALLBACK=false in production

# 4. Test production
curl https://your-app.vercel.app/api/avi-report
```

---

## Troubleshooting

### Build fails with "supabaseUrl is required"
**Solution:** This is expected during build. The app works at runtime. To fix build:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="placeholder"
npm run build
```

### API returns 500 error
**Solution:** Enable mock fallback while testing:
```bash
# In .env.local
AVI_USE_MOCK_FALLBACK=true
```

### Database connection fails
**Solution:** Verify credentials:
```bash
# Test connection
curl -X POST 'https://YOUR-PROJECT.supabase.co/rest/v1/rpc/version' \
  -H "apikey: YOUR-ANON-KEY"
```

### Dashboard shows "Loading..." forever
**Solution:** Check browser console for errors. Likely API issue.

---

## Quick Commands Reference

```bash
# Setup
./scripts/setup-avi-database.sh          # Setup database
npx tsx scripts/seed-avi-reports.ts      # Seed demo data

# Development
npm run dev                               # Start dev server
npm run build                            # Test build
npx tsc --noEmit                         # Check TypeScript

# Testing
curl http://localhost:3000/api/avi-report                    # Test API
curl "http://localhost:3000/api/avi-report?tenantId=test"   # Test with ID

# Deployment
git push origin main                     # Deploy to Vercel
vercel logs                             # View logs

# Database
supabase db push                        # Run migrations
supabase db remote ls                   # List migrations
```

---

## Development Mode vs Production

### Development (Local)
- Set `AVI_USE_MOCK_FALLBACK=true`
- API returns mock data if no database records
- Great for testing without database setup

### Production (Vercel)
- Set `AVI_USE_MOCK_FALLBACK=false`
- API queries real database
- Returns error if no records (forces proper setup)

---

## What's Next?

After setup is complete:

1. **Explore Dashboard**
   - Login as SuperAdmin → See comprehensive view
   - Login as regular user → See tabbed view

2. **Read Documentation**
   - [AVI_DASHBOARD_IMPLEMENTATION.md](./AVI_DASHBOARD_IMPLEMENTATION.md) - Component details
   - [AVI_SUPABASE_INTEGRATION.md](./AVI_SUPABASE_INTEGRATION.md) - Database guide
   - [AVI_EXAMPLES.md](./AVI_EXAMPLES.md) - Code snippets

3. **Customize**
   - Update demo tenant IDs
   - Modify visualization components
   - Adjust cache TTL
   - Add custom metrics

---

## Support

- **Documentation:** See `AVI_*.md` files
- **Examples:** See `AVI_EXAMPLES.md`
- **Testing:** See `AVI_TESTING_GUIDE.md`
- **Deployment:** See `AVI_DEPLOYMENT_CHECKLIST.md`

---

**Estimated Setup Time:** 10-15 minutes
**Difficulty:** Easy (with mock fallback) → Medium (with database)
**Status:** Ready to Go! 🚀
