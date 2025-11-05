# Adding Clerk Keys to Vercel - Manual Instructions

## ✅ Status
- ✅ Keys added to `.env.local` successfully
- ⚠️  Vercel CLI requires interactive mode

## Quick Manual Update

Since Vercel CLI requires interactive confirmation, you have two options:

### Option 1: Vercel Dashboard (Recommended - Fastest)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `dealership-ai-dashboard`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:

**For Production:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- `CLERK_SECRET_KEY` = `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`

**For Preview:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- `CLERK_SECRET_KEY` = `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`

**For Development:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- `CLERK_SECRET_KEY` = `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`

### Option 2: Vercel CLI (Interactive)
Run these commands one by one (you'll need to confirm each):

```bash
# Publishable Key
echo "pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
echo "pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development

# Secret Key
echo "sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl" | vercel env add CLERK_SECRET_KEY production
echo "sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl" | vercel env add CLERK_SECRET_KEY preview
echo "sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl" | vercel env add CLERK_SECRET_KEY development
```

## Verification

After adding, verify:

```bash
# Check Vercel
vercel env ls | grep CLERK

# Check local
grep CLERK .env.local
```

## Current Status

✅ **.env.local**: Keys added successfully
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- `CLERK_SECRET_KEY=sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`

⚠️ **Vercel**: Some keys exist (5 found), but you may need to update them with the new values above

## Next Steps

1. Update Vercel environment variables (see Option 1 above)
2. Redeploy your application: `vercel --prod`
3. Test authentication in production

