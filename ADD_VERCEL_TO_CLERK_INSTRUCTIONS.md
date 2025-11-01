# 🔧 Add Vercel Preview URLs to Clerk Allowed Origins

## Problem
Clerk shows "Invalid host" error when accessing `.vercel.app` preview URLs because they're not in the allowed origins list.

## Solution: Update Clerk Dashboard

### Step 1: Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Sign in with your Clerk account
3. Select your DealershipAI application

### Step 2: Navigate to Allowed Origins
The exact path may vary by Clerk interface version:

**Option A (Newer UI)**:
1. Click **Settings** in the left sidebar
2. Click **Allowed Origins** or **CORS**
3. Look for **Frontend API** or **Allowed Origins** section

**Option B (Older UI)**:
1. Go to **Configure** → **Allowed Origins**
2. Or **Settings** → **Paths**

### Step 3: Add Vercel Preview URLs

Add these URLs to the allowed origins list:

```
https://*.vercel.app
```

Or specifically:

```
https://dealership-ai-dashboard-*.vercel.app
https://dealershipai.vercel.app
https://*.dealershipai.vercel.app
```

### Step 4: Add Specific Current URLs (Optional)

For immediate access to current deployment:

```
https://dealership-ai-dashboard-b8ewquc06-brian-kramer-dealershipai.vercel.app
https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
```

### Step 5: Save Changes
Click **Save** or **Update** button

### Step 6: Verify
1. Wait 1-2 minutes for changes to propagate
2. Visit your Vercel deployment URL
3. The "Invalid host" error should be gone

## Alternative: API Keys Section

If Allowed Origins section isn't visible:

1. Go to **API Keys** section
2. Look for **Frontend API** configuration
3. Find **Allowed Origins** or **CORS Origins**
4. Add the URLs above

## Current Clerk Instance Info

Your Clerk publishable key is stored in Vercel environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

These are configured for Production environment.

## Quick Test

After adding allowed origins:

```bash
# Visit your latest deployment
https://dealership-ai-dashboard-b8ewquc06-brian-kramer-dealershipai.vercel.app
```

The Clerk error should disappear.

## Notes

- Changes take effect immediately (usually within 1-2 minutes)
- You can add wildcards like `*.vercel.app` for all Vercel deployments
- Only HTTPS URLs are allowed for security
- This doesn't affect your custom domain configuration
