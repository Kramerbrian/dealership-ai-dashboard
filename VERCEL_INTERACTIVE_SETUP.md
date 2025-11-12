# Vercel Interactive Setup Guide

## ⚠️ Important: Interactive Commands Required

The Vercel CLI commands you requested require **interactive terminal sessions** that cannot be automated. You need to run these commands **in your own terminal**.

## 🚀 Quick Setup Script

I've created an interactive script that guides you through the process:

```bash
./scripts/vercel-setup-interactive.sh
```

This script will:
1. Link your project (interactive - you'll select `dealership-ai-dashboard`)
2. Add `SUPABASE_DB_PASSWORD` to all environments
3. Add `DATABASE_PASSWORD` to all environments
4. Redeploy to production

## 📋 Manual Steps (If You Prefer)

If you want to run commands manually:

### Step 1: Link Project
```bash
npx vercel link
```
**When prompted:**
- Select your project: `dealership-ai-dashboard`
- Confirm the selection

### Step 2: Add Environment Variables
```bash
# Add SUPABASE_DB_PASSWORD
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD preview
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD development

# Add DATABASE_PASSWORD
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD production
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD preview
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD development
```

### Step 3: Verify
```bash
npx vercel env ls | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD"
```

### Step 4: Redeploy
```bash
npx vercel --prod --yes
```

## ✅ Why Interactive?

The Vercel CLI requires:
- **Interactive project selection** - You need to choose from a list
- **Authentication confirmation** - May open browser for OAuth
- **Manual confirmation** - Some steps need your input

These cannot be automated in a non-interactive environment.

## 🎯 Alternative: Dashboard Method

If you prefer not to use CLI, use the Dashboard:
- **URL**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
- Add variables manually (faster, no CLI needed)

## 📄 Related Files

- `scripts/vercel-setup-interactive.sh` - Interactive setup script
- `VERCEL_SETUP_FINAL.md` - Complete setup guide
- `scripts/add-vercel-env-auto.sh` - Automated script (after linking)

