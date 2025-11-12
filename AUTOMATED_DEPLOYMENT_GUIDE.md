# 🚀 Automated GitHub Secrets Deployment Guide

**Status**: Ready for execution
**Date**: November 12, 2025
**Completion**: 95% (awaiting GitHub CLI auth + secret addition)

---

## Overview

This guide walks through the automated deployment process using the `scripts/add-github-secrets.sh` script, which automatically configures all 9 required GitHub Secrets from your `.env.local` file.

---

## Prerequisites

✅ All prerequisites are already installed:
- GitHub CLI (gh) - ✅ Installed via Homebrew
- Vercel CLI - ✅ Authenticated as brian-9561
- Node.js and npm - ✅ Working
- Git - ✅ Configured

---

## Step 1: Authenticate GitHub CLI (Required)

There's a GitHub CLI authentication prompt waiting for you. To complete it:

### Option A: Web Browser Authentication (Recommended)

1. **Copy the one-time code**: `8E17-026E`
2. **Open the URL**: https://github.com/login/device
3. **Paste the code** and authorize the application
4. **Return to this terminal** once authorized

### Option B: Token Authentication

```bash
gh auth login --with-token < ~/.github_token
```

### Verify Authentication

```bash
gh auth status
```

Expected output:
```
✓ Logged in to github.com as Kramerbrian
```

---

## Step 2: Run Automated Secret Addition Script

Once GitHub CLI is authenticated, run:

```bash
./scripts/add-github-secrets.sh
```

### What This Script Does

The script will automatically:

1. **Extract secrets from `.env.local`** ✅
   - OPENAI_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL (from SUPABASE_URL)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY (from SUPABASE_ANON_KEY)
   - SUPABASE_SERVICE_ROLE_KEY (from SUPABASE_SERVICE_KEY)
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY

2. **Add the 6 secrets to GitHub** (automated)

3. **Prompt for 3 Vercel values** (semi-automated):
   - **VERCEL_TOKEN**: You'll need to visit https://vercel.com/account/tokens
     - Click "Create Token"
     - Name it "GitHub Actions Deploy"
     - Copy the token (starts with `vercel_`)
     - Paste when prompted

   - **VERCEL_ORG_ID**: Script will detect `brian-9561` automatically
     - Just press Enter to accept the default

   - **VERCEL_PROJECT_ID**: You'll need to get this from project settings
     - Visit: https://vercel.com/brian-9561/dealership-ai-dashboard/settings
     - Copy the "Project ID" (format: `prj_xxxxx`)
     - Paste when prompted

4. **Display summary** of all added secrets

---

## Step 3: Trigger Deployment

Once all secrets are added, trigger the GitHub Actions workflow:

```bash
git add scripts/add-github-secrets.sh AUTOMATED_DEPLOYMENT_GUIDE.md
git commit -m "Add automated GitHub Secrets deployment script"
git push origin main
```

This will:
- ✅ Trigger the GitHub Actions workflow (`.github/workflows/deploy-production.yml`)
- ✅ Build the project with all secrets available
- ✅ Deploy to Vercel production
- ✅ Make orchestrator live at `api.dealershipai.com`

---

## Step 4: Monitor Deployment

### GitHub Actions
Watch the deployment progress:
```bash
gh run watch
```

Or visit:
- https://github.com/Kramerbrian/dealership-ai-dashboard/actions

### Vercel Dashboard
Monitor on Vercel:
- https://vercel.com/brian-9561/dealership-ai-dashboard

---

## Step 5: Test Live Orchestrator

Once deployment completes, test the orchestrator:

```bash
# Check orchestrator status
curl https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app/api/orchestrator/v3/status | jq

# Start orchestrator
curl -X POST https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app/api/orchestrator/v3/deploy \
  -H 'Content-Type: application/json' \
  -d '{"autoStart": true}' | jq

# Monitor progress (live updates every 10 seconds)
watch -n 10 'curl -s https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app/api/orchestrator/v3/status | jq'
```

---

## Troubleshooting

### Issue: GitHub CLI Not Authenticated
**Solution**: Complete Step 1 above - authenticate with the device code `8E17-026E`

### Issue: Vercel Token Not Working
**Solution**:
1. Visit https://vercel.com/account/tokens
2. Revoke old token
3. Create new token
4. Re-run `./scripts/add-github-secrets.sh`
5. It will update existing secrets

### Issue: Build Failing in GitHub Actions
**Solution**: Check environment variables:
```bash
gh secret list --repo=Kramerbrian/dealership-ai-dashboard
```

All 9 secrets should be present:
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_URL
- OPENAI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- VERCEL_TOKEN

### Issue: Deployment Succeeds but API Not Working
**Solution**: Check Vercel environment variables:
```bash
npx vercel env ls
```

Add missing variables:
```bash
npx vercel env add OPENAI_API_KEY production
```

---

## Script Features

The `add-github-secrets.sh` script includes:

✅ **Automatic .env.local parsing** - Extracts all values automatically
✅ **Interactive prompts** - Guides you through Vercel values
✅ **Intelligent defaults** - Detects Vercel username automatically
✅ **Validation** - Checks for missing values
✅ **Summary display** - Shows all secrets after addition
✅ **Helpful links** - Provides direct URLs for Vercel dashboard
✅ **Error handling** - Graceful failures with clear messages

---

## What Happens Next?

Once you complete Step 2 (run the script) and Step 3 (push to GitHub), the following will happen automatically:

1. **GitHub Actions Workflow Triggered** (30-60 seconds)
   - Checkout code
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Build project (`npm run build`)
   - Deploy to Vercel

2. **Vercel Deployment** (2-3 minutes)
   - Receives build from GitHub Actions
   - Deploys to production edge network
   - Assigns production URL
   - Enables SSL/TLS

3. **Orchestrator Goes Live** (immediate)
   - Available at production URL
   - OpenAI GPT-4o integration active
   - Ready to execute autonomous deployments
   - API endpoints functional

---

## Expected Timeline

- **Step 1** (GitHub CLI auth): 2 minutes
- **Step 2** (Run script): 3 minutes
- **Step 3** (Push to GitHub): 30 seconds
- **Step 4** (Monitor deployment): 5-7 minutes
- **Step 5** (Test orchestrator): 2 minutes

**Total**: ~13-15 minutes from start to live orchestrator

---

## Success Criteria

You'll know the deployment is successful when:

✅ GitHub Actions workflow shows green checkmark
✅ Vercel dashboard shows "Ready" status
✅ Orchestrator status endpoint returns JSON response
✅ Orchestrator can be started via API
✅ GPT-4o task generation works

---

## Current Status

- **Code**: 100% complete ✅
- **Build**: Passing (223 routes in 31s) ✅
- **Tests**: 7/7 passing ✅
- **Documentation**: Complete ✅
- **GitHub Actions Workflow**: Created ✅
- **Script**: Ready to run ✅
- **GitHub CLI**: Needs authentication ⏳
- **Secrets**: Needs addition ⏳
- **Deployment**: Pending ⏳

---

## Quick Start (TL;DR)

```bash
# 1. Authenticate GitHub CLI with the code
# Open: https://github.com/login/device
# Code: 8E17-026E

# 2. Run the automated script
./scripts/add-github-secrets.sh

# 3. Push to trigger deployment
git add .
git commit -m "Deploy with automated secrets"
git push origin main

# 4. Watch deployment
gh run watch

# 5. Test orchestrator
curl https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app/api/orchestrator/v3/status | jq
```

---

**Last Updated**: November 12, 2025
**Next Action**: Complete GitHub CLI authentication and run `./scripts/add-github-secrets.sh`
