# 📋 Clerk Allowed Origins - Step-by-Step Guide

## 🎯 Goal
Add Vercel preview URLs to Clerk's allowed origins so authentication works on your deployments.

---

## ✅ Step-by-Step Instructions

### Step 1: Open Clerk Dashboard
1. Open your browser
2. Go to: **https://dashboard.clerk.com**
3. Sign in with your account

### Step 2: Select Your Application
1. You should see a list of your Clerk applications
2. Click on **"DealershipAI"** (or your app name)
3. You should now be in your application dashboard

### Step 3: Navigate to Paths/Frontend API
**Try these navigation paths (varies by interface):**

**Option A (Most Common)**:
- Click **"Configure"** in the left sidebar
- Click **"Paths"**
- Look for **"Frontend API"** section
- Find **"Allowed Origins"** or **"CORS Origins"**

**Option B**:
- Click **"Settings"** in the left sidebar
- Look for **"Allowed Origins"** or **"Paths"**
- Click on it

**Option C (If Using Search)**:
- Use the search bar at the top
- Type: **"allowed origins"** or **"CORS"**
- Click on the matching result

### Step 4: Add URLs
1. You should see a list of current allowed origins (if any)
2. Look for an **"Add URL"** or **"Edit"** button
3. Click it

4. In the input field, add (one at a time or as comma-separated):
   ```
   https://*.vercel.app
   ```
   
5. Click **"Add"** or **"Save"**

6. Add the second pattern:
   ```
   https://dealership-ai-dashboard-*.vercel.app
   ```

### Step 5: Save Changes
1. Look for a **"Save"** button at the bottom of the form
2. Click **"Save"**
3. You should see a confirmation message

### Step 6: Wait for Propagation
- Wait **1-2 minutes** for changes to propagate
- Changes are usually instant, but can take up to 2 minutes

### Step 7: Test Your Deployment
After waiting, test your deployment:

**Your current deployment URL**:
```
https://dealership-ai-dashboard-ircgs9hkt-brian-kramer-dealershipai.vercel.app
```

**What to check**:
- ✅ Page loads without "Invalid host" error
- ✅ No red error banner
- ✅ Landing page displays correctly
- ✅ Authentication buttons work

---

## 🔍 Visual Guide (What You're Looking For)

### What the Section Looks Like:

```
┌─────────────────────────────────────────────────┐
│  Frontend API                                   │
├─────────────────────────────────────────────────┤
│  Allowed Origins                                │
│                                                 │
│  Current origins:                               │
│  • https://dealershipai.com                     │
│  • https://www.dealershipai.com                 │
│                                                 │
│  [Add URL]                                      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ https://*.vercel.app                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Save] [Cancel]                                │
└─────────────────────────────────────────────────┘
```

---

## 📝 URLs to Add

Add these **exact** URLs (copy-paste to avoid typos):

```
https://*.vercel.app
https://dealership-ai-dashboard-*.vercel.app
```

**Important**: 
- ✅ Must start with `https://`
- ✅ Wildcards (`*`) are allowed
- ✅ No trailing slashes

---

## ✅ Verification Checklist

Use this checklist as you go:

- [ ] Opened https://dashboard.clerk.com
- [ ] Selected DealershipAI application
- [ ] Found "Allowed Origins" section
- [ ] Added `https://*.vercel.app`
- [ ] Added `https://dealership-ai-dashboard-*.vercel.app`
- [ ] Clicked "Save"
- [ ] Waited 1-2 minutes
- [ ] Tested deployment URL
- [ ] No "Invalid host" error

---

## 🆘 Troubleshooting

### "I can't find 'Allowed Origins'"
1. Try searching for "CORS" or "frontend api"
2. Check if you're in the right application
3. Look in Settings → Advanced Settings
4. Check Clerk docs: https://clerk.com/docs/deployments/frontend-cors

### "The Save button is grayed out"
- Make sure you've actually entered a URL
- Check for any validation errors
- Try refreshing the page

### "Changes aren't working after 2 minutes"
1. Clear your browser cache
2. Try incognito/private mode
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Double-check the exact URL in Clerk matches your deployment URL

### "I'm not sure if I'm in the right place"
- Look for your application name at the top
- You should see sections like "API Keys", "Users", "Configure"
- If you see "Applications" list, you need to click into your app first

---

## 📞 After You're Done

Once you've updated Clerk, run this command to verify:

```bash
curl -I https://dealership-ai-dashboard-ircgs9hkt-brian-kramer-dealershipai.vercel.app
```

Or just visit the URL in your browser and check:
- ✅ Page loads
- ✅ No red error banners
- ✅ No console errors about "Invalid host"

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Your deployment URL loads without errors
- ✅ No "Invalid host" error in browser console
- ✅ Authentication flows work (if you test login)
- ✅ No Clerk-related errors in network tab

---

**Ready? Go to https://dashboard.clerk.com and follow the steps above!** 🚀
