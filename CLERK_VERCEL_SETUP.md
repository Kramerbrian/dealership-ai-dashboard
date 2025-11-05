# 🔐 Clerk & Vercel API Keys Setup Guide

## Quick Setup (Recommended)

### Option 1: Using Vercel CLI (Fastest)

```bash
# 1. Login to Vercel (if not already)
vercel login

# 2. Link your project (if not already)
vercel link

# 3. Add Clerk keys interactively
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Paste your key when prompted (pk_test_... or pk_live_...)
# Select: production, preview, development

vercel env add CLERK_SECRET_KEY
# Paste your secret key when prompted (sk_test_... or sk_live_...)
# Select: production, preview, development
```

### Option 2: Using Environment File

If you have your keys in `.env.local`:

```bash
# Extract and add to Vercel
source .env.local
echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY production preview development
```

### Option 3: Automated Script

```bash
# Run the setup script
./scripts/setup-clerk-vercel-keys.sh
```

## Manual Setup Steps

### Step 1: Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **API Keys**
4. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Add to Local Environment

Create or update `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### Step 3: Add to Vercel

```bash
# Add publishable key (public, safe to expose)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development

# Add secret key (private, never expose)
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_SECRET_KEY preview
vercel env add CLERK_SECRET_KEY development
```

### Step 4: Verify

```bash
# List all environment variables
vercel env ls

# Check specific key
vercel env pull .env.vercel
grep CLERK .env.vercel
```

## Verification

After setup, verify the keys are working:

1. **Local Development:**
   ```bash
   npm run dev
   # Check browser console - no Clerk errors
   ```

2. **Production:**
   - Deploy to Vercel
   - Check deployment logs
   - Verify authentication works

## Troubleshooting

### "Clerk publishable key not found"
- Check `.env.local` exists
- Verify key starts with `pk_`
- Restart dev server after adding keys

### "Clerk secret key not found"
- Check `.env.local` exists  
- Verify key starts with `sk_`
- Never commit `.env.local` to git

### Vercel deployment fails
- Check Vercel dashboard → Settings → Environment Variables
- Verify keys are set for correct environments
- Redeploy after adding keys

## Security Notes

⚠️ **Never commit these to git:**
- `CLERK_SECRET_KEY`
- `.env.local`
- `.env`

✅ **Safe to commit:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (it's public by design)
- `.env.example` (without real values)


