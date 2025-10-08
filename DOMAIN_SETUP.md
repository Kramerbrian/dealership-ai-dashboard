# 🌐 Custom Domain Configuration Guide

This guide will help you set up a custom domain for your DealershipAI dashboard.

## 📋 Prerequisites

- Vercel account (or your preferred hosting platform)
- Domain registrar account (GoDaddy, Namecheap, Cloudflare, etc.)
- Access to DNS management

## 🚀 Step 1: Vercel Domain Configuration

### 1.1 Add Domain to Vercel Project

1. Go to your Vercel dashboard
2. Select your `dealership-ai-dashboard` project
3. Navigate to **Settings** → **Domains**
4. Add your custom domain (e.g., `dealershipai.com`)

### 1.2 Configure Domain Settings

```bash
# Primary domain
dealershipai.com

# Subdomains (optional)
app.dealershipai.com
dashboard.dealershipai.com
api.dealershipai.com
```

## 🔧 Step 2: DNS Configuration

### 2.1 Apex Domain Setup

Add these DNS records to your domain registrar:

```dns
# Apex domain
Type: A
Name: @
Value: 76.76.19.61

# CNAME for www
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2.2 Subdomain Setup (Optional)

```dns
# API subdomain
Type: CNAME
Name: api
Value: cname.vercel-dns.com

# Dashboard subdomain
Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
```

## ⚙️ Step 3: Environment Variables Update

Update your environment variables with the new domain:

```bash
# Production URLs
NEXT_PUBLIC_URL=https://dealershipai.com
VERCEL_URL=https://dealershipai.com

# Stripe Configuration (update webhook URLs)
STRIPE_WEBHOOK_URL=https://dealershipai.com/api/webhooks/stripe

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## 🔒 Step 4: SSL Certificate

Vercel automatically provides SSL certificates, but verify:

1. Go to **Settings** → **Domains**
2. Ensure SSL certificate is active
3. Check for any SSL warnings

## 🧪 Step 5: Testing Domain Setup

### 5.1 Basic Connectivity Test

```bash
# Test domain resolution
nslookup dealershipai.com

# Test HTTPS
curl -I https://dealershipai.com

# Test subdomains
curl -I https://api.dealershipai.com
```

### 5.2 Application Testing

1. **Homepage**: `https://dealershipai.com`
2. **Dashboard**: `https://dealershipai.com/dashboard`
3. **Pricing**: `https://dealershipai.com/pricing.html`
4. **API**: `https://dealershipai.com/api/checkout`

## 🔄 Step 6: Update Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Update webhook URL to: `https://dealershipai.com/api/webhooks/stripe`
3. Test webhook delivery
4. Verify webhook events are being received

## 📊 Step 7: Analytics & Monitoring

### 7.1 Google Analytics Setup

```html
<!-- Add to all HTML pages -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 7.2 Uptime Monitoring

Set up monitoring for:
- `https://dealershipai.com` (main site)
- `https://dealershipai.com/api/checkout` (critical API)
- `https://dealershipai.com/api/webhooks/stripe` (webhook endpoint)

## 🚨 Step 8: Security Headers

Your `vercel.json` already includes security headers, but verify:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; ..."
        }
      ]
    }
  ]
}
```

## 🔧 Step 9: Performance Optimization

### 9.1 CDN Configuration

Vercel automatically provides CDN, but optimize:

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 9.2 Image Optimization

```json
{
  "images": {
    "domains": ["dealershipai.com"],
    "formats": ["image/webp", "image/avif"]
  }
}
```

## 📱 Step 10: Mobile & PWA Setup

### 10.1 PWA Manifest

Create `public/manifest.json`:

```json
{
  "name": "DealershipAI Dashboard",
  "short_name": "DealershipAI",
  "description": "AI-powered dealership analytics and monitoring",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎯 Step 11: SEO Optimization

### 11.1 Meta Tags

Add to all pages:

```html
<meta name="description" content="AI-powered dealership analytics and monitoring dashboard">
<meta name="keywords" content="dealership, AI, analytics, monitoring, automotive">
<meta property="og:title" content="DealershipAI Dashboard">
<meta property="og:description" content="Transform your dealership with AI-powered insights">
<meta property="og:url" content="https://dealershipai.com">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### 11.2 Sitemap

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dealershipai.com</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://dealershipai.com/pricing.html</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## ✅ Step 12: Final Verification

### 12.1 Checklist

- [ ] Domain resolves correctly
- [ ] HTTPS certificate active
- [ ] All pages load without errors
- [ ] Stripe webhooks working
- [ ] Analytics tracking
- [ ] Mobile responsive
- [ ] Performance scores > 90
- [ ] Security headers active

### 12.2 Performance Testing

```bash
# Test with Lighthouse
npx lighthouse https://dealershipai.com --view

# Test with PageSpeed Insights
# Visit: https://pagespeed.web.dev/
```

## 🆘 Troubleshooting

### Common Issues

1. **DNS Propagation**: Wait 24-48 hours for full propagation
2. **SSL Certificate**: May take up to 24 hours to activate
3. **Webhook Issues**: Check Stripe webhook logs
4. **CORS Errors**: Verify API endpoints are accessible

### Support Resources

- Vercel Documentation: https://vercel.com/docs
- Stripe Webhooks: https://stripe.com/docs/webhooks
- DNS Checker: https://dnschecker.org/

## 🎉 You're Live!

Your custom domain is now configured! Users can access your DealershipAI dashboard at:

- **Main Site**: https://dealershipai.com
- **Dashboard**: https://dealershipai.com/dashboard
- **Pricing**: https://dealershipai.com/pricing.html
- **API**: https://dealershipai.com/api/checkout

Happy launching! 🚀
