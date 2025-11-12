# Vercel Environment Variables Checklist

## ✅ Pre-Flight Check

- [x] Local `.env.local` configured
- [x] Supabase password verified
- [x] Migration file ready: `supabase/migrations/20250112000001_onboarding_adaptive_ux.sql`

## 📋 Vercel Dashboard Steps

### Step 1: Navigate to Environment Variables
**URL**: https://vercel.com/dealership-ai-dashboard/settings/environment-variables

### Step 2: Add SUPABASE_DB_PASSWORD
1. Click **"Add New"** button
2. **Key**: `SUPABASE_DB_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**: 
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Click **"Save"**

### Step 3: Add DATABASE_PASSWORD
1. Click **"Add New"** button again
2. **Key**: `DATABASE_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Click **"Save"**

### Step 4: Verify Variables Added
You should see both variables in the list:
- `SUPABASE_DB_PASSWORD` (Production, Preview, Development)
- `DATABASE_PASSWORD` (Production, Preview, Development)

### Step 5: Redeploy
**Option A: Via Dashboard**
- Go to: https://vercel.com/dealership-ai-dashboard/deployments
- Click **"Redeploy"** on latest deployment
- Or push a commit to trigger auto-deploy

**Option B: Via CLI**
```bash
npx vercel --prod
```

## ✅ Post-Deployment Verification

After redeploying, verify variables are available:

1. **Check Deployment Logs**
   - Visit: https://vercel.com/dealership-ai-dashboard/deployments
   - Check latest deployment logs for any errors

2. **Test Supabase Connection** (if using in API routes)
   - Variables should be available at runtime
   - Test any Supabase operations in production

3. **Verify Migration Ready**
   - Local migration file: `supabase/migrations/20250112000001_onboarding_adaptive_ux.sql`
   - Can be applied after Vercel deployment

## 🚀 Next Steps After Vercel Setup

1. ✅ Add variables to Vercel (manual step above)
2. ✅ Redeploy application
3. ✅ Test Supabase migrations: `./scripts/supabase-push.sh`
4. ✅ Verify onboarding flow works with new tables

## 📄 Related Documentation

- `VERCEL_ENV_SETUP.md` - Detailed setup guide
- `ENV_SETUP_COMPLETE.md` - Complete environment guide
- `scripts/supabase-push.sh` - Migration helper script

