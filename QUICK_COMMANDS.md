# ⚡ Quick Command Reference

## Pre-Deployment

```bash
# Check local environment variables
npm run verify:env

# Check Sentry DSN
npm run check:sentry

# Export all values for Vercel
npm run export:vercel-env

# Get correct database URL format
bash scripts/get-correct-database-url.sh
```

## Post-Deployment

```bash
# Verify deployment
npm run verify:deployment

# Or manually test health
curl https://dealershipai.com/api/health

# Check production build
npm run build
```

## Quick Links

- **Vercel Dashboard:** https://vercel.com/YOUR_PROJECT/settings/environment-variables
- **Sentry Dashboard:** https://sentry.io/organizations/dealershipai/projects/javascript-nextjs/settings/keys/
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql

## Key Files

- **Start Here:** `START_HERE.md`
- **Quick Copy-Paste:** `QUICK_VERCEL_COPY_PASTE.md`
- **Progress Tracker:** `VERCEL_PROGRESS_TRACKER.md`
- **Full Guide:** `FINAL_VERCEL_SETUP.md`

---

**Keep this open during deployment!**

