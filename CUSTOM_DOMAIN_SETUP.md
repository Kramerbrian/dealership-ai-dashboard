# 🌐 DealershipAI Custom Domain Setup Guide

## Current Deployment Status
- **Production URL**: https://dealershipai-dashboard-jcmsb0mml-brian-kramers-projects.vercel.app
- **Inspect URL**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/4xzKaxGj7BrJh4CPz1x7TiFA3gdN

## 🎯 Target Domains
- **Marketing**: marketing.dealershipai.com
- **Main**: main.dealershipai.com

## 📋 Step-by-Step Domain Setup

### 1. Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dealershipai-dashboard` project
3. Click on **Settings** tab
4. Click on **Domains** in the left sidebar

### 2. Add Custom Domains

#### For marketing.dealershipai.com:
1. Click **Add Domain**
2. Enter: `marketing.dealershipai.com`
3. Click **Add**
4. Vercel will provide DNS configuration instructions

#### For main.dealershipai.com:
1. Click **Add Domain** again
2. Enter: `main.dealershipai.com`
3. Click **Add**
4. Vercel will provide DNS configuration instructions

### 3. DNS Configuration

You'll need to add these DNS records to your domain registrar (where dealershipai.com is managed):

#### Option A: CNAME Records (Recommended)
```
Type: CNAME
Name: marketing
Value: cname.vercel-dns.com
TTL: 300

Type: CNAME
Name: main
Value: cname.vercel-dns.com
TTL: 300
```

#### Option B: A Records (Alternative)
```
Type: A
Name: marketing
Value: 76.76.19.61
TTL: 300

Type: A
Name: main
Value: 76.76.19.61
TTL: 300
```

### 4. Verify Domain Configuration

After adding DNS records:
1. Wait 5-10 minutes for DNS propagation
2. Check domain status in Vercel dashboard
3. Test both domains:
   - https://marketing.dealershipai.com
   - https://main.dealershipai.com

## 🚀 MarketingLanding.tsx Deployment

The MarketingLanding.tsx component is already deployed and will be accessible at both domains once configured.

### Component Features:
- **Clean Design**: Slate-900 background with cyan accents
- **Interactive Modal**: MarketingInfographicModal integration
- **Responsive Layout**: Mobile-friendly design
- **Export Functionality**: SVG export at 3840px width
- **Modern UI**: Gradient backgrounds and clean typography

## 🔧 Environment Variables for Marketing

Add these environment variables in Vercel for the marketing site:

```bash
NEXT_PUBLIC_APP_URL="https://marketing.dealershipai.com"
NEXT_PUBLIC_MARKETING_MODE="true"
NEXT_PUBLIC_INFROGRAPHIC_ENABLED="true"
```

## 📊 Domain Status Monitoring

### Check Domain Status:
```bash
# Check domain configuration
vercel domains inspect marketing.dealershipai.com
vercel domains inspect main.dealershipai.com

# List all domains
vercel domains list
```

### Test Domains:
```bash
# Test marketing domain
curl -I https://marketing.dealershipai.com

# Test main domain
curl -I https://main.dealershipai.com
```

## 🎨 MarketingLanding.tsx Features

The deployed component includes:

1. **Header Section**:
   - DealershipAI branding with gradient logo
   - "Open Infographic Modal" button

2. **Main Content**:
   - AI optimization messaging
   - "Influence how consumers discover your products in AI" headline
   - Feature list with clean design elements

3. **Interactive Elements**:
   - Preview infographic button
   - Download SVG functionality
   - Modal integration

4. **Design Elements**:
   - Teal background (#009FCF)
   - Rounded nodes with subtle shadows
   - Minimal icons for AI platforms
   - Dashed connectors with perfect spacing

## 🚨 Troubleshooting

### Common Issues:

1. **Domain not resolving**:
   - Check DNS propagation: https://dnschecker.org
   - Verify CNAME records are correct
   - Wait up to 24 hours for full propagation

2. **SSL certificate issues**:
   - Vercel automatically provisions SSL certificates
   - Wait 5-10 minutes after domain verification

3. **404 errors**:
   - Ensure domain is properly configured in Vercel
   - Check that the project is deployed to production

### Debug Commands:
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs dealershipai-dashboard-jcmsb0mml-brian-kramers-projects.vercel.app

# Redeploy if needed
vercel --prod
```

## ✅ Verification Checklist

- [ ] marketing.dealershipai.com added to Vercel
- [ ] main.dealershipai.com added to Vercel
- [ ] DNS records configured at domain registrar
- [ ] Domains verified in Vercel dashboard
- [ ] SSL certificates issued
- [ ] Both domains accessible in browser
- [ ] MarketingLanding.tsx component loads correctly
- [ ] Infographic modal functionality works
- [ ] Mobile responsiveness verified

## 🎉 Success!

Once all steps are completed, your MarketingLanding.tsx component will be live at:
- **Marketing**: https://marketing.dealershipai.com
- **Main**: https://main.dealershipai.com

Both domains will serve the same beautiful marketing landing page with the interactive infographic modal!
