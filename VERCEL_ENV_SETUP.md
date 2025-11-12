# Vercel Environment Variables Setup

## ✅ Status

**Local Setup**: Complete
- ✅ `.env.local` has `SUPABASE_DB_PASSWORD` and `DATABASE_PASSWORD`
- ✅ Supabase password configured

**Vercel Setup**: Manual Required (CLI requires interactive auth)

## 📋 Manual Steps to Add Environment Variables

### Step 1: Visit Vercel Dashboard

Go to: **https://vercel.com/dealership-ai-dashboard/settings/environment-variables**

### Step 2: Add SUPABASE_DB_PASSWORD

1. Click **"Add New"** button
2. **Key**: `SUPABASE_DB_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**: Select all three:
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development
5. Click **"Save"**

### Step 3: Add DATABASE_PASSWORD

1. Click **"Add New"** button again
2. **Key**: `DATABASE_PASSWORD`
3. **Value**: `Autonation2077$`
4. **Environments**: Select all three:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Click **"Save"**

### Step 4: Verify

You should see both variables listed:
- `SUPABASE_DB_PASSWORD` (Production, Preview, Development)
- `DATABASE_PASSWORD` (Production, Preview, Development)

### Step 5: Redeploy

After adding variables, trigger a new deployment:

**Option A: Via Dashboard**
- Go to: https://vercel.com/dealership-ai-dashboard/deployments
- Click "Redeploy" on the latest deployment
- Or push a new commit to trigger deployment

**Option B: Via CLI**
```bash
npx vercel --prod
```

## 🔐 Alternative: Vercel CLI (If Authenticated)

If you're already logged in to Vercel CLI, you can use:

```bash
# Link project first (interactive)
npx vercel link

# Then add variables
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD preview
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD development

echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD production
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD preview
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD development
```

## ✅ Verification

After adding variables and redeploying, verify they're available:

1. Check deployment logs in Vercel dashboard
2. Variables should be available at runtime
3. Test Supabase CLI connection in a serverless function

## 📄 Related Files

- `ENV_SETUP_COMPLETE.md` - Complete environment setup guide
- `scripts/supabase-push.sh` - Helper for local Supabase migrations
- `.env.local` - Local environment variables (gitignored)
