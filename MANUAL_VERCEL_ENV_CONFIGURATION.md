# Manual Vercel Environment Variable Configuration

**Status:** Vercel CLI has bugs - Manual dashboard configuration required
**Date:** 2025-11-12
**Estimated Time:** 3-5 minutes

---

## 🚨 Why Manual Configuration?

The Vercel CLI (v48.9.0) has multiple bugs preventing automated configuration:
- `vercel link`: TypeError reading 'value' property
- `vercel teams ls`: Unexpected error
- `vercel env add`: Project not linked error

**Solution:** Configure via Vercel web dashboard (reliable and fast)

---

## 📝 Step-by-Step Configuration

### Step 1: Open Vercel Environment Variables Dashboard

**Direct URL:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables

Or navigate manually:
1. Go to https://vercel.com
2. Select team: "brian-kramer-dealershipai"
3. Select project: "dealership-ai-dashboard"
4. Click "Settings" tab
5. Click "Environment Variables" in left sidebar

---

### Step 2: Add NEXT_PUBLIC_SUPABASE_URL

1. Click "Add New" button
2. Fill in:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://vxrdvkhkombwlhjvtsmw.supabase.co`
   - **Environment:** Check ✅ "Production"
3. Click "Save"

---

### Step 3: Add NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Click "Add New" button
2. Fill in:
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s
   ```
   - **Environment:** Check ✅ "Production"
3. Click "Save"

---

### Step 4: Add SUPABASE_SERVICE_ROLE_KEY

1. Click "Add New" button
2. Fill in:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0
   ```
   - **Environment:** Check ✅ "Production"
   - ⚠️ **Important:** This is a sensitive key - keep secure
3. Click "Save"

---

### Step 5: Add DATABASE_URL

1. Click "Add New" button
2. Fill in:
   - **Key:** `DATABASE_URL`
   - **Value:**
   ```
   postgresql://postgres.vxrdvkhkombwlhjvtsmw:Autonation2077$@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   - **Environment:** Check ✅ "Production"
   - ⚠️ **Important:** This contains the database password
3. Click "Save"

---

### Step 6: Verify Configuration (Optional but Recommended)

After adding all 4 variables, you should see:

```
✅ NEXT_PUBLIC_SUPABASE_URL          Production
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY     Production
✅ SUPABASE_SERVICE_ROLE_KEY         Production
✅ DATABASE_URL                       Production
```

---

## 🚀 Step 7: Trigger Deployment

### Option A: Automatic Redeploy (Recommended)
Vercel will automatically redeploy when you save environment variables. Look for:
- Notification: "Redeploying production..."
- Check deployments: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments

### Option B: Manual Redeploy
If automatic redeploy doesn't trigger:

1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. Click "Deployments" tab
3. Find latest deployment
4. Click "..." menu → "Redeploy"
5. Select "Use existing Build Cache"
6. Click "Redeploy"

### Option C: Git Push (Alternative)
```bash
# Commit any pending changes and push
git add -A
git commit -m "Configure production environment variables"
git push origin main
```

---

## ✅ Step 8: Verify Deployment

### Wait for Deployment
Deployment typically takes 2-3 minutes. Monitor at:
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments

### Test Production Endpoints

Once deployment shows "Ready", test these URLs:

```bash
# Health check
curl https://dealershipai.com/api/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_providers": {
      "openai": "available",
      "anthropic": "available"
    }
  }
}

# Schema health
curl https://dealershipai.com/api/schema/health

# Expected response:
{
  "status": "healthy",
  "service": "schema",
  "timestamp": "2025-11-12T..."
}

# Main site
curl -I https://dealershipai.com

# Expected: HTTP/2 200
```

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ All 4 environment variables visible in Vercel dashboard
- ✅ Deployment status: "Ready"
- ✅ Health endpoint returns `{"status":"healthy"}`
- ✅ Main site loads without errors (200 OK)
- ✅ Database connection working
- ✅ No environment variable errors in logs

---

## 🐛 Troubleshooting

### Issue: Environment variables not appearing
**Solution:** Clear browser cache and refresh Vercel dashboard

### Issue: Deployment not triggering
**Solution:** Manual redeploy from Deployments tab

### Issue: Database connection failing
**Solution:** Verify DATABASE_URL includes correct password and escape characters

### Issue: 500 errors on landing page
**Solution:** Check deployment logs at:
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments/[deployment-id]

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Verify health endpoint responding
- [ ] Test main landing page
- [ ] Test dashboard authentication
- [ ] Verify database queries working
- [ ] Check deployment logs for errors
- [ ] Set up monitoring alerts
- [ ] Document production URL
- [ ] Update team on deployment status

---

## 🔗 Quick Links

- **Environment Variables:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
- **Deployments:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments
- **Project Settings:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw
- **Production Site:** https://dealershipai.com
- **Dashboard:** https://dash.dealershipai.com

---

## 📝 Notes

- **Vercel CLI Issues:** Multiple bugs in v48.9.0 prevent automated configuration
- **Security:** Service role key and database password are sensitive - keep secure
- **Deployment Time:** Typically 2-3 minutes from env var save to production ready
- **Build Cache:** Can use existing cache for faster deployment
- **Monitoring:** Enable Vercel Analytics and error tracking post-deployment

---

**Status:** Ready for Configuration
**Estimated Completion Time:** 3-5 minutes
**Last Updated:** 2025-11-12

🤖 Generated with [Claude Code](https://claude.com/claude-code)
