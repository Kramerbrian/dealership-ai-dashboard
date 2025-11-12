# ✅ Clerk Keys Setup - Enhanced Script Ready

**Enhanced script now checks multiple sources for Clerk keys!**

---

## 🎯 What the Script Does

The enhanced `scripts/setup-clerk-keys.sh` script now:

1. ✅ **Checks .env.local** - Looks for existing keys
2. ✅ **Checks Vercel CLI** - Pulls keys from Vercel (if CLI installed and logged in)
3. ✅ **Checks Supabase CLI** - Shows info (secrets are encrypted, can't extract values)
4. ✅ **Prompts for manual entry** - If no keys found

---

## 🚀 How to Use

### Run the Script
```bash
./scripts/setup-clerk-keys.sh
```

### What Happens
1. Script searches for keys in:
   - `.env.local` (local file)
   - Vercel CLI (if installed)
   - Supabase CLI (informational only)

2. If keys found:
   - Shows preview
   - Asks to use them
   - Adds to `.env.local`

3. If no keys found:
   - Shows options to get keys
   - Prompts for manual entry
   - Validates format
   - Adds to `.env.local`

---

## 📋 Options to Get Keys

### Option 1: Clerk Dashboard (Recommended)
1. Go to: https://dashboard.clerk.com/
2. Sign in or create account
3. Create application → API Keys
4. Copy keys

### Option 2: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Find Clerk keys
4. Copy values

### Option 3: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.vercel

# Keys will be in .env.vercel file
```

---

## ⚠️ Important Notes

### Supabase Secrets
- Supabase CLI `secrets list` only shows **digests** (hashes)
- Actual secret values are **encrypted** and can't be extracted
- This is a security feature
- Use Vercel or Clerk dashboard to get actual keys

### Vercel CLI
- Must be installed: `npm i -g vercel`
- Must be logged in: `vercel login`
- Will pull keys from your Vercel project

---

## ✅ After Running Script

1. **Keys added to .env.local** ✅
2. **Configure Clerk redirects:**
   - After Sign In: `/onboarding`
   - After Sign Up: `/onboarding`
3. **Restart server:**
   ```bash
   pkill -f "next dev"
   npm run dev
   ```
4. **Test:**
   - Open http://localhost:3000
   - Click "Sign Up"
   - Should work!

---

## 🎯 Quick Start

```bash
# Run the script
./scripts/setup-clerk-keys.sh

# If keys found, confirm to use them
# If not found, enter manually from Clerk dashboard

# Restart server
pkill -f "next dev" && npm run dev
```

---

**Ready to set up Clerk keys? Run `./scripts/setup-clerk-keys.sh`!** 🚀

