# Set CLERK_SECRET_KEY in Vercel

## 🔗 Direct URL

**Vercel Environment Variables Dashboard**:
https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables

---

## 📋 Step-by-Step Instructions

### Step 1: Open Vercel Dashboard
Click the link above or navigate to:
- Vercel Dashboard → `dealership-ai-dashboard` project
- Settings → Environment Variables

### Step 2: Add New Variable
1. Click **"Add New"** button
2. **Variable Name**: `CLERK_SECRET_KEY`
3. **Value**: Paste your Clerk secret key (starts with `sk_live_...` or `sk_test_...`)
4. **Environments**: 
   - ☑ Production (required)
   - ☑ Preview (recommended)
   - ☐ Development (optional)
5. Click **"Save"**

---

## 🔑 Get Your Clerk Secret Key

**Clerk Dashboard URL**:
https://dashboard.clerk.com

**Steps**:
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Navigate to: **API Keys**
4. Find: **Secret Key** (starts with `sk_live_...` or `sk_test_...`)
5. Click **"Copy"** to copy the key
6. Paste into Vercel environment variable

---

## ✅ After Setting

**Redeploy to apply changes**:
```bash
vercel --prod
```

**Or** wait for next automatic deployment (if GitHub integration is enabled).

---

## 🧪 Verify It's Set

```bash
# Check if variable is set
vercel env ls | grep CLERK_SECRET_KEY
```

**Expected Output**:
```
CLERK_SECRET_KEY    Encrypted    Production    [timestamp]
```

---

## 🎯 Quick Links

- **Vercel Env Vars**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Clerk API Keys**: https://dashboard.clerk.com → Your App → API Keys

---

**Status**: Ready to set  
**Time**: 2 minutes  
**Priority**: 🔴 Critical (blocks sign-in page)

