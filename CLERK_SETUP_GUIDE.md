# 🔐 Clerk Setup Guide - Option 1

**Quick setup to get your server running with Clerk authentication.**

---

## Step 1: Get Clerk Keys

### 1.1 Create/Login to Clerk Account
1. Go to: https://dashboard.clerk.com/
2. Sign in or create a free account

### 1.2 Create Application
1. Click **"Create Application"**
2. Name it: `DealershipAI` (or your preferred name)
3. Choose authentication methods:
   - ✅ Email (recommended)
   - ✅ Google OAuth (optional)
   - ✅ GitHub OAuth (optional)

### 1.3 Get API Keys
1. In your Clerk dashboard, go to **"API Keys"**
2. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Note:** Use `pk_test_` and `sk_test_` for development.

---

## Step 2: Configure Redirect URLs

In Clerk Dashboard → **"Paths"**:

### After Sign In:
```
/onboarding
```

### After Sign Up:
```
/onboarding
```

### Sign In URL:
```
/sign-in
```

### Sign Up URL:
```
/sign-up
```

---

## Step 3: Add Keys to .env.local

Create or update `.env.local` in your project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Optional: Custom domain (if using custom domain)
# NEXT_PUBLIC_CLERK_DOMAIN=dealershipai.com
```

**Replace `YOUR_KEY_HERE` and `YOUR_SECRET_KEY_HERE` with your actual keys from Step 1.3**

---

## Step 4: Restart Server

```bash
# Stop current server
pkill -f "next dev"

# Start fresh
npm run dev
```

---

## Step 5: Verify Setup

### Check Server Status
```bash
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

### Test Authentication
1. Open http://localhost:3000
2. Click "Sign Up" or "Get Started"
3. Should redirect to Clerk sign-up page
4. After sign-up, should redirect to `/onboarding`

---

## ✅ Success Indicators

- ✅ Server returns 200 OK
- ✅ No console errors about missing Clerk keys
- ✅ Sign up/Sign in buttons work
- ✅ Redirects to `/onboarding` after authentication

---

## 🐛 Troubleshooting

### Error: "Missing publishableKey"
- **Fix:** Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- **Note:** Must restart server after adding env vars

### Error: "Invalid secret key"
- **Fix:** Verify `CLERK_SECRET_KEY` is correct (starts with `sk_test_` or `sk_live_`)

### Redirect not working
- **Fix:** Check Clerk Dashboard → Paths → After Sign In/Up URLs

### Still getting 500 errors
- **Fix:** Check server logs: `tail -f /tmp/nextjs-server-fresh.log`
- **Fix:** Clear `.next` cache: `rm -rf .next && npm run dev`

---

## 📝 Quick Reference

**Required Environment Variables:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Clerk Dashboard:**
- https://dashboard.clerk.com/

**Test URLs:**
- Landing: http://localhost:3000
- Sign In: http://localhost:3000/sign-in
- Sign Up: http://localhost:3000/sign-up
- Onboarding: http://localhost:3000/onboarding

---

**Once keys are added, restart the server and you're ready to test!** 🚀

