# Clerk Custom Domain Configuration

## ✅ Complete Clerk Setup for `clerk.dealershipai.com`

### Environment Variables Configured in Vercel Production

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_bGVhcm5pbmctc2FpbGZpc2gtNjMuY2xlcmsuYWNjb3VudHMuZGV2JA` | Public key for client-side Clerk SDK |
| `CLERK_SECRET_KEY` | `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl` | Secret key for server-side API calls |
| `CLERK_FRONTEND_API` | `clerk.dealershipai.com` | Custom Clerk domain |
| `NEXT_PUBLIC_CLERK_DOMAIN` | `clerk.dealershipai.com` | Public custom domain |
| `CLERK_JWT_KEY` | `https://clerk.dealershipai.com/.well-known/jwks.json` | JWKS endpoint for JWT verification |

### Allowed Origins Configured via Clerk API

✅ `https://dealership-ai-dashboard-3pm5zxf6u-brian-kramer-dealershipai.vercel.app`  
✅ `https://dealership-ai-dashboard-r0tfuqhi9-brian-kramer-dealershipai.vercel.app`  
✅ `https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app`  
✅ `http://localhost:3000`  
✅ `http://localhost:54323`

---

## 🔧 Custom Domain Setup Details

### Your Clerk Configuration
- **Custom Domain:** clerk.dealershipai.com
- **JWKS Endpoint:** https://clerk.dealershipai.com/.well-known/jwks.json
- **Environment:** Mixed (test publishable key with live secret key)

### Public Key (PEM Format)
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwWssmqvhPxGigDDCkJQ9
vdsiVWMJYYJjI8DDGYMHhspTytw1VqJeLgOAPC4H6M/8DWk1UOn0D1tYBXGksWAc
78QYnGKKQ1kkW59ZzybhFvng/wFOnz13cMQIzX4NNxJd3l7OOCSA7587n3SLuU31
Ym8/wlDpkfdDjSFMFjG5qUp0glszLrSsTh6+WfnYluSO86mU3bwAaQuzvD0wu2r/
fsObKpNx00lTgW1WBp382f/Yq6U3rdlzU8XH+MlaemRghl2moxmn3My5aB5/DPzR
YtutSznmLTADYNs/rN11XfA+ue8Twr18PXw8O5oojM4ZbAJpearc8qOatgf9Xxyj
fwIDAQAB
-----END PUBLIC KEY-----
```

---

## 🚀 Deployment Status

**New deployment building with complete configuration...**

Expected URL after completion:
```
https://dealership-ai-dashboard-[new-id]-brian-kramer-dealershipai.vercel.app
```

---

## 🧪 Testing After Deployment

Once deployment completes, test authentication:

### 1. Visit Production Site
```bash
# Get the latest deployment URL
npx vercel ls --prod

# Open in browser
open [latest-production-url]
```

### 2. Test Authentication Flow
- Navigate to a protected route (e.g., `/dash` or `/dashboard`)
- Should redirect to Clerk sign-in
- Complete authentication
- Should redirect back to protected route

### 3. Expected Behavior
- ✅ No "Invalid host" error
- ✅ Clerk sign-in page loads from `clerk.dealershipai.com`
- ✅ Authentication completes successfully
- ✅ User session persists

---

## ⚠️ Potential Issues & Solutions

### Issue: Mixed Environment Keys

**Problem:** You're using:
- `pk_test_` (test) publishable key
- `sk_live_` (live) secret key

**Solution:** Ensure both keys are from the same environment:

```bash
# For PRODUCTION, both should be live:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# For DEVELOPMENT/TESTING, both should be test:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

To fix this:
1. Go to https://dashboard.clerk.com
2. Select **Production** environment
3. Copy BOTH keys from **Production** tab
4. Update Vercel environment variables

---

### Issue: Custom Domain Not Fully Configured

If you're still seeing "Invalid host" errors, verify:

**1. DNS Configuration:**
```bash
dig clerk.dealershipai.com
# Should return Clerk's IP addresses
```

**2. Clerk Dashboard Settings:**
- Go to https://dashboard.clerk.com
- Navigate to **Domains** section
- Verify `clerk.dealershipai.com` is listed and verified

**3. SSL Certificate:**
- Custom domain must have valid SSL
- Check: https://clerk.dealershipai.com/.well-known/jwks.json
- Should return JSON without SSL errors

---

### Issue: Middleware Not Recognizing Clerk

If protected routes aren't working:

**Check middleware.ts:**
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  // Your middleware logic
});
```

**Verify config matcher:**
```typescript
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## 🔍 Verify Configuration

### Check All Environment Variables
```bash
npx vercel env ls | grep CLERK
```

Should show:
- `CLERK_FRONTEND_API`
- `CLERK_JWT_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_DOMAIN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Plus any redirect URLs

### Test JWKS Endpoint
```bash
curl https://clerk.dealershipai.com/.well-known/jwks.json
```

Should return JSON with keys array.

### Check Deployment Logs
```bash
npx vercel logs [deployment-url] --follow
```

Look for Clerk-related errors or warnings.

---

## 📝 Next Steps After Authentication Works

### 1. Configure Database
See [QUICK_MIGRATION_GUIDE.md](./QUICK_MIGRATION_GUIDE.md)

Add Supabase credentials:
```bash
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
```

Run migrations:
```bash
npx vercel env pull .env.production
npx dotenv -e .env.production -- npx prisma migrate deploy
```

### 2. Test Protected API Routes
```bash
# This should require authentication:
curl -H "Authorization: Bearer [clerk-jwt-token]" \
  https://[your-domain]/api/pulse/score?dealerId=demo-123
```

### 3. Set Up User Management
- Configure user roles in Clerk dashboard
- Set up organization support (if needed)
- Configure session duration
- Set up webhooks for user events

---

## 🆘 Still Having Issues?

### Debug Checklist

- [ ] Both Clerk keys are from the same environment (both test OR both live)
- [ ] Custom domain `clerk.dealershipai.com` is verified in Clerk dashboard
- [ ] JWKS endpoint is accessible: https://clerk.dealershipai.com/.well-known/jwks.json
- [ ] All production URLs are in Clerk allowed origins
- [ ] Deployment completed successfully (check `npx vercel ls`)
- [ ] Environment variables loaded in deployment (check logs)
- [ ] Browser cache cleared
- [ ] No CORS errors in browser console

### Get Deployment Logs
```bash
# List all deployments
npx vercel ls

# Get logs for latest
npx vercel logs [deployment-url] --follow

# Check for Clerk errors
npx vercel logs [deployment-url] | grep -i clerk
```

### Contact Support

If issues persist:
- **Clerk Support:** https://clerk.com/support
- **Clerk Discord:** https://clerk.com/discord
- **Documentation:** https://clerk.com/docs

---

## 📚 Documentation Links

- [Clerk Custom Domains](https://clerk.com/docs/deployments/custom-domains)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Summary

✅ **Configured:**
- 5 Clerk environment variables in Vercel
- 5 allowed origins via Clerk API
- Custom domain: `clerk.dealershipai.com`
- JWKS endpoint for JWT verification

⏳ **In Progress:**
- Production deployment with new configuration

📋 **Next:**
- Test authentication after deployment
- Verify no "Invalid host" errors
- Configure database credentials
- Set up Pulse System tables

**Current Status:** Waiting for deployment to complete (~2-3 minutes)
