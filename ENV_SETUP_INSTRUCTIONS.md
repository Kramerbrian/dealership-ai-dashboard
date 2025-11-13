# Environment Variables Setup Guide

## Trust OS Phase 1 - Required Environment Variables

Add these environment variables to Vercel for the Trust OS lead capture and nurture system to function.

---

## 🔐 Generated CRON_SECRET

```bash
CRON_SECRET="1DO614t0zHw/APyM8/NgMiZvbMTYen6a1z1YdiIwqQU="
```

---

## 📧 SendGrid Configuration (Required for Email)

### 1. SENDGRID_API_KEY
**What it is:** Your SendGrid API key for sending transactional emails
**Where to get it:** https://app.sendgrid.com/settings/api_keys

**Steps:**
1. Log in to SendGrid
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Name it "DealershipAI Production"
5. Select "Full Access" or "Restricted Access" with Mail Send permission
6. Copy the generated key

### 2. SENDGRID_FROM_EMAIL
**What it is:** The verified sender email address
**Where to set it up:** https://app.sendgrid.com/settings/sender_auth

**Steps:**
1. Log in to SendGrid
2. Navigate to Settings → Sender Authentication
3. Verify a single sender email (e.g., `noreply@dealershipai.com`)
4. OR authenticate your domain for better deliverability

**Recommended value:** `noreply@dealershipai.com` (or your verified email)

---

## 🌐 Application URL

### NEXT_PUBLIC_APP_URL
**What it is:** The canonical URL for your application
**Value:** `https://dealershipai.com`

---

## 🔨 How to Add to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Add each variable one at a time
vercel env add SENDGRID_API_KEY production
# Paste your SendGrid API key when prompted

vercel env add SENDGRID_FROM_EMAIL production
# Enter: noreply@dealershipai.com

vercel env add CRON_SECRET production
# Paste: 1DO614t0zHw/APyM8/NgMiZvbMTYen6a1z1YdiIwqQU=

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://dealershipai.com
```

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. Click "Add New"
3. For each variable:
   - **Name:** Variable name (e.g., `SENDGRID_API_KEY`)
   - **Value:** The secret value
   - **Environment:** Select "Production"
   - Click "Save"

---

## 🗄️ Database Migration (Required)

After adding environment variables, run the Prisma migration to create the `trust_scan_leads` table:

### On Vercel (After Deployment):

The migration should run automatically during build via `prisma generate`. However, to manually push the schema:

```bash
# Set your DATABASE_URL first
export DATABASE_URL="your-production-postgres-url"

# Push schema to database
npx prisma db push
```

### Verify Migration:

Connect to your database and check:

```sql
-- Check if table exists
SELECT * FROM trust_scan_leads LIMIT 1;

-- Check table structure
\d trust_scan_leads
```

---

## 🧪 Testing After Setup

### 1. Test Cron Endpoint Manually

```bash
curl -X GET https://dealershipai.com/api/cron/lead-nurture \
  -H "Authorization: Bearer 1DO614t0zHw/APyM8/NgMiZvbMTYen6a1z1YdiIwqQU="
```

**Expected response:**
```json
{
  "success": true,
  "message": "Lead nurture queue processed"
}
```

### 2. Test Trust Scan Widget

1. Visit https://dealershipai.com
2. Scroll to "Check Your Trust Score" section
3. Fill in test data:
   - Business Name: Test Dealership
   - Location: Austin, TX
   - Email: your-test-email@example.com
4. Submit form
5. Verify:
   - Results display correctly
   - Email received in inbox
   - Lead saved to database

### 3. Verify Database Persistence

Query your database:

```sql
SELECT
  business_name,
  location,
  email,
  trust_score,
  status,
  created_at
FROM trust_scan_leads
ORDER BY created_at DESC
LIMIT 5;
```

### 4. Monitor Cron Execution

Vercel Cron runs daily at 10am UTC. To monitor:

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Navigate to "Functions" tab
4. Check `/api/cron/lead-nurture` execution logs

---

## 📊 Environment Variable Summary

| Variable | Required | Purpose | Value |
|----------|----------|---------|-------|
| `SENDGRID_API_KEY` | ✅ Yes | Send emails | Get from SendGrid dashboard |
| `SENDGRID_FROM_EMAIL` | ✅ Yes | Sender address | `noreply@dealershipai.com` |
| `CRON_SECRET` | ✅ Yes | Protect cron | `1DO614t0zHw/APyM8/NgMiZvbMTYen6a1z1YdiIwqQU=` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | App URL | `https://dealershipai.com` |
| `DATABASE_URL` | ✅ Yes | PostgreSQL | Already configured |
| `DIRECT_URL` | ✅ Yes | Prisma migrations | Already configured |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Auth | Already configured |
| `CLERK_SECRET_KEY` | ✅ Yes | Auth | Already configured |

---

## 🚨 Troubleshooting

### Email Not Sending

**Check:**
1. SENDGRID_API_KEY is correct
2. SENDGRID_FROM_EMAIL is verified in SendGrid
3. Check SendGrid Activity dashboard for errors
4. Review Vercel function logs

### Cron Not Running

**Check:**
1. vercel.json has the cron configuration
2. CRON_SECRET matches in Vercel env vars
3. Check Vercel cron dashboard for execution history
4. Manually trigger endpoint to test

### Database Connection Issues

**Check:**
1. DATABASE_URL and DIRECT_URL are set
2. Prisma client is generated (`prisma generate`)
3. Migration was run (`prisma db push`)
4. Database accepts connections from Vercel IPs

### Build Failures

**Check:**
1. All Supabase routes use lazy initialization (getSupabase())
2. No module-level createClient() calls
3. Run `npm run build` locally to test

---

## 📝 Post-Deployment Checklist

- [ ] All 4 environment variables added to Vercel
- [ ] SendGrid sender email verified
- [ ] Database migration completed
- [ ] Test trust scan widget end-to-end
- [ ] Verify email delivery
- [ ] Check lead saved to database
- [ ] Test cron endpoint manually
- [ ] Monitor first automated cron execution
- [ ] Review Vercel function logs for errors

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/brian-kramers-projects/dealership-ai-dashboard
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Cron Monitoring:** https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/crons
- **Function Logs:** https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/logs

---

**Setup Date:** November 13, 2025
**CRON_SECRET Generated:** `1DO614t0zHw/APyM8/NgMiZvbMTYen6a1z1YdiIwqQU=`

_Keep this CRON_SECRET secure and never commit it to version control._
