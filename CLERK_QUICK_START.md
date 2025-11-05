# 🚀 Clerk Multi-Domain Quick Start

## Environment Variables Required

Add these to `.env.local` and Vercel:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

## Quick Setup Steps

### 1. Clerk Dashboard Configuration

1. Go to https://dashboard.clerk.com/
2. Add domains:
   - `dealershipai.com` (Primary)
   - `dash.dealershipai.com` (Additional)
3. Add redirect URLs:
   - `https://dealershipai.com/*`
   - `https://dash.dealershipai.com/*`
   - `http://localhost:3000/*` (for dev)

### 2. Test Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/dashboard
# Should redirect to /sign-in if not authenticated
```

### 3. Deploy to Vercel

```bash
# Add env vars to Vercel
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY

# Deploy
vercel --prod
```

## How It Works

- **dealershipai.com** → Public landing page (no auth)
- **dash.dealershipai.com** → Dashboard (requires auth)
- Middleware automatically detects domain and protects routes
- Sessions are shared across both domains

## Files Modified

- ✅ `app/middleware.ts` - Clerk middleware with domain routing
- ✅ `app/layout.tsx` - ClerkProvider configured
- ✅ `lib/clerk-config.ts` - Multi-domain configuration

See `CLERK_MULTI_DOMAIN_SETUP.md` for detailed guide.

