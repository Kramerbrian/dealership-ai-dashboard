# 🚀 Quick Start: Vercel Environment Variables Setup

## One Command Setup

```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
./scripts/vercel-setup-interactive.sh
```

## What Happens

1. **Links Project** → Select `dealership-ai-dashboard` when prompted
2. **Adds Variables** → `SUPABASE_DB_PASSWORD` and `DATABASE_PASSWORD` to all environments
3. **Verifies** → Shows what was added
4. **Redeploys** → Production deployment triggered

## Variables Added

- `SUPABASE_DB_PASSWORD` = `Autonation2077$`
  - ✅ Production
  - ✅ Preview
  - ✅ Development

- `DATABASE_PASSWORD` = `Autonation2077$`
  - ✅ Production
  - ✅ Preview
  - ✅ Development

## After Setup

Check deployment status:
- https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments

## Troubleshooting

**Script fails at linking?**
- Run `npx vercel link` manually first
- Then run `./scripts/add-vercel-env-auto.sh`

**Need to verify variables?**
```bash
npx vercel env ls | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD"
```

## Alternative: Dashboard Method

If CLI doesn't work:
1. Visit: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
2. Add variables manually
3. Redeploy from dashboard

---

**Status**: ✅ Ready to execute
**Script**: `./scripts/vercel-setup-interactive.sh`
**Time**: ~2-3 minutes

