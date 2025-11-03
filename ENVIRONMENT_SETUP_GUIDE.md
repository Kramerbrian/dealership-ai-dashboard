# Environment Variables Setup Guide

This guide will help you set up the required environment variables for production monitoring and analytics.

## Required Environment Variables

### 1. Google Analytics (Priority: High)

**Variable:** `NEXT_PUBLIC_GA`
**Where to get it:** [Google Analytics](https://analytics.google.com/)

**Steps:**
1. Go to https://analytics.google.com/
2. Select your property
3. Go to **Admin** (gear icon) → **Data Streams**
4. Click on your web stream
5. Copy the **Measurement ID** (starts with `G-`)

**Add to Vercel:**
```bash
vercel env add NEXT_PUBLIC_GA production
# Paste your Measurement ID (e.g., G-XXXXXXXXXX)
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/brian-kramers-projects/dealership-ai-dashboard
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_GA` = `G-XXXXXXXXXX`
4. Select: Production, Preview, Development
5. Click "Save"

### 2. Sentry Error Tracking (Priority: High)

**Variables:**
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

**Where to get them:** [Sentry.io](https://sentry.io/)

**Steps:**
1. Go to https://sentry.io/ (create free account if needed)
2. Create a new project:
   - Platform: **Next.js**
   - Project name: **dealership-ai-dashboard**
3. Copy the **DSN** from the project settings
4. Note your **organization slug** (in URL: `sentry.io/organizations/{org-slug}`)
5. Note your **project name** (what you named it in step 2)

**Add to Vercel:**
```bash
# Add DSN (public, safe to expose)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste your DSN (e.g., https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)

# Add organization slug
vercel env add SENTRY_ORG production
# Paste your org slug (e.g., brian-kramers-projects)

# Add project name
vercel env add SENTRY_PROJECT production
# Paste your project name (e.g., dealership-ai-dashboard)
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. Add each variable:
   - `NEXT_PUBLIC_SENTRY_DSN` = Your Sentry DSN
   - `SENTRY_ORG` = Your organization slug
   - `SENTRY_PROJECT` = Your project name
3. Select: Production, Preview, Development for each
4. Click "Save" for each

## Quick Setup Script

If you prefer using the CLI, run this helper script:

```bash
cd /Users/briankramer/dealership-ai-dashboard
chmod +x ./scripts/setup-env-vars.sh
./scripts/setup-env-vars.sh
```

## Verification

After adding the environment variables:

1. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "chore: trigger deployment for env vars"
   git push origin main
   ```

2. **Check deployment:**
   - Go to https://vercel.com/brian-kramers-projects/dealership-ai-dashboard
   - Wait for deployment to complete
   - Visit your site: https://dealership-ai-dashboard.vercel.app

3. **Verify Google Analytics:**
   - Open your site
   - Open browser DevTools → Network tab
   - Filter by "gtag" or "analytics"
   - You should see requests to `www.google-analytics.com`

4. **Verify Sentry:**
   - Go to https://sentry.io/organizations/{your-org}/projects/dealership-ai-dashboard/
   - Check for incoming events
   - Errors will appear in the "Issues" tab

## Environment Variable Summary

| Variable | Type | Required | Purpose |
|----------|------|----------|---------|
| `NEXT_PUBLIC_GA` | Public | Yes | Google Analytics tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Yes | Sentry error tracking (client) |
| `SENTRY_ORG` | Private | Yes | Sentry org for source maps |
| `SENTRY_PROJECT` | Private | Yes | Sentry project for source maps |

## Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (embedded in client bundle)
- ✅ `SENTRY_ORG` and `SENTRY_PROJECT` are only used during build (not exposed to client)
- ✅ All variables are configured with proper CSP headers
- ✅ Sentry is configured with 10% trace sampling to minimize costs

## Troubleshooting

### Google Analytics not tracking
- Check that `NEXT_PUBLIC_GA` starts with `G-`
- Clear browser cache and cookies
- Check browser console for errors
- Verify CSP headers allow Google Analytics domains

### Sentry not receiving errors
- Check that `NEXT_PUBLIC_SENTRY_DSN` is a valid URL
- Verify all three Sentry variables are set
- Check Sentry project settings → Client Keys
- Look for Sentry-related errors in deployment logs

### Environment variables not updating
- Redeploy after adding variables (they're only injected at build time)
- Make sure variables are added to correct environment (Production/Preview/Development)
- Check Vercel deployment logs for environment variable confirmation

## Next Steps

After setup:
1. Monitor errors in Sentry dashboard
2. Review analytics in Google Analytics
3. Set up Sentry alerts for critical errors
4. Configure Google Analytics goals and conversions

## Support

- Sentry Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Google Analytics 4 Documentation: https://developers.google.com/analytics/devguides/collection/ga4
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
