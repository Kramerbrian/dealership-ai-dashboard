# DealershipAI Master Manifest Guide

**Location**: `/dealershipai-master-manifest.json`
**Version**: 2025-11-04
**Status**: ✅ Production Ready

---

## Overview

The master manifest is a single source of truth for the entire DealershipAI ecosystem. It documents how every component (Landing → Auth → Onboarding → Dashboard → Deployment) integrates together.

## Quick Start

### For Developers
```bash
# View the manifest
cat dealershipai-master-manifest.json | jq '.'

# Extract specific sections
jq '.authentication' dealershipai-master-manifest.json
jq '.deployment.vercel.crons' dealershipai-master-manifest.json
```

### For DevOps
```bash
# Copy environment template
cp .env.production.example .env.local

# Fill in required values
# Required: VERCEL_TOKEN, CLERK_*, DATABASE_URL

# Deploy to production
vercel --prod --confirm
```

### For CI/CD
```yaml
# Reference in GitHub Actions
- name: Load Manifest
  run: |
    MANIFEST=$(cat dealershipai-master-manifest.json)
    echo "MANIFEST_VERSION=$(echo $MANIFEST | jq -r '.manifestVersion')" >> $GITHUB_ENV
```

---

## Manifest Structure

### 1. Project Metadata
```json
{
  "manifestVersion": "2025-11-04",
  "project": "DealershipAI",
  "description": "Unified configuration...",
  "domains": {
    "marketing": "https://dealershipai.com",
    "dashboard": "https://dash.dealershipai.com"
  }
}
```

### 2. Architecture (`structure`)
Maps all directories and entry points:
- `primaryEntry`: `/app/page.tsx` (HeroSection_CupertinoNolan)
- `middleware`: `/middleware.ts` (Clerk auth routing)
- `authProvider`: `"Clerk"`

### 3. Authentication (`authentication`)
Clerk configuration:
- **Enabled on**: `dash.dealershipai.com`
- **Excluded from**: `dealershipai.com` (public landing page)
- **Roles**: admin, dealer, analyst
- **Redirects**:
  - First login → `/onboarding`
  - Returning user → `/pulse/dashboard`
  - Sign out → `/sign-in`

### 4. Onboarding (`onboarding`)
5-step guided setup:
1. Connect Google Business Profile
2. Run AI Visibility Scan
3. Review Pulse Metrics
4. Enable Auto-Fix
5. Finish Setup

**Copilot Integration**:
- Component: `/app/onboarding/components/DAICopilot.tsx`
- Personality: subtle, confident, dry humor
- Tones: professional, witty, cinematic
- Voice Orb: `/components/VoiceOrb.tsx`

### 5. Dashboard (`dashboard`)
Pulse Dashboard at `/pulse`:
- **Components**: PulseDashboard, PulseCard, ForecastCard, UGCCard
- **API Sources**: `/api/ai-scores`, `/api/forecast`, `/api/ugc-health`
- **Copilot Integration**: useDAICopilot hook, theme controller, mood engine
- **Analytics**: Nightly Lighthouse, forecast trends, copilot events

### 6. Landing Page (`landingPage`)
HeroSection_CupertinoNolan at `/components/HeroSection_CupertinoNolan.tsx`:
- **Style**: Christopher Nolan × Cupertino cinematic
- **Features**:
  - AI search-engine rotator (ChatGPT/Perplexity/Gemini/Google AI)
  - Geo-personalization
  - Parallax glass depth
  - Ambient hum (muted by default)
  - URL input with MarketPulse integration

### 7. Theme System (`themeSystem`)
Dynamic theming based on mood:
- **Positive**: Green accent (rgb(34,197,94)), brightness 0.9
- **Neutral**: Blue accent (rgb(59,130,246)), brightness 0.75
- **Reflective**: Purple accent (rgb(139,92,246)), brightness 0.6

### 8. Deployment (`deployment`)
**Vercel**:
- Domains: dealershipai.com, dash.dealershipai.com
- Build command: `npm run build`
- 6 automated cron jobs (quarterly digest, nightly lighthouse, etc.)

**GitHub**:
- Repository: github.com/Kramerbrian/dealership-ai-dashboard
- Branch: main
- Actions: deploy-cinematic-hero.yml, healthcheck.yml

---

## Integration Instructions

### Deploy to GitHub
```bash
git add .
git commit -m 'feat: integrate master manifest'
git push origin main
```

### Deploy to Vercel
```bash
# Ensure environment variables are set
vercel env ls

# Deploy to production
vercel --prod --confirm
```

### Post-Deploy Verification
1. Visit https://dealershipai.com
   - Verify hero rotator works
   - Verify ambient hum is muted by default

2. Visit https://dash.dealershipai.com
   - Login via Clerk
   - Complete onboarding flow
   - Verify pulse dashboard loads

3. Check Slack for deployment notification

4. Run verification script:
   ```bash
   node scripts/verify-landing-deployment.js https://dealershipai.com
   ```

---

## Environment Variables Reference

See [.env.production.example](.env.production.example) for complete list.

### Critical Variables
| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `VERCEL_TOKEN` | Vercel CLI authentication | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `CLERK_SECRET_KEY` | Clerk authentication | [Clerk Dashboard](https://dashboard.clerk.com) |
| `DATABASE_URL` | PostgreSQL connection | Database provider |
| `GMAPS_KEY` | Google Maps for geo features | [Google Cloud Console](https://console.cloud.google.com) |
| `SLACK_WEBHOOK_URL` | Deployment notifications | [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks) |

### Optional but Recommended
- `OPENAI_API_KEY` - AI features (GPT-4, embeddings)
- `SENDGRID_API_KEY` - Email notifications
- `STRIPE_SECRET_KEY` - Payment processing

---

## Security & Privacy

### Session Management
- **Clerk**: Rotating tokens, HttpOnly cookies
- **Role-based access**: admin, dealer, analyst roles

### Telemetry
- Aggregated and anonymized by dealerId hash
- Stored in `/data/copilot-events.json`

### Content Security Policy
Strict CSP with whitelisted domains:
- Stripe: `https://js.stripe.com`
- Clerk: `https://*.clerk.accounts.dev`
- Mapbox: `https://api.mapbox.com`, `https://*.tiles.mapbox.com`
- Analytics: `https://www.google-analytics.com`

### Audio
- Muted by default
- Requires user opt-in to unmute
- Gracefully handles missing audio file

---

## Governance

### Versioning
- **Semantic versioning**: `v2025.11.13`
- **Auto-increment**: True
- **Last updated**: 2025-11-13

### Backups
- Page backup: `/app/page.legacy.backup.tsx`
- Config backup: `/pulse/master-pulse-config.backup.json`
- Deprecated components: `/.disabled-pages/`

### Documentation
- Infrastructure guide: `/docs/deployment-infrastructure.md`
- Completion report: `/docs/deployment-completion-report.md`
- Pulse architecture: `/docs/aim_vindex_pulse_suite.md`
- Audio specs: `/public/audio/README.md`

---

## Cron Jobs

All cron jobs are defined in `vercel.json` and referenced in the manifest:

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/schedule-quarterly` | `0 9 1 */3 *` | Quarterly digest (1st of quarter, 9am) |
| `/api/nightly-lighthouse` | `0 3 * * *` | Nightly Lighthouse audit (3am) |
| `/api/zero-click/recompute` | `0 */4 * * *` | Zero-click recompute (every 4 hours) |
| `/api/cron/fleet-refresh` | `0 8,12,16 * * *` | Fleet refresh (8am, 12pm, 4pm) |
| `/api/cron/nurture` | `0 * * * *` | Nurture campaigns (hourly) |
| `/api/cron/lead-nurture` | `0 10 * * *` | Lead nurture (10am daily) |

---

## Troubleshooting

### Manifest Validation
```bash
# Validate JSON syntax
cat dealershipai-master-manifest.json | jq '.' > /dev/null && echo "✅ Valid JSON"

# Check version
jq -r '.manifestVersion' dealershipai-master-manifest.json

# List all cron jobs
jq '.deployment.vercel.crons[]' dealershipai-master-manifest.json
```

### Environment Check
```bash
# Verify required variables are set
if [ -z "$VERCEL_TOKEN" ]; then echo "❌ VERCEL_TOKEN not set"; fi
if [ -z "$CLERK_SECRET_KEY" ]; then echo "❌ CLERK_SECRET_KEY not set"; fi
if [ -z "$DATABASE_URL" ]; then echo "❌ DATABASE_URL not set"; fi
```

### Deployment Issues
1. Check manifest is valid JSON
2. Verify environment variables in Vercel
3. Review GitHub Actions logs
4. Run local build: `npm run build`
5. Check Vercel deployment logs: `vercel logs https://dealershipai.com`

---

## Next Steps

1. **Review manifest** - Ensure all paths and configurations are correct
2. **Set environment variables** - Use `.env.production.example` as template
3. **Test locally** - `npm run build && npm run start`
4. **Deploy to staging** - `vercel` (without --prod)
5. **Deploy to production** - `vercel --prod --confirm`
6. **Monitor deployment** - Check Slack notifications and run verification

---

## Related Documentation

- [Deployment Infrastructure](./deployment-infrastructure.md) - Complete deployment guide
- [Completion Report](./deployment-completion-report.md) - Latest deployment summary
- [Pulse Suite Architecture](./aim_vindex_pulse_suite.md) - AIM VIN-DEX Pulse Suite
- [Environment Variables](./.env.production.example) - All environment variables

---

**Manifest Location**: `/dealershipai-master-manifest.json`
**Last Updated**: 2025-11-13
**Status**: ✅ Production Ready
**Version**: v2025.11.13
