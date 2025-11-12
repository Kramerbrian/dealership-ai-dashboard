# ⚡ Quick Clerk Setup - Option 1

**Get your server running in 5 minutes!**

---

## 🚀 Quick Start

### Step 1: Get Clerk Keys (2 minutes)

1. **Go to Clerk Dashboard:**
   - https://dashboard.clerk.com/
   - Sign in or create free account

2. **Create Application:**
   - Click "Create Application"
   - Name: `DealershipAI`
   - Choose: Email authentication

3. **Get API Keys:**
   - Go to **"API Keys"** in sidebar
   - Copy **Publishable Key** (starts with `pk_test_`)
   - Copy **Secret Key** (starts with `sk_test_`)

---

### Step 2: Add Keys to Project (1 minute)

**Option A: Use Setup Script (Recommended)**
```bash
./scripts/setup-clerk-keys.sh
```

**Option B: Manual Edit**
```bash
# Edit .env.local
nano .env.local

# Add these lines (replace with your actual keys):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

---

### Step 3: Configure Clerk Redirects (1 minute)

In Clerk Dashboard → **"Paths"**:

- **After Sign In:** `/onboarding`
- **After Sign Up:** `/onboarding`
- **Sign In URL:** `/sign-in`
- **Sign Up URL:** `/sign-up`

---

### Step 4: Restart Server (1 minute)

```bash
# Stop current server
pkill -f "next dev"

# Start fresh
npm run dev
```

Wait for: `✓ Ready in X seconds`

---

### Step 5: Test (30 seconds)

```bash
# Check server
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

**Open browser:**
- http://localhost:3000
- Click "Sign Up"
- Should redirect to Clerk sign-up page

---

## ✅ Success Checklist

- [ ] Server returns 200 OK
- [ ] No console errors about Clerk
- [ ] Sign up button works
- [ ] Redirects to `/onboarding` after sign-up

---

## 🐛 Troubleshooting

### "Missing publishableKey" error
- ✅ Keys added to `.env.local`?
- ✅ Server restarted after adding keys?
- ✅ Keys start with `pk_test_` and `sk_test_`?

### Still getting 500 errors
```bash
# Check server logs
tail -f /tmp/nextjs-server-fresh.log

# Clear cache and restart
rm -rf .next
npm run dev
```

### Redirect not working
- ✅ Check Clerk Dashboard → Paths
- ✅ After Sign In/Up should be `/onboarding`

---

## 📝 Quick Reference

**Clerk Dashboard:** https://dashboard.clerk.com/  
**Setup Script:** `./scripts/setup-clerk-keys.sh`  
**Test URL:** http://localhost:3000

**Required Keys:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
- `CLERK_SECRET_KEY` (starts with `sk_test_`)

---

**Ready? Run `./scripts/setup-clerk-keys.sh` to get started!** 🚀

