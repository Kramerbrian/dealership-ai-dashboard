# Custom Domain Setup Guide
## Setting up dealershipai.com on Vercel

This guide covers the complete setup of `dealershipai.com` as your production domain, including DNS configuration, SSL certificates, and email domain verification for Resend.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Vercel Domain Configuration](#vercel-domain-configuration)
3. [DNS Configuration](#dns-configuration)
4. [SSL Certificate Verification](#ssl-certificate-verification)
5. [Email Domain Setup (Resend)](#email-domain-setup-resend)
6. [Environment Variables Update](#environment-variables-update)
7. [Subdomain Strategy](#subdomain-strategy)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [ ] Domain registered at a registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- [ ] Access to domain DNS settings
- [ ] Vercel account with project deployed
- [ ] Resend account for email sending

---

## Vercel Domain Configuration

### Step 1: Add Domain to Vercel Project

1. **Navigate to Project Settings**
   ```
   Vercel Dashboard → Your Project → Settings → Domains
   ```

2. **Add Production Domain**
   ```
   Enter domain: dealershipai.com
   Click "Add"
   ```

3. **Add www Subdomain** (Recommended)
   ```
   Enter domain: www.dealershipai.com
   Click "Add"
   Set redirect: www → dealershipai.com (or vice versa)
   ```

4. **Vercel Will Provide DNS Records**
   You'll see instructions like:
   ```
   A Record:
   Name: @
   Value: 76.76.21.21

   CNAME Record (for www):
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 2: Choose Primary Domain

**Option A: Apex Domain (Recommended for SEO)**
- Primary: `dealershipai.com`
- Redirect: `www.dealershipai.com` → `dealershipai.com`

**Option B: WWW Subdomain**
- Primary: `www.dealershipai.com`
- Redirect: `dealershipai.com` → `www.dealershipai.com`

**Our Recommendation:** Use apex domain (dealershipai.com) as primary.

---

## DNS Configuration

### For Most DNS Providers (GoDaddy, Namecheap, etc.)

1. **Login to Your Domain Registrar**
   - Navigate to DNS Management / DNS Settings

2. **Add A Record for Apex Domain**
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21
   TTL: 3600 (or Auto)
   ```

3. **Add CNAME Record for www**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

4. **Remove Conflicting Records**
   - Delete any existing A records for @ or www
   - Delete any existing CNAME records for @ or www
   - Remove any AAAA records if present

### For Cloudflare DNS (Special Configuration)

Cloudflare requires additional steps:

1. **Disable Cloudflare Proxy (Important!)**
   ```
   Click the orange cloud icon to turn it gray (DNS only)
   This prevents SSL certificate verification issues
   ```

2. **Add DNS Records**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   Proxy Status: DNS Only (gray cloud)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   Proxy Status: DNS Only (gray cloud)
   ```

3. **SSL/TLS Settings**
   ```
   Cloudflare Dashboard → SSL/TLS → Overview
   Set to: Full (strict) or Full
   ```

### DNS Propagation Time
- **Typical:** 5-30 minutes
- **Maximum:** Up to 48 hours
- **Check Status:** Use `dig dealershipai.com` or https://dnschecker.org

---

## SSL Certificate Verification

Vercel automatically provisions SSL certificates via Let's Encrypt.

### Verification Steps

1. **Wait for DNS Propagation**
   ```bash
   # Check if DNS is resolving correctly
   dig dealershipai.com
   dig www.dealershipai.com

   # Should show Vercel's IP: 76.76.21.21
   ```

2. **Monitor Certificate Status in Vercel**
   ```
   Vercel Dashboard → Domains

   Status should show:
   ✓ dealershipai.com (SSL Certificate Valid)
   ✓ www.dealershipai.com (SSL Certificate Valid)
   ```

3. **Force Certificate Renewal (If Needed)**
   ```
   If stuck on "Pending":
   - Remove domain from Vercel
   - Wait 5 minutes
   - Re-add domain
   ```

### Test SSL Certificate

```bash
# Check SSL certificate
curl -I https://dealershipai.com

# Should return 200 OK with valid certificate
# Look for: "SSL certificate verify ok"
```

---

## Email Domain Setup (Resend)

To send emails from `@dealershipai.com`, you need to verify the domain with Resend.

### Step 1: Add Domain to Resend

1. **Login to Resend Dashboard**
   ```
   https://resend.com/domains
   ```

2. **Add Domain**
   ```
   Click "Add Domain"
   Enter: dealershipai.com
   Click "Add"
   ```

3. **Resend Will Provide DNS Records**
   Example records:
   ```
   TXT Record (SPF):
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all

   CNAME Record (DKIM):
   Name: resend._domainkey
   Value: resend._domainkey.resend.com

   CNAME Record (DKIM 2):
   Name: resend2._domainkey
   Value: resend2._domainkey.resend.com

   TXT Record (DMARC - Optional):
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@dealershipai.com
   ```

### Step 2: Add DNS Records for Email

**Add to Your DNS Provider:**

1. **SPF Record (Required)**
   ```
   Type: TXT
   Name: @ (or leave blank)
   Value: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   ```

2. **DKIM Records (Required)**
   ```
   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.resend.com
   TTL: 3600

   Type: CNAME
   Name: resend2._domainkey
   Value: resend2._domainkey.resend.com
   TTL: 3600
   ```

3. **DMARC Record (Recommended)**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@dealershipai.com
   TTL: 3600
   ```

### Step 3: Verify Domain in Resend

1. **Wait for DNS Propagation** (15-30 minutes)

2. **Click "Verify" in Resend Dashboard**
   ```
   Status should change to: ✓ Verified
   ```

3. **Test Email Sending**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@dealershipai.com",
       "to": "your-test-email@example.com",
       "subject": "Test Email",
       "html": "<p>Test from dealershipai.com</p>"
     }'
   ```

### Step 4: Update Email Configuration

**In `.env.local` and Vercel Environment Variables:**
```bash
FROM_EMAIL=noreply@dealershipai.com
RESEND_API_KEY=re_your_actual_api_key
```

---

## Environment Variables Update

### Update Production Environment Variables

1. **Vercel Dashboard → Project → Settings → Environment Variables**

2. **Update or Add:**
   ```bash
   # Production Domain
   NEXT_PUBLIC_BASE_URL=https://dealershipai.com

   # Email Configuration
   FROM_EMAIL=noreply@dealershipai.com
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

   # Supabase (Should already be set)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # Rate Limiting (Optional but recommended)
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx

   # AI Platform APIs (For real data)
   OPENAI_API_KEY=sk-xxx
   ANTHROPIC_API_KEY=sk-ant-xxx
   GOOGLE_API_KEY=AIzaxxx
   PERPLEXITY_API_KEY=pplx-xxx

   # Reviews APIs (For real data)
   GOOGLE_PLACES_API_KEY=AIzaxxx
   YELP_API_KEY=xxx
   ```

3. **Redeploy After Updating**
   ```bash
   vercel --prod

   # Or trigger redeploy in Vercel Dashboard
   ```

---

## Subdomain Strategy

### Recommended Subdomain Structure

```
dealershipai.com              → Main landing page, instant analyzer
www.dealershipai.com          → Redirect to apex domain
app.dealershipai.com          → Fleet management dashboard (future)
api.dealershipai.com          → API endpoints (future)
docs.dealershipai.com         → Documentation (future)
status.dealershipai.com       → Status page (future)
```

### Setting Up Subdomains in Vercel

**For each subdomain:**

1. **Add to Vercel**
   ```
   Domains → Add Domain → app.dealershipai.com
   ```

2. **Add CNAME Record in DNS**
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Configure Routing** (if needed)
   ```typescript
   // next.config.js
   module.exports = {
     async rewrites() {
       return [
         {
           source: '/:path*',
           destination: '/:path*',
           has: [{ type: 'host', value: 'app.dealershipai.com' }],
         },
       ];
     },
   };
   ```

---

## Testing & Verification

### Pre-Launch Checklist

- [ ] **DNS Resolution**
  ```bash
  dig dealershipai.com
  dig www.dealershipai.com
  # Should show Vercel's IP
  ```

- [ ] **SSL Certificate**
  ```bash
  curl -I https://dealershipai.com
  # Should return 200 OK with valid SSL
  ```

- [ ] **WWW Redirect**
  ```bash
  curl -I https://www.dealershipai.com
  # Should redirect to https://dealershipai.com (or vice versa)
  ```

- [ ] **Email Domain Verification**
  - Check Resend dashboard shows "Verified"
  - Send test email from noreply@dealershipai.com
  - Check spam score at https://www.mail-tester.com

- [ ] **Instant Analyzer**
  ```bash
  curl https://dealershipai.com/instant
  # Should return 200 OK
  ```

- [ ] **API Endpoints**
  ```bash
  curl https://dealershipai.com/api/health
  curl https://dealershipai.com/api/ai/health
  ```

- [ ] **Analytics Tracking**
  - Open https://dealershipai.com in browser
  - Open DevTools console
  - Check for analytics events being logged

- [ ] **Rate Limiting**
  ```bash
  # Make 6 rapid requests to test rate limit
  for i in {1..6}; do
    curl -X POST https://dealershipai.com/api/capture-email \
      -H "Content-Type: application/json" \
      -d '{"dealer":"Test","email":"test@example.com"}'
  done
  # Should see 429 Too Many Requests on 6th request
  ```

### Post-Launch Monitoring

1. **Set Up Uptime Monitoring**
   - Use UptimeRobot, Pingdom, or Better Uptime
   - Monitor: `https://dealershipai.com`, `https://dealershipai.com/api/health`

2. **Set Up Error Tracking**
   - Install Sentry (see production steps)
   - Monitor for 500 errors, SSL issues

3. **Monitor Email Deliverability**
   - Check Resend dashboard for bounces
   - Monitor spam complaints
   - Check DMARC reports

---

## Troubleshooting

### Issue: "Domain not found" in Vercel

**Solution:**
```bash
1. Verify DNS records are correct
2. Wait 15-30 minutes for propagation
3. Check dig dealershipai.com shows Vercel's IP
4. Clear DNS cache: sudo dscacheutil -flushcache (Mac)
```

### Issue: SSL Certificate Stuck on "Pending"

**Solution:**
```bash
1. Remove domain from Vercel
2. Wait 5 minutes
3. Re-add domain
4. If using Cloudflare: Ensure proxy is disabled (gray cloud)
5. Check DNS is resolving to Vercel's IP
```

### Issue: Emails Not Sending

**Solution:**
```bash
1. Verify domain in Resend dashboard
2. Check SPF/DKIM records are correct: dig TXT dealershipai.com
3. Test with mail-tester.com
4. Check FROM_EMAIL matches verified domain
5. Review Resend logs for bounces
```

### Issue: www Not Redirecting

**Solution:**
```bash
1. Verify CNAME record for www exists
2. Check Vercel domain settings show redirect configured
3. Clear browser cache
4. Test in incognito mode
```

### Issue: Mixed Content Warnings

**Solution:**
```bash
1. Ensure all assets use https://
2. Check Next.js config for asset prefix
3. Update NEXT_PUBLIC_BASE_URL to https://dealershipai.com
4. Redeploy
```

### Issue: Rate Limiting Not Working

**Solution:**
```bash
1. Verify UPSTASH_REDIS_REST_URL is set in Vercel
2. Check Redis connection: curl $UPSTASH_REDIS_REST_URL/ping
3. Review rate-limit.ts logs
4. Test locally with Redis configured
```

---

## Quick Reference: DNS Records Summary

### Complete DNS Configuration for dealershipai.com

```dns
# Main Domain (Vercel)
A       @                   76.76.21.21                     3600
CNAME   www                 cname.vercel-dns.com            3600

# Email (Resend)
TXT     @                   v=spf1 include:_spf.resend.com ~all        3600
CNAME   resend._domainkey   resend._domainkey.resend.com   3600
CNAME   resend2._domainkey  resend2._domainkey.resend.com  3600
TXT     _dmarc              v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@dealershipai.com  3600

# Optional: Subdomain for API (Future)
CNAME   api                 cname.vercel-dns.com            3600

# Optional: Status Page (Future)
CNAME   status              cname.vercel-dns.com            3600
```

---

## Post-Setup Tasks

After domain is live:

1. **Update Documentation**
   - [ ] Update README.md with production URL
   - [ ] Update API documentation
   - [ ] Update CORS allowed origins if needed

2. **Update External Services**
   - [ ] Update Clerk allowed domains (if using)
   - [ ] Update OAuth redirect URIs
   - [ ] Update webhook URLs
   - [ ] Update sitemap.xml base URL

3. **Marketing & SEO**
   - [ ] Submit sitemap to Google Search Console
   - [ ] Add Google Analytics property for dealershipai.com
   - [ ] Update social media links
   - [ ] Update email signatures

4. **Monitoring Setup**
   - [ ] Configure uptime monitoring
   - [ ] Set up SSL expiration alerts
   - [ ] Configure email deliverability monitoring
   - [ ] Set up performance monitoring

---

## Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
- [DNS Checker Tool](https://dnschecker.org)
- [SSL Test Tool](https://www.ssllabs.com/ssltest/)
- [Email Spam Test](https://www.mail-tester.com)
- [SPF/DKIM Validator](https://mxtoolbox.com/spf.aspx)

---

## Support

If you encounter issues:

1. **Vercel Support:** [vercel.com/support](https://vercel.com/support)
2. **Resend Support:** [resend.com/support](https://resend.com/support)
3. **Check Status Pages:**
   - Vercel: [vercel-status.com](https://vercel-status.com)
   - Resend: [status.resend.com](https://status.resend.com)
