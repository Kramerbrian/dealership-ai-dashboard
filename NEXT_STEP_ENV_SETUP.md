# 🎯 Next Step: Set Environment Variables

## Action Required: Set Environment Variables in Vercel

**This is the #1 blocker for production deployment.**

### Quick Steps:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `dealership-ai-dashboard`

2. **Navigate to Environment Variables:**
   - Click: **Settings** → **Environment Variables**

3. **Add These Variables (one by one):**

Copy each variable name and value, then click **Add**:

```bash
# 1. Database (REQUIRED)
Variable Name: DATABASE_URL
Value: [Your PostgreSQL connection string]
Environments: ☑ Production ☑ Preview ☑ Development

# 2. Database Direct URL (REQUIRED)
Variable Name: DIRECT_URL  
Value: [Same as DATABASE_URL for now]
Environments: ☑ Production ☑ Preview ☑ Development

# 3. Clerk Publishable Key (REQUIRED)
Variable Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_live_... [from Clerk dashboard]
Environments: ☑ Production ☑ Preview ☑ Development

# 4. Clerk Secret Key (REQUIRED)
Variable Name: CLERK_SECRET_KEY
Value: sk_live_... [from Clerk dashboard]
Environments: ☑ Production ☑ Preview ☑ Development

# 5. Fleet API Base (REQUIRED)
Variable Name: FLEET_API_BASE
Value: https://your-fleet-api.com [or your internal API URL]
Environments: ☑ Production ☑ Preview ☑ Development

# 6. API Key (REQUIRED)
Variable Name: X_API_KEY
Value: [Your secure API key - min 32 chars]
Environments: ☑ Production ☑ Preview ☑ Development

# 7. Cron Secret (REQUIRED)
Variable Name: CRON_SECRET
Value: [Generate a secure random string - min 32 chars]
Environments: ☑ Production ☑ Preview ☑ Development

# 8. Redis URL (REQUIRED)
Variable Name: UPSTASH_REDIS_REST_URL
Value: https://xxx.upstash.io [from Upstash dashboard]
Environments: ☑ Production ☑ Preview ☑ Development

# 9. Redis Token (REQUIRED)
Variable Name: UPSTASH_REDIS_REST_TOKEN
Value: [Your Upstash token]
Environments: ☑ Production ☑ Preview ☑ Development

# 10. Node Environment (REQUIRED)
Variable Name: NODE_ENV
Value: production
Environments: ☑ Production

# 11. App URL (REQUIRED)
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://dealershipai.com [or your domain]
Environments: ☑ Production ☑ Preview ☑ Development

# 12. Dashboard URL (REQUIRED)
Variable Name: NEXT_PUBLIC_DASHBOARD_URL
Value: https://dash.dealershipai.com [or your dashboard domain]
Environments: ☑ Production ☑ Preview ☑ Development
```

### How to Generate Secure Secrets:

```bash
# Generate CRON_SECRET (32+ characters)
openssl rand -base64 32

# Generate X_API_KEY (32+ characters)
openssl rand -base64 32
```

### Where to Find Your Values:

- **DATABASE_URL**: From your Supabase/PostgreSQL provider
- **Clerk Keys**: https://dashboard.clerk.com → Your App → API Keys
- **Upstash Redis**: https://console.upstash.com → Your Database → REST API
- **FLEET_API_BASE**: Your internal fleet API URL (or leave empty if not using fleet features yet)

---

## After Setting Variables:

1. **Redeploy** (or wait for auto-deploy if connected to Git)
2. **Verify** by checking: `https://your-app.vercel.app/api/status`
3. **Continue** to database migration step

---

## Need Help?

- **Clerk Setup:** Check `CLERK_AUTH_FIXED.md`
- **Database Setup:** Check `DEPLOYMENT_SETUP_GUIDE.md`
- **Full Checklist:** See `PRODUCTION_ACTION_PLAN.md`

---

**⏱️ Estimated Time: 10-15 minutes**

Once complete, reply "env vars set" and I'll guide you through the next step (database migration).

