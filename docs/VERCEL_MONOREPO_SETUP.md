# Vercel Monorepo Setup - Final Solution

## Problem
Vercel is building from the repository root instead of `apps/web`, causing module resolution errors.

## Solution: Move vercel.json to apps/web/

We've moved `vercel.json` to `apps/web/vercel.json` so Vercel treats `apps/web` as the project root.

## Next Steps

### 1. Set Root Directory in Vercel Dashboard

**CRITICAL**: You must set this in the Vercel dashboard:

1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings
2. Navigate to **"Build & Development Settings"**
3. Find **"Root Directory"** field
4. Set it to: `apps/web`
5. Click **"Save"**

### 2. Verify Configuration

After setting root directory, Vercel will:
- Read `apps/web/vercel.json` (not root `vercel.json`)
- Install dependencies from `apps/web/package.json`
- Build from `apps/web/` directory
- Output to `apps/web/.next`

### 3. Deploy

```bash
# Commit the changes
git add apps/web/vercel.json
git commit -m "Move vercel.json to apps/web for monorepo setup"
git push origin main
```

Vercel will automatically detect the new configuration and deploy.

## File Structure

```
dealership-ai-dashboard/
├── vercel.json (old - can be removed)
├── apps/
│   └── web/
│       ├── vercel.json (new - active)
│       ├── package.json (has @sendgrid/mail, cheerio)
│       ├── next.config.js
│       └── ...
```

## Verification

After deployment, check build logs for:
- ✅ "Installing dependencies from apps/web/package.json"
- ✅ No "Module not found" errors for @sendgrid/mail or cheerio
- ✅ Build completes successfully

## Troubleshooting

If still not working:

1. **Clear Vercel build cache**: Settings → Deployments → Clear cache
2. **Verify root directory**: Must be exactly `apps/web` (no trailing slash)
3. **Check vercel.json location**: Should be in `apps/web/vercel.json`
4. **Redeploy**: Trigger a new deployment after changes

