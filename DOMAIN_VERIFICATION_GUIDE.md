# 🌐 DealershipAI Domain Verification & Optimization Guide

## Current Domain Configuration

### Primary Domains
- **main.dealershipai.com** - Main application/landing page
- **marketing.dealershipai.com** - Marketing website  
- **dash.dealershipai.com** - Dashboard application

### Root Domain
- **dealershipai.com** - Root domain (should redirect to main)

## Domain Verification Process

### 1. Automated Verification
Run the domain verification script to check all domains:

```bash
npm run verify:domains
```

This script will:
- ✅ Check DNS resolution for each domain
- ✅ Verify SSL certificate validity
- ✅ Test HTTPS connectivity and response times
- ✅ Generate a detailed report with recommendations

### 2. Manual Verification Steps

#### DNS Configuration Check
```bash
# Check DNS resolution
nslookup main.dealershipai.com
nslookup marketing.dealershipai.com
nslookup dash.dealershipai.com

# Expected results should show Vercel IPs or CNAME records
```

#### SSL Certificate Check
```bash
# Check SSL certificate
openssl s_client -connect main.dealershipai.com:443 -servername main.dealershipai.com
openssl s_client -connect marketing.dealershipai.com:443 -servername marketing.dealershipai.com
openssl s_client -connect dash.dealershipai.com:443 -servername dash.dealershipai.com
```

#### HTTPS Connectivity Test
```bash
# Test HTTPS connectivity
curl -I https://main.dealershipai.com
curl -I https://marketing.dealershipai.com
curl -I https://dash.dealershipai.com
```

## Required DNS Configuration

### For Each Subdomain
Add these DNS records to your domain registrar:

```
Type: CNAME
Name: main
Value: cname.vercel-dns.com
TTL: 300

Type: CNAME
Name: marketing
Value: cname.vercel-dns.com
TTL: 300

Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: 300
```

### For Root Domain
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 300

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

## Vercel Dashboard Configuration

### 1. Add Domains
Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains

Add each domain:
- `main.dealershipai.com`
- `marketing.dealershipai.com`
- `dash.dealershipai.com`

### 2. Verify Domain Ownership
- Vercel will provide DNS verification records
- Add the verification records to your DNS
- Wait for verification (usually 5-10 minutes)

### 3. SSL Certificate Provisioning
- SSL certificates are automatically provisioned by Vercel
- Wait 5-10 minutes after DNS verification
- Test HTTPS access to confirm certificates are active

## Domain Routing Strategy

### Current Routing Configuration
The `vercel.json` file handles routing:

```json
{
  "rewrites": [
    {
      "source": "/main",
      "destination": "/landing"
    },
    {
      "source": "/dashboard", 
      "destination": "/intelligence"
    },
    {
      "source": "/app",
      "destination": "/intelligence"
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/marketing.html",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

### Domain-Specific Routing
- **main.dealershipai.com** → Landing page (`/`)
- **marketing.dealershipai.com** → Marketing content (`/`)
- **dash.dealershipai.com** → Dashboard (`/intelligence`)

## Performance Optimization

### 1. CDN Configuration
- Vercel automatically provides global CDN
- Static assets are cached at edge locations
- API responses can be cached with proper headers

### 2. Caching Headers
The `vercel.json` includes optimized caching:

```json
{
  "headers": [
    {
      "source": "/_next/static/(.*)",
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

### 3. Image Optimization
- Next.js Image component with WebP/AVIF support
- Automatic image optimization and resizing
- Lazy loading for better performance

## Security Configuration

### 1. SSL/TLS
- Automatic HTTPS redirect
- HSTS (HTTP Strict Transport Security) enabled
- Modern TLS configuration

### 2. Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
        }
      ]
    }
  ]
}
```

### 3. CORS Configuration
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://marketing.dealershipai.com, https://dash.dealershipai.com, https://main.dealershipai.com"
        }
      ]
    }
  ]
}
```

## Monitoring & Analytics

### 1. Domain Health Monitoring
- Use the verification script regularly
- Monitor response times and uptime
- Set up alerts for domain issues

### 2. Performance Monitoring
- Vercel Analytics for performance metrics
- Google Analytics for user behavior
- Core Web Vitals monitoring

### 3. Error Tracking
- Sentry for error monitoring
- Vercel function logs for API issues
- DNS monitoring for resolution issues

## Troubleshooting

### Common Issues

#### DNS Not Resolving
```bash
# Check DNS propagation
dig main.dealershipai.com
nslookup main.dealershipai.com

# Clear DNS cache
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns            # Windows
```

#### SSL Certificate Issues
- Check Vercel dashboard for certificate status
- Ensure domain is properly verified
- Wait for certificate provisioning (up to 24 hours)

#### HTTPS Not Working
- Verify DNS is pointing to Vercel
- Check if domain is added to Vercel project
- Ensure SSL certificate is active

#### Slow Response Times
- Check Vercel function logs
- Monitor database query performance
- Optimize API responses
- Use Vercel Edge Network

### Verification Checklist

- [ ] All domains added to Vercel project
- [ ] DNS records configured correctly
- [ ] SSL certificates active and valid
- [ ] HTTPS working for all domains
- [ ] Response times under 2 seconds
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Analytics tracking working
- [ ] Error monitoring active
- [ ] Performance monitoring set up

## Next Steps

1. **Run Domain Verification**: `npm run verify:domains`
2. **Review Report**: Check generated `domain-verification-results.json`
3. **Fix Issues**: Address any DNS, SSL, or connectivity problems
4. **Monitor Performance**: Set up ongoing monitoring
5. **Regular Checks**: Run verification script weekly

## Support Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [DNS Configuration Guide](https://vercel.com/docs/concepts/projects/domains/add-a-domain)
- [SSL Certificate Management](https://vercel.com/docs/concepts/projects/domains/custom-domains)
- [Performance Optimization](https://vercel.com/docs/concepts/analytics)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: DealershipAI Team
