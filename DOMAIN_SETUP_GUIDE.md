# 🌐 DealershipAI Domain Configuration Guide

## Current Deployment Status
- **Production URL**: https://dealershipai-dashboard-77fe0bcs5-brian-kramers-projects.vercel.app
- **Project**: dealershipai-dashboard
- **Team**: brian-kramers-projects

## Domain Configuration Steps

### 1. Main Domain: main.dealershipai.com

#### Option A: Through Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dealershipai-dashboard` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter `main.dealershipai.com`
6. Follow the DNS configuration instructions

#### Option B: Through CLI (Alternative)
```bash
vercel domains add main.dealershipai.com
```

### 2. Dashboard Subdomain: dash.dealershipai.com

Since `dash.dealershipai.com` is already assigned to another project, you have two options:

#### Option A: Transfer from Existing Project
1. Go to the existing project that owns `dash.dealershipai.com`
2. Remove the domain from that project
3. Add it to `dealershipai-dashboard` project

#### Option B: Use Different Subdomain
```bash
vercel domains add dashboard.dealershipai.com
# or
vercel domains add app.dealershipai.com
# or
vercel domains add analytics.dealershipai.com
```

### 3. DNS Configuration

For each domain you add, Vercel will provide DNS records to add:

#### Typical DNS Records:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: dash (or your chosen subdomain)
Value: cname.vercel-dns.com
```

### 4. Routing Configuration

The current `vercel.json` already handles routing:

```json
{
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/dashboard",
      "destination": "/intelligence"
    }
  ]
}
```

### 5. SSL Certificate

Vercel automatically provides SSL certificates for custom domains:
- **Automatic**: SSL certificates are provisioned automatically
- **Verification**: Domain ownership must be verified first
- **Renewal**: Certificates auto-renew

## Verification Steps

### 1. Domain Ownership Verification
1. Add the domain in Vercel dashboard
2. Vercel will provide DNS records to add
3. Add the records to your DNS provider
4. Wait for verification (usually 5-10 minutes)

### 2. Test the Configuration
```bash
# Test main domain
curl -I https://main.dealershipai.com

# Test dashboard subdomain
curl -I https://dash.dealershipai.com
```

## Current Application Structure

### Landing Page (main.dealershipai.com)
- **Route**: `/`
- **Component**: `app/(site)/landing/page.tsx`
- **Features**: 
  - Glass morphism design
  - Theme toggle
  - Interactive dashboard preview
  - Pricing and features

### Intelligence Dashboard (dash.dealershipai.com)
- **Route**: `/intelligence`
- **Component**: `app/(dashboard)/intelligence/page.tsx`
- **Features**:
  - Tabbed interface
  - Export/share functionality
  - Theme-aware design
  - Analytics views

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: Domain ownership not verified
   - Solution: Complete DNS verification process

2. **Domain already assigned**: Subdomain in use by another project
   - Solution: Transfer domain or use different subdomain

3. **SSL Certificate Issues**: 
   - Solution: Wait for automatic provisioning (up to 24 hours)

### Support Commands:
```bash
# Check domain status
vercel domains ls

# Inspect deployment
vercel inspect [deployment-url]

# Check logs
vercel logs [deployment-url]
```

## Next Steps After Domain Setup

1. **Analytics Integration**
   - Add Google Analytics
   - Configure conversion tracking
   - Set up custom events

2. **Performance Monitoring**
   - Enable Vercel Analytics
   - Set up Core Web Vitals monitoring
   - Configure error tracking

3. **SEO Optimization**
   - Add meta tags
   - Configure sitemap
   - Set up structured data

4. **Security Headers**
   - Already configured in `next.config.js`
   - Consider adding CSP headers
   - Enable HSTS

## Contact Information

For domain-related issues:
- **Vercel Support**: https://vercel.com/help
- **DNS Provider**: Contact your domain registrar
- **Project Owner**: brian-kramers-projects

---

**Last Updated**: $(date)
**Deployment URL**: https://dealershipai-dashboard-77fe0bcs5-brian-kramers-projects.vercel.app