# Vercel Environment Variables - Final Setup Guide

## ⚠️ Important: CLI Limitations

The Vercel CLI **requires interactive authentication** that cannot be automated. The CLI needs:
- Interactive project selection
- Browser-based authentication
- Manual confirmation steps

## ✅ Recommended: Use Vercel Dashboard

**Fastest and most reliable method:**

### Step 1: Navigate to Environment Variables
Visit: **https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables**

### Step 2: Add SUPABASE_DB_PASSWORD
1. Click **"Add New"**
2. **Key**: `SUPABASE_DB_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**: 
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Click **"Save"**

### Step 3: Add DATABASE_PASSWORD
1. Click **"Add New"** again
2. **Key**: `DATABASE_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Click **"Save"**

### Step 4: Redeploy
- Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments
- Click **"Redeploy"** on the latest deployment
- Or push a commit to trigger auto-deploy

## 🔄 Alternative: Interactive CLI (If You Prefer)

If you want to use CLI, run these commands **interactively in your terminal**:

```bash
# Step 1: Link project (interactive - will prompt you)
npx vercel link
# Select: dealership-ai-dashboard when prompted

# Step 2: Add environment variables
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD preview
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD development

echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD production
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD preview
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD development

# Step 3: Verify
npx vercel env ls | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD"

# Step 4: Redeploy
npx vercel --prod --yes
```

## ✅ Current Status

- ✅ Local `.env.local` configured
- ✅ Supabase password set
- ✅ Migration file ready
- ⏳ Vercel environment variables (needs manual setup via Dashboard)

## 📄 Related Files

- `VERCEL_CLI_SETUP.md` - Detailed CLI guide
- `VERCEL_ENV_CHECKLIST.md` - Step-by-step checklist
- `ENV_SETUP_COMPLETE.md` - Complete environment guide

