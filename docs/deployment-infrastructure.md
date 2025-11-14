# DealershipAI Deployment Infrastructure

**Status**: ✅ Production Ready
**Last Updated**: 2025-11-13
**Version**: v2025.11.13

---

## Overview

Complete automation layer for DealershipAI's cinematic landing page deployment, including CI/CD pipeline, verification scripts, and monitoring infrastructure.

## Components Deployed

### 1. GitHub Actions Workflow
**File**: `.github/workflows/deploy-cinematic-hero.yml`

**Features**:
- Automated deployment on push to main branch
- Preview deployment before production
- Post-deploy verification with retry logic
- Slack notifications on success/failure
- Triggers on changes to:
  - `app/page.tsx`
  - `components/HeroSection_CupertinoNolan.tsx`
  - `components/landing/**`
  - `app/api/nearby-dealer/**`

**Workflow Steps**:
1. Checkout code
2. Install dependencies with `--legacy-peer-deps`
3. Generate Prisma Client
4. Lint and type-check (optional, can skip with workflow input)
5. Build application
6. Deploy preview to staging
7. Verify preview deployment
8. Deploy to production
9. Post-deploy verification
10. Send Slack notification

### 2. Post-Deploy Verification Script
**File**: `scripts/verify-landing-deployment.js`

**Purpose**: Automated verification that cinematic hero is correctly deployed

**Checks**:
- HTTP 200 status code
- Presence of hero headline: "While You're Reading This"
- Presence of CTA text: "Make the Machines Say My Name"
- Presence of tagline: "Just Recommended Your Competitor"
- Hero component markers in HTML (ChatGPT, Perplexity references)

**Features**:
- 3 retry attempts with 5-second delays
- Detailed console output with emojis
- Exits with code 1 on failure (fails CI/CD pipeline)
- Can be run locally: `node scripts/verify-landing-deployment.js <URL>`

**Example Usage**:
```bash
# Verify production
node scripts/verify-landing-deployment.js https://dealershipai.com

# Verify specific deployment
node scripts/verify-landing-deployment.js https://dealership-ai-dashboard-xyz.vercel.app
```

### 3. Vercel Configuration
**File**: `vercel.json`

**Updates**:
- Added Mapbox API support to Content-Security-Policy
- Script sources: `https://api.mapbox.com`
- Worker sources: `https://api.mapbox.com`
- Style sources: `https://api.mapbox.com`
- Connect sources: `https://api.mapbox.com`, `https://*.tiles.mapbox.com`, `https://events.mapbox.com`

**Existing Features**:
- Custom build command with Prisma generation
- Automated cron jobs for:
  - Zero-click recompute (every 4 hours)
  - Fleet refresh (8am, 12pm, 4pm daily)
  - Nurture campaigns (hourly)
  - Lead nurture (10am daily)
  - Nightly Lighthouse audits (3am)
  - Quarterly reporting (1st of quarter, 9am)
- Security headers (CSP, X-Frame-Options, etc.)
- API caching headers
- GitHub integration enabled

### 4. Ambient Audio Infrastructure
**Directory**: `public/audio/`
**Documentation**: `public/audio/README.md`

**Status**: ⚠️ Audio file not yet added (gracefully handled by component)

**Requirements for Future Addition**:
- Filename: `ai-hum.mp3`
- Format: MP3
- Duration: 5-30 seconds (loops)
- Characteristics: Subtle electronic hum, 100-500Hz, non-intrusive

**Free Sources**:
- Freesound.org
- Pixabay Audio Library
- YouTube Audio Library

### 5. Component Architecture
**Active**: `components/HeroSection_CupertinoNolan.tsx`
**Deprecated**: `.disabled-pages/CinematicLandingPage.deprecated.tsx`

**Migration**:
- Old CinematicLandingPage moved to `.disabled-pages/`
- New HeroSection_CupertinoNolan is simpler, more reliable
- No breaking changes to other components

---

## GitHub Secrets Required

Configure these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Personal access token from Vercel | [Vercel Dashboard > Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_PROJECT_ID` | Project ID from Vercel | Project Settings > General |
| `VERCEL_ORG_ID` | Organization/Team ID from Vercel | Team Settings > General |
| `SLACK_WEBHOOK_URL` | Incoming webhook URL for Slack notifications | [Slack App Settings > Incoming Webhooks](https://api.slack.com/messaging/webhooks) |

---

## Environment Variables (Vercel)

Ensure these are set in Vercel project settings:

| Variable | Purpose | Required |
|----------|---------|----------|
| `GMAPS_KEY` | Google Maps API key for nearby-dealer route | Optional* |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLERK_*` | Clerk authentication variables | Yes |

*Falls back gracefully to "a local competitor" if not set

---

## Deployment Flow

### Automatic Deployment
1. Push to `main` branch
2. GitHub Actions workflow triggers
3. Builds and deploys preview
4. Verifies preview is accessible
5. Deploys to production
6. Runs verification script
7. Sends Slack notification

### Manual Deployment
```bash
# Trigger workflow manually
gh workflow run deploy-cinematic-hero.yml

# With skip tests option
gh workflow run deploy-cinematic-hero.yml -f skip_tests=true

# Or via Vercel CLI
vercel --prod
```

---

## Monitoring & Verification

### Production Health Check
```bash
curl -I https://dealershipai.com
```
Expected: `HTTP/2 200`

### Hero Text Verification
```bash
curl -s https://dealershipai.com | grep "While You're Reading This"
```
Expected: Match found

### Run Full Verification
```bash
node scripts/verify-landing-deployment.js https://dealershipai.com
```

### View Recent Deployments
```bash
vercel ls --prod
```

### Check Deployment Logs
```bash
vercel logs https://dealershipai.com
```

---

## Troubleshooting

### Deployment Fails at Verification Step
1. Check if deployment URL is accessible: `curl -I <deployment-url>`
2. Verify hero text is present: `curl -s <deployment-url> | grep "While You"`
3. Check Vercel logs for runtime errors: `vercel logs <deployment-url>`

### Slack Notifications Not Sending
1. Verify `SLACK_WEBHOOK_URL` is set in GitHub secrets
2. Test webhook manually:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message"}' \
     $SLACK_WEBHOOK_URL
   ```

### CSP Blocking Mapbox Resources
- Verify `vercel.json` includes Mapbox domains
- Check browser console for CSP errors
- Redeploy after updating `vercel.json`

### Audio Not Playing
- Component gracefully handles missing audio file
- Check `/public/audio/ai-hum.mp3` exists
- Verify browser allows autoplay (user must interact first)

---

## Related Documentation

- [HeroSection_CupertinoNolan Implementation](../components/HeroSection_CupertinoNolan.tsx)
- [Nearby Dealer API Route](../app/api/nearby-dealer/route.ts)
- [AIM VIN-DEX Pulse Suite](./aim_vindex_pulse_suite.md)
- [Canonical Version](../canonical/version.json)

---

## Changelog

### v2025.11.13 - Complete Automation Infrastructure
- ✅ GitHub Actions workflow with preview + production deployment
- ✅ Post-deploy verification script with retry logic
- ✅ Vercel.json updated with Mapbox CSP support
- ✅ Audio directory structure created
- ✅ Deprecated CinematicLandingPage archived
- ✅ All improvements committed and deployed

### v2025.11.13 - Hero Component Replacement
- ✅ Created HeroSection_CupertinoNolan component
- ✅ Added nearby-dealer API route with Google Maps integration
- ✅ Updated app/page.tsx to use new hero
- ✅ Resolved HTTP 500 production outage

---

## Support

For issues or questions about deployment infrastructure:
- **GitHub Actions**: Check workflow runs at `Actions` tab
- **Vercel**: Check deployment logs in Vercel dashboard
- **Code**: Review this documentation and referenced files

**Canonical Hash**: `3ffd7f286`
**Git Tag**: `v2025.11.13-infrastructure`
**Status**: Production Ready ✅
