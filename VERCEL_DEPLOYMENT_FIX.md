# Vercel Deployment Fix for dash.dealershipai.com

## Current Issue
The Vercel project has an incorrect root directory configured: `~/dealership-ai-dashboard/apps/web`

This needs to be changed to the actual project root: `.` (current directory)

## Step-by-Step Fix

### 1. Fix Vercel Project Settings

Go to the Vercel project settings page:
**https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings**

#### Navigate to General Settings
1. Click on **Settings** in the top navigation
2. Look for **Root Directory** setting
3. **IMPORTANT**: Leave the Root Directory field **completely empty** (blank) for root directory
4. Or if you need to keep it, remove `~/dealership-ai-dashboard/apps/web`
5. The field should be empty or contain a relative path without `./` or special characters
6. Click **Save**

### 2. Configure Build Settings

While in Settings, verify these build settings:

#### Build & Development Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` or `prisma generate && next build`
- **Output Directory**: `.next` (leave default)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. Configure Environment Variables

Go to: **https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables**

Add these environment variables for production:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
NEXT_PUBLIC_MAIN_URL=https://main.dealershipai.com
NEXTAUTH_URL=https://dash.dealershipai.com
```

### 4. Deploy from Git (Automatic)

After fixing the root directory setting, Vercel should automatically deploy when you push to main:

```bash
# Push the changes to trigger automatic deployment
git push origin main
```

### 5. Manual Deploy (Alternative)

If automatic deployment doesn't work, deploy manually from the CLI:

```bash
# Remove old Vercel config
rm -rf .vercel

# Link the project again
vercel link --yes

# Deploy to production
vercel --prod --yes
```

### 6. Configure Custom Domain: dash.dealershipai.com

Go to: **https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains**

#### Add the Domain
1. Click **Add Domain**
2. Enter: `dash.dealershipai.com`
3. Click **Add**

#### Configure DNS Records

Vercel will provide DNS configuration. Add this to your domain registrar:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: 300
```

**Option B: A Record**
```
Type: A
Name: dash
Value: 76.76.19.61
TTL: 300
```

### 7. Verify Deployment

Once deployed, test the dashboard:

#### Test URLs
- **Vercel URL**: https://dealership-ai-dashboard.vercel.app/dash
- **Custom Domain**: https://dash.dealershipai.com/dash
- **Root Domain**: https://dash.dealershipai.com

#### Test Features
- [ ] Dashboard loads correctly
- [ ] Tab navigation works (Overview, AI Health, Website, Schema, Reviews, War Room, Settings)
- [ ] SEO, AEO, GEO cards display metrics
- [ ] Modal dialogs open when clicking cards
- [ ] EEAT improvement opportunities show in modals
- [ ] Deploy buttons trigger alerts
- [ ] Opportunities Engine displays correctly
- [ ] Live status indicator shows current time
- [ ] Mobile responsiveness works

## Current Git Status

### Committed Changes
✅ DealershipAIDashboardLA component deployed to `/dash` route
✅ Full EEAT functionality implemented
✅ Interactive modal system with improvement opportunities
✅ Tab navigation system
✅ AI Opportunities Engine

### Commit Hash
Latest commit: `7cc6711` - "feat: deploy DealershipAIDashboardLA to /dash route"

## Deployment Commands Reference

### Check Deployment Status
```bash
vercel ls
```

### View Deployment Logs
```bash
vercel logs <deployment-url>
```

### Check Domain Status
```bash
vercel domains ls
```

### Inspect Specific Domain
```bash
vercel domains inspect dash.dealershipai.com
```

## Troubleshooting

### Issue: "Root directory does not exist"
**Solution**: Change root directory in Vercel settings from `~/dealership-ai-dashboard/apps/web` to `.`

### Issue: Build fails with "Cannot find module"
**Solution**: Ensure `prisma generate` runs before build:
```json
"build": "prisma generate && next build"
```

### Issue: Domain not resolving
**Solution**:
1. Check DNS propagation: https://dnschecker.org
2. Wait up to 24 hours for full propagation
3. Verify CNAME/A record is correct in domain registrar

### Issue: 404 on /dash route
**Solution**: Ensure `app/dash/page.tsx` exists and is deployed

## Success Criteria

✅ Vercel project root directory fixed
✅ Build completes successfully
✅ Dashboard accessible at /dash route
✅ Custom domain dash.dealershipai.com configured
✅ DNS records properly set
✅ SSL certificate issued
✅ All dashboard features functional

## Next Steps

1. Fix Vercel root directory setting (most important!)
2. Push to git to trigger deployment
3. Configure custom domain
4. Add DNS records
5. Test dashboard functionality
6. Verify all features work correctly

## Support Links

- Vercel Project Settings: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings
- Vercel Domains: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
- Vercel Environment Variables: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
- DNS Checker: https://dnschecker.org
- Vercel Documentation: https://vercel.com/docs

---

**Created**: $(date)
**Dashboard Component**: DealershipAIDashboardLA
**Target Route**: /dash
**Target Domain**: dash.dealershipai.com
