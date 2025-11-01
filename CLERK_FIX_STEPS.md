# Fix Clerk "Invalid Host" Error - Step by Step

## Current Error
```json
{
  "errors": [{
    "message": "Invalid host",
    "code": "host_invalid"
  }]
}
```

## Quick Fix (5 Minutes Total)

---

## Step 1: Update Clerk Dashboard (2 minutes)

### 1.1 Go to Clerk Dashboard
- **URL:** https://dashboard.clerk.com
- Sign in and select your application

### 1.2 Navigate to API Keys
- Left sidebar: Click **"Configure"**
- Click **"API Keys"**

### 1.3 Add Production URL to Allowed Origins
Scroll down to **"Allowed origins"** section

Click **"Add origin"** button

Add this EXACT URL (copy-paste to avoid typos):
```
https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app
```

Also add the previous deployment URL for safety:
```
https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app
```

Click **"Save changes"**

---

## Step 2: Copy Clerk API Keys (1 minute)

Still on the **API Keys** page in Clerk dashboard:

### 2.1 Find Your Keys
You'll see two keys displayed:

**Publishable Key:**
- Starts with `pk_test_` (test environment) or `pk_live_` (production)
- Example: `pk_test_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- Click the **copy icon** next to it

**Secret Key:**
- Starts with `sk_test_` (test environment) or `sk_live_` (production)
- Example: `sk_test_abcdefghijklmnopqrstuvwxyz123456789`
- Click **"Reveal"** if hidden
- Click the **copy icon** next to it

**IMPORTANT:** Copy both keys to a temporary text file - you'll need them for Step 3

---

## Step 3: Add Keys to Vercel (2 minutes)

### 3.1 Go to Vercel Environment Variables
- **URL:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
- Or navigate: Vercel Dashboard → Your Project → Settings → Environment Variables

### 3.2 Add Clerk Publishable Key

Click **"Add New"** button

Fill in the form:
- **Key:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value:** Paste your Clerk Publishable Key (starts with `pk_test_` or `pk_live_`)
- **Environment:** Select **"Production"** only (uncheck Preview and Development)

Click **"Save"**

### 3.3 Add Clerk Secret Key

Click **"Add New"** button again

Fill in the form:
- **Key:** `CLERK_SECRET_KEY`
- **Value:** Paste your Clerk Secret Key (starts with `sk_test_` or `sk_live_`)
- **Environment:** Select **"Production"** only (uncheck Preview and Development)

Click **"Save"**

---

## Step 4: Verify Deployment (Automatic)

The deployment is already running in the background!

### Check Deployment Status
```bash
# I've already started this for you - it's building now
npx vercel --prod
```

**Expected deployment URL:**
```
https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app
```

**Build time:** ~2-3 minutes

---

## Step 5: Test Authentication (1 minute)

Once deployment completes, test authentication:

### 5.1 Visit Production Site
```bash
open https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app
```

### 5.2 Try Signing Up or Signing In
- Click "Sign Up" or "Sign In" button
- Enter your email
- Complete the authentication flow

### 5.3 Expected Result
✅ **Success:** You can sign up/sign in without errors
❌ **Before:** "Invalid host" error

---

## Troubleshooting

### Still seeing "Invalid host" error?

**Check 1: Allowed Origins**
- Go back to Clerk dashboard → API Keys → Allowed origins
- Make sure the production URL is listed EXACTLY:
  ```
  https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app
  ```
- No trailing slash!
- Must include `https://`

**Check 2: Environment Variables in Vercel**
- Go to Vercel → Settings → Environment Variables
- Verify both variables exist:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Both should be set for **Production** environment
- Keys should match what's in Clerk dashboard

**Check 3: Redeploy**
- If you added variables after deployment started, redeploy:
  ```bash
  npx vercel --prod
  ```

### Wrong keys used?

If you accidentally used the wrong environment keys:

1. Go to Clerk dashboard → API Keys
2. Switch between **"Development"** and **"Production"** tabs at the top
3. Copy the keys from the **correct environment** (Production for production deployment)
4. Update the values in Vercel environment variables
5. Redeploy

---

## Quick Reference: URLs

| Resource | URL |
|----------|-----|
| **Clerk Dashboard** | https://dashboard.clerk.com |
| **Vercel Project Settings** | https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings |
| **Vercel Env Vars** | https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables |
| **Production Deployment** | https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app |
| **Deployment Logs** | https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard |

---

## Environment Variables Needed

```bash
# Add these to Vercel → Settings → Environment Variables → Production

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Success Checklist

Once you've completed all steps:

- [ ] Added production URLs to Clerk allowed origins
- [ ] Copied Clerk Publishable Key
- [ ] Copied Clerk Secret Key
- [ ] Added `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to Vercel (Production)
- [ ] Added `CLERK_SECRET_KEY` to Vercel (Production)
- [ ] Deployment completed successfully
- [ ] Tested authentication - can sign up/sign in
- [ ] No more "Invalid host" errors

---

## What's Next?

After authentication is working, complete the database setup:

1. **Configure Supabase credentials** in Vercel
2. **Run database migrations** to create Pulse tables
3. **Test API endpoints** to ensure everything works

See [QUICK_MIGRATION_GUIDE.md](./QUICK_MIGRATION_GUIDE.md) for database setup steps.

---

## Summary

**Time Required:** ~5 minutes
**Difficulty:** Easy (copy-paste configuration)
**Result:** Fully functional authentication

**Current Status:**
- ✅ Deployment building
- ⏳ Waiting for you to add Clerk keys to Vercel
- ⏳ Will be complete once keys are added and deployment finishes
