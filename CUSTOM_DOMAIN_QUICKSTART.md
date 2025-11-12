# Custom Domain Quick Start Guide
## Deploy dealershipai.com in 15 Minutes

This is your fast-track guide to deploying your application with the custom domain `dealershipai.com`.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Domain registered (dealershipai.com)
- [ ] Access to domain DNS settings
- [ ] Vercel account created
- [ ] Supabase project created
- [ ] Resend account created (for email)
- [ ] Git repository connected to Vercel

---

## Option 1: Automated Deployment (Recommended)

### Run the Deployment Script

```bash
./scripts/deploy-custom-domain.sh
```

The script will guide you through:
1. Prerequisites check
2. Environment variables verification
3. DNS configuration check
4. Database migrations confirmation
5. Build verification
6. Domain configuration
7. Production deployment
8. Health checks
9. Post-deployment verification

**Estimated Time:** 10-15 minutes (excluding DNS propagation)

---

## Option 2: Manual Step-by-Step

### Step 1: Configure DNS (5 minutes)

**In Your DNS Provider (GoDaddy, Namecheap, Cloudflare, etc.):**

Add these records:

```dns
# Vercel domain
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Resend email
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.resend.com
```

**Important:** Delete any existing A or CNAME records for @ or www first!

See [docs/DNS_RECORDS.txt](docs/DNS_RECORDS.txt) for detailed configuration.

---

### Step 2: Set Environment Variables in Vercel (5 minutes)

**Required Variables:**

```bash
# Domain
NEXT_PUBLIC_BASE_URL=https://dealershipai.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@dealershipai.com

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx...
```

**Set via CLI:**
```bash
vercel env add NEXT_PUBLIC_BASE_URL production
# Enter: https://dealershipai.com

vercel env add RESEND_API_KEY production
# Enter: your_resend_api_key
```

**Or use Vercel Dashboard:**
https://vercel.com/dashboard → Project → Settings → Environment Variables

---

### Step 3: Apply Database Migrations (2 minutes)

```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
npx supabase db push
```

Migrations to apply:
- `20250101000001_origins_and_fleet.sql` - Fleet management tables
- `20250101000002_leads_and_email.sql` - Leads and email automation

---

### Step 4: Add Domain to Vercel (2 minutes)

**Option A: Via CLI**
```bash
vercel domains add dealershipai.com
vercel domains add www.dealershipai.com
```

**Option B: Via Dashboard**
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `dealershipai.com`
4. Click "Add"
5. Repeat for `www.dealershipai.com`
6. Set redirect: www → dealershipai.com

---

### Step 5: Deploy to Production (3 minutes)

```bash
# Build locally first (optional but recommended)
npm run build

# Deploy to production
vercel --prod
```

Vercel will:
- Build your application
- Deploy to production
- Provision SSL certificate (automatic)
- Set up cron jobs

---

### Step 6: Verify Domain in Resend (2 minutes)

1. **Login to Resend:** https://resend.com/domains
2. **Add Domain:** Click "Add Domain" → Enter `dealershipai.com`
3. **Wait for Verification:** DNS records need 15-30 minutes to propagate
4. **Click Verify:** Should show ✓ Verified
5. **Test Email:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@dealershipai.com",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>Test from dealershipai.com</p>"
     }'
   ```

---

### Step 7: Verify Deployment (3 minutes)

Run these checks:

```bash
# Check DNS resolution
dig dealershipai.com
# Should show: 76.76.21.21

# Check SSL certificate
curl -I https://dealershipai.com
# Should return: 200 OK with valid SSL

# Check homepage
curl https://dealershipai.com
# Should return HTML

# Check instant analyzer
curl https://dealershipai.com/instant
# Should return 200 OK

# Check API health
curl https://dealershipai.com/api/health
# Should return: {"status":"ok"}
```

---

## Post-Deployment Tasks

### Immediate (Do Now)

- [ ] **Test Instant Analyzer:** Visit https://dealershipai.com/instant
- [ ] **Test Email Capture:** Submit email in instant analyzer
- [ ] **Check Email Delivery:** Verify welcome email arrives
- [ ] **Test Fleet Upload:** Upload CSV with 10 test domains
- [ ] **Verify SSL:** Check https://www.ssllabs.com/ssltest/

### Within 24 Hours

- [ ] **Set Up Monitoring:**
  - UptimeRobot: https://uptimerobot.com
  - Monitor: `https://dealershipai.com` and `/api/health`

- [ ] **Configure Analytics:**
  - Add GA4 tracking code (see [lib/analytics.ts](lib/analytics.ts))
  - Or integrate Segment/Mixpanel

- [ ] **Submit Sitemap:**
  - Google Search Console: https://search.google.com/search-console
  - Submit: `https://dealershipai.com/sitemap.xml`

- [ ] **Test Email Flows:**
  - Welcome email (immediate)
  - Day 1 nurture email
  - Day 3 nurture email
  - Day 7 nurture email

### Within 1 Week

- [ ] **Set Up Error Tracking:**
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] **Configure Backups:**
  - Supabase: Enable daily backups
  - Database: Test restore procedure

- [ ] **Load Testing:**
  - Test instant analyzer with 100 concurrent users
  - Test CSV upload with 10,000 rows
  - Verify rate limiting works

- [ ] **Security Audit:**
  - Review RLS policies in Supabase
  - Test RBAC permissions
  - Verify API rate limits
  - Check CORS configuration

---

## Troubleshooting

### Issue: "Domain not verified in Vercel"

**Solution:**
1. Check DNS with `dig dealershipai.com`
2. Should return `76.76.21.21`
3. Wait 15-30 minutes for propagation
4. If using Cloudflare: Disable proxy (gray cloud, not orange)

---

### Issue: "SSL Certificate Pending"

**Solution:**
1. Wait up to 24 hours for automatic provisioning
2. Check Vercel dashboard for status
3. If stuck: Remove domain, wait 5 minutes, re-add domain
4. Ensure DNS points to Vercel IP

---

### Issue: "Emails Not Sending"

**Solution:**
1. Verify domain in Resend dashboard
2. Check DNS: `dig TXT dealershipai.com` (should show SPF)
3. Check DNS: `dig CNAME resend._domainkey.dealershipai.com`
4. Verify `FROM_EMAIL=noreply@dealershipai.com` in Vercel env
5. Check Resend logs for bounces

---

### Issue: "Rate Limiting Not Working"

**Solution:**
1. Verify Upstash Redis is configured
2. Check `UPSTASH_REDIS_REST_URL` in Vercel env
3. Test connection: `curl $UPSTASH_REDIS_REST_URL/ping`
4. If missing: App will fall back to in-memory (dev only)

---

### Issue: "Database Connection Failed"

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is set
3. Test connection in Supabase dashboard
4. Ensure RLS policies are enabled
5. Check if migrations were applied

---

## Quick Links

### Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard
- **Resend:** https://resend.com/emails
- **Upstash:** https://console.upstash.com

### Testing Tools
- **DNS Checker:** https://dnschecker.org/?query=dealershipai.com
- **SSL Test:** https://www.ssllabs.com/ssltest/analyze.html?d=dealershipai.com
- **Email Spam Test:** https://www.mail-tester.com
- **SPF/DKIM Check:** https://mxtoolbox.com/spf.aspx

### Documentation
- **Domain Setup:** [docs/DOMAIN_SETUP.md](docs/DOMAIN_SETUP.md)
- **DNS Records:** [docs/DNS_RECORDS.txt](docs/DNS_RECORDS.txt)
- **Production Deploy:** [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md)
- **Real Data Integration:** [REAL_DATA_INTEGRATION.md](REAL_DATA_INTEGRATION.md)

---

## Need Help?

**Automated Deployment:**
```bash
./scripts/deploy-custom-domain.sh
```

**Check DNS:**
```bash
dig dealershipai.com
dig www.dealershipai.com
dig TXT dealershipai.com
```

**Test Deployment:**
```bash
curl -I https://dealershipai.com
curl https://dealershipai.com/api/health
```

**View Logs:**
```bash
vercel logs dealershipai.com --prod
```

---

## Success Criteria

Your deployment is successful when:

✅ **DNS Resolution:**
- `dig dealershipai.com` returns `76.76.21.21`
- `dig www.dealershipai.com` returns Vercel CNAME

✅ **SSL Certificate:**
- `https://dealershipai.com` loads with valid SSL
- No browser warnings

✅ **Application:**
- Homepage loads: https://dealershipai.com
- Instant analyzer works: https://dealershipai.com/instant
- API responds: https://dealershipai.com/api/health

✅ **Email:**
- Resend shows "Verified" status
- Test email sends successfully
- Welcome emails deliver to inbox

✅ **Monitoring:**
- Uptime monitoring configured
- Error tracking active
- Analytics tracking events

---

**Estimated Total Time:** 15-30 minutes (excluding DNS propagation)

**Questions?** Review the detailed guide at [docs/DOMAIN_SETUP.md](docs/DOMAIN_SETUP.md)
