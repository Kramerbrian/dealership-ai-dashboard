# Fix Vercel Root Directory Issue

## Problem
Vercel is building from the repository root instead of `apps/web`, causing module resolution errors for dependencies like `@sendgrid/mail` and `cheerio` that are in `apps/web/package.json`.

## Solution Options

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to your Vercel project settings:
   - https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings

2. Navigate to **"Build & Development Settings"**

3. Find **"Root Directory"** field

4. Set it to: `apps/web`

5. Click **"Save"**

6. Trigger a new deployment

### Option 2: Move vercel.json to apps/web/

If Option 1 doesn't work, move the `vercel.json` file:

```bash
# Move vercel.json to apps/web/
mv vercel.json apps/web/vercel.json
```

Then update `apps/web/vercel.json` to remove the `rootDirectory` setting (since the file will be in the root):

```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": ".next"
}
```

### Option 3: Use Vercel CLI to Set Root Directory

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Set root directory via CLI (if supported)
# Or use the dashboard method above
```

## Verification

After applying the fix, verify:

1. **Check build logs** - Should show:
   ```
   Installing dependencies from apps/web/package.json
   ```

2. **Check for errors** - Should NOT see:
   ```
   Module not found: Can't resolve '@sendgrid/mail'
   Module not found: Can't resolve 'cheerio'
   ```

3. **Successful build** - Should complete with:
   ```
   ✓ Compiled successfully
   ```

## Current Configuration

- **vercel.json location**: Root directory (`/vercel.json`)
- **rootDirectory setting**: `apps/web`
- **Dependencies location**: `apps/web/package.json`
- **Expected behavior**: Vercel should build from `apps/web/` directory

## Troubleshooting

If still not working:

1. **Clear Vercel cache**: In project settings → Deployments → Clear build cache
2. **Redeploy**: Trigger a new deployment after clearing cache
3. **Check logs**: Look for "Root Directory" in build logs to confirm it's being used
4. **Contact support**: If issues persist, Vercel support can check project configuration

