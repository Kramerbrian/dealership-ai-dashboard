# 🚀 Production Deployment Guide

This guide walks you through deploying your DealershipAI application to production with all features enabled.

---

## ✅ **Pre-Deployment Checklist**

Before deploying, ensure you have:

- [ ] Supabase production project created
- [ ] Resend API key (for email automation)
- [ ] Google Cloud Console project (for GSC API)
- [ ] Domain name configured
- [ ] SSL certificate (automatic with Vercel)
- [ ] Environment variables ready

---

## 📦 **Step 1: Apply Database Migrations**

### **Option A: Supabase CLI** (Recommended)

```bash
# Link to your production project
npx supabase link --project-ref your-production-ref

# Push migrations
npx supabase db push

# Verify tables created
npx supabase db list
```

### **Option B: Supabase Dashboard**

1. Navigate to https://app.supabase.com/project/your-project/sql
2. Copy contents of `supabase/migrations/20250101000001_origins_and_fleet.sql`
3. Paste and run
4. Copy contents of `supabase/migrations/20250101000002_leads_and_email.sql`
5. Paste and run

### **Verify Tables:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `origins`
- `origin_uploads`
- `evidence_snapshots`
- `fleet_audit_log`
- `fleet_scheduled_jobs`
- `leads`
- `email_templates`
- `email_sends`
- `scan_history`

---

## 🔑 **Step 2: Configure Environment Variables**

### **Required Variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Email (Resend)
RESEND_API_KEY=re_your_key
FROM_EMAIL=noreply@yourdomain.com

# Cron Security
CRON_SECRET=generate_random_secret_here

# JWT
JWT_SECRET=your_jwt_secret_for_tokens
```

### **Optional Variables (Wire Later):**

```bash
# Google Search Console
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# AI Platforms
OPENAI_API_KEY=sk-your_key
ANTHROPIC_API_KEY=sk-ant-your_key
PERPLEXITY_API_KEY=pplx-your_key
GOOGLE_AI_API_KEY=your_key

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Analytics
SEGMENT_WRITE_KEY=your_key
MIXPANEL_TOKEN=your_token

# CRM Integration
HUBSPOT_API_KEY=your_key
SALESFORCE_CLIENT_ID=your_id
SALESFORCE_CLIENT_SECRET=your_secret

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook
```

---

## 🌐 **Step 3: Deploy to Vercel**

### **Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts and paste environment variables
```

### **Option B: GitHub Integration**

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Add environment variables in Vercel dashboard
5. Click "Deploy"

### **Add Environment Variables in Vercel:**

1. Go to Project Settings → Environment Variables
2. Add all variables from Step 2
3. Click "Save"
4. Redeploy

---

## 📧 **Step 4: Configure Resend**

### **Create Resend Account:**

1. Go to https://resend.com/signup
2. Verify your email
3. Add your domain

### **Add Domain:**

1. Go to Domains → Add Domain
2. Enter `yourdomain.com`
3. Add DNS records:

```
Type: TXT
Name: @ (or your subdomain)
Value: [provided by Resend]

Type: CNAME
Name: resend._domainkey
Value: [provided by Resend]
```

4. Wait for verification (can take up to 48 hours)

### **Get API Key:**

1. Go to API Keys
2. Click "Create API Key"
3. Copy key
4. Add to Vercel as `RESEND_API_KEY`

### **Test Email:**

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>Test email from DealershipAI</p>"
  }'
```

---

## ⏰ **Step 5: Set Up Cron Jobs**

### **Add to vercel.json:**

```json
{
  "crons": [
    {
      "path": "/api/cron/nurture",
      "schedule": "0 * * * *"
    }
  ]
}
```

### **Secure Cron Endpoint:**

1. Generate secure random secret:
```bash
openssl rand -hex 32
```

2. Add to Vercel environment variables:
```
CRON_SECRET=your_generated_secret
```

3. Vercel will automatically add `Authorization: Bearer <CRON_SECRET>` header

### **Test Cron Manually:**

```bash
curl https://yourdomain.com/api/cron/nurture \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "ok": true,
  "totalSent": 5,
  "totalFailed": 0,
  "results": {
    "welcome": { "sent": 2, "failed": 0 },
    "day1": { "sent": 1, "failed": 0 },
    "day3": { "sent": 1, "failed": 0 },
    "day7": { "sent": 1, "failed": 0 }
  }
}
```

---

## 🔗 **Step 6: Configure Domain & DNS**

### **Add Custom Domain in Vercel:**

1. Go to Project Settings → Domains
2. Add `yourdomain.com`
3. Add DNS records provided by Vercel:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (5-60 minutes)

### **SSL Certificate:**

Vercel automatically provisions SSL certificates via Let's Encrypt. No action needed!

---

## 🧪 **Step 7: Test Production Deployment**

### **Test Instant Analyzer:**

1. Navigate to `https://yourdomain.com/instant`
2. Enter a test dealership URL
3. Click "Run 3-sec Scan"
4. Verify results appear
5. Enter email
6. Check email inbox for welcome email

### **Test Fleet CSV Upload:**

1. Navigate to `https://yourdomain.com/fleet`
2. Generate JWT token:
```bash
node scripts/generate-test-token.js admin
```
3. Store in browser console:
```javascript
localStorage.setItem('auth_token', 'YOUR_TOKEN')
```
4. Click "Bulk Upload"
5. Upload test CSV
6. Verify preview and commit

### **Test API Endpoints:**

```bash
# AI Health
curl https://yourdomain.com/api/ai/health

# Zero-Click
curl https://yourdomain.com/api/zero-click?dealer=test.com

# Schema
curl https://yourdomain.com/api/schema?origin=test.com

# Capture Email
curl -X POST https://yourdomain.com/api/capture-email \
  -H "Content-Type: application/json" \
  -d '{"dealer":"test.com","email":"test@example.com"}'
```

---

## 📊 **Step 8: Monitor & Observe**

### **Vercel Analytics:**

1. Go to Project → Analytics
2. Enable Web Analytics
3. View real-time traffic

### **Supabase Monitoring:**

1. Go to Project → Database → Performance
2. Monitor query performance
3. Set up alerts for slow queries

### **Check Logs:**

```bash
# Vercel logs
vercel logs https://yourdomain.com

# Supabase logs
# Dashboard → Logs → API
```

### **Set Up Alerts:**

1. **Uptime Monitoring:** Use UptimeRobot or BetterStack
2. **Error Tracking:** Set up Sentry
3. **Performance:** Use Vercel Analytics

---

## 🔐 **Step 9: Security Hardening**

### **Enable RLS Verification:**

```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

Should return no rows.

### **Rotate Secrets:**

```bash
# Generate new JWT secret
openssl rand -hex 32

# Update in Vercel
# Redeploy
```

### **Rate Limiting (Optional):**

See "Add Rate Limiting" section below.

### **CORS Configuration:**

If you have a separate marketing site:

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "https://yourmarketingsite.com");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  return res;
}
```

---

## 📈 **Step 10: Post-Deployment Tasks**

### **1. Seed Initial Data (Optional):**

```sql
-- Add your first dealership
INSERT INTO origins (tenant_id, origin, display_name, priority_level)
VALUES (
  (SELECT id FROM tenants WHERE name = 'Demo' LIMIT 1),
  'https://germaintoyota.com',
  'Germain Toyota',
  'high'
);
```

### **2. Test Email Sequences:**

```bash
# Manually trigger welcome email
curl -X POST https://yourdomain.com/api/cron/nurture \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **3. Monitor First Scans:**

```sql
-- View recent scans
SELECT dealer, email, zero_click_score, ai_visibility_score, created_at
FROM scan_history
ORDER BY created_at DESC
LIMIT 10;

-- View captured leads
SELECT dealer, email, source, report_unlocked, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

### **4. Set Up Analytics:**

Add Segment or Mixpanel tracking:

```typescript
// app/instant/page.tsx
useEffect(() => {
  analytics.track('page_view', {
    page: '/instant',
    title: 'Instant Analyzer'
  });
}, []);
```

---

## 🛠️ **Optional Enhancements**

### **Add Rate Limiting (Recommended):**

1. Create Upstash Redis: https://console.upstash.com
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Add to Vercel environment variables
4. Install package:
```bash
npm install @upstash/ratelimit @upstash/redis
```
5. Add middleware (see below)

### **Add Google Search Console Integration:**

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Search Console API
4. Create OAuth 2.0 credentials
5. Get refresh token (see Google API docs)
6. Add to environment variables

### **Add Sentry Error Tracking:**

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

## 🚨 **Troubleshooting**

### **Issue: Emails not sending**

**Check:**
1. `RESEND_API_KEY` is set correctly
2. Domain is verified in Resend
3. `FROM_EMAIL` matches verified domain
4. Check Vercel logs for errors:
```bash
vercel logs --follow
```

### **Issue: Database connection fails**

**Check:**
1. `SUPABASE_SERVICE_ROLE_KEY` is correct
2. RLS policies allow inserts
3. Test connection:
```bash
curl https://your-project.supabase.co/rest/v1/leads \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### **Issue: Cron jobs not running**

**Check:**
1. `vercel.json` is in root directory
2. Cron schedule is valid
3. `CRON_SECRET` is set
4. Check Vercel Cron dashboard:
   Project → Settings → Cron Jobs

### **Issue: CSV upload fails**

**Check:**
1. JWT token is valid
2. User has `origins:bulk_upload` permission
3. CSV format is correct
4. File size under limit

---

## 📝 **Environment Variables Checklist**

Copy this to your `.env.production`:

```bash
# ===== REQUIRED =====
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_BASE_URL=
RESEND_API_KEY=
FROM_EMAIL=
CRON_SECRET=
JWT_SECRET=

# ===== OPTIONAL (Wire Later) =====
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_AI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SEGMENT_WRITE_KEY=
MIXPANEL_TOKEN=
HUBSPOT_API_KEY=
SLACK_WEBHOOK_URL=
```

---

## ✅ **Deployment Complete!**

Your production deployment should now have:

✅ Database schema applied (9 tables)
✅ Vercel deployment live
✅ Custom domain with SSL
✅ Email automation working
✅ Cron jobs running hourly
✅ Instant analyzer accessible
✅ Fleet management operational
✅ Lead capture functional
✅ Audit logging enabled

---

## 📞 **Support**

- **Documentation:** See PLG_INTEGRATION.md, FLEET_IMPLEMENTATION.md
- **Database Issues:** Check Supabase dashboard → Logs
- **Email Issues:** Check Resend dashboard → Logs
- **Deployment Issues:** Check Vercel dashboard → Logs

---

**🎉 You're live! Time to capture leads and manage fleets!**
