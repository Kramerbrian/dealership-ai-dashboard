# 🔑 Quick Guide: Add Clerk Keys to Vercel

## Current Status
✅ **Deployment Building**: https://dealership-ai-dashboard-9u4j2l2b4-brian-kramer-dealershipai.vercel.app

---

## Step-by-Step: Add Clerk Keys (5 minutes)

### 1. Get Your Clerk Keys

**Option A: If you already have Clerk account**
1. Go to: https://dashboard.clerk.com
2. Select your app: `dealership-ai-dashboard`
3. Go to **API Keys** section
4. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Option B: Create new Clerk account** (if you don't have one)
1. Go to: https://clerk.com
2. Click **Start Building for Free**
3. Sign up with GitHub
4. Click **Create Application**
5. Choose **DealershipAI** or similar name
6. Go to **API Keys** → Copy both keys

---

### 2. Add Keys to Vercel (3 ways)

#### Method 1: Via Web Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
   ```

2. **Add these variables:**

   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Value:** `pk_test_xxxxxxxxxxxxxxxxxxxxx` (your publishable key)
   - **Environment:** Production ✓
   - Click **Save**

   **Variable 2:**
   - **Key:** `CLERK_SECRET_KEY`
   - **Value:** `sk_test_xxxxxxxxxxxxxxxxxxxxx` (your secret key)
   - **Environment:** Production ✓
   - Click **Save**

3. **Optional - Add redirect URLs:**
   - **Key:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - **Value:** `https://your-production-url.vercel.app/dashboard`
   - **Environment:** Production ✓

4. **Trigger Redeploy:**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - OR click **Redeploy** button

---

#### Method 2: Via Vercel CLI (Fastest)

```bash
# Add Clerk keys via CLI
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste your publishable key
# Press Enter

npx vercel env add CLERK_SECRET_KEY production
# Paste your secret key
# Press Enter

# Redeploy
npx vercel --prod
```

---

#### Method 3: Via `.env.production` file (Manual)

```bash
# Create .env.production file
cat > .env.production << EOF
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
EOF

# Pull environment variables
npx vercel env pull .env.production

# Edit the file
nano .env.production

# Push updated variables
npx vercel env push .env.production production
```

---

### 3. Configure Clerk Redirect URLs

After adding keys to Vercel, configure Clerk:

1. **Go to Clerk Dashboard:** https://dashboard.clerk.com
2. **Select your application**
3. **Go to: Configure → URLs**
4. **Add these URLs:**

   - **Allowed Origins:**
     - `https://your-production-url.vercel.app`
     - `https://dealershipai.com` (if using custom domain)

   - **Callback URLs:**
     - `https://your-production-url.vercel.app/api/auth/callback`
     - `https://dealershipai.com/api/auth/callback`

   - **Sign-in redirect:** `/dashboard`
   - **Sign-up redirect:** `/dashboard`

5. **Click Save**

---

### 4. Test Deployment

After redeploy completes (2-3 minutes):

1. **Visit:** https://your-production-url.vercel.app
2. **Click "Sign Up"**
3. **Complete registration**
4. **Should redirect to `/dashboard`**
5. **Should see dashboard content**

---

## Quick Troubleshooting

### Issue: "ClerkProvider not found"
**Fix:** Add environment variables and redeploy

### Issue: "Invalid API key"
**Fix:** Verify you copied the correct keys (publishable vs secret)

### Issue: "Redirect URL mismatch"
**Fix:** Add your Vercel URL to Clerk dashboard redirect URLs

### Issue: Deployment fails
**Fix:** Check build logs:
```bash
npx vercel logs
```

---

## Current Environment Variables Needed

```bash
# Required for authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Optional but recommended
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://your-url.vercel.app/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://your-url.vercel.app/dashboard
```

---

## Next Steps After Clerk

1. ✅ **Test Authentication** - Sign up and sign in
2. **Add Supabase** - For database (see `PRODUCTION_SETUP_GUIDE.md`)
3. **Add Upstash** - For Redis caching
4. **Add Stripe** - For payments
5. **Add Custom Domain** - `dealershipai.com`

---

## Quick Commands

```bash
# View current environment variables
npx vercel env ls

# Pull environment variables locally
npx vercel env pull .env.production

# View logs
npx vercel logs

# Redeploy
npx vercel --prod

# Open project in browser
vercel --open
```

---

**Status**: ⏳ Waiting for Clerk keys to be added  
**Next**: Add keys using Method 1 above, then redeploy  
**Time**: 5 minutes total

