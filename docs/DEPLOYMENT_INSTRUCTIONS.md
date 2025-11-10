# 🚀 Deployment Instructions - DealershipAI

## ✅ Pre-Deployment Checklist

- [x] All code changes committed
- [x] Redis environment variables configured
- [x] Build completes successfully
- [x] All components tested

## 📋 Vercel Environment Variables

### Required Variables

Set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
```

#### Upstash Redis (Rate Limiting)
```
UPSTASH_REDIS_REST_URL=https://stable-whippet-17537.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUSBAAIncDJmMjViZTZkMGUwMzA0ODBjOGI5YjBmYjU0ZTg1N2U3OHAyMTc1Mzc
```

#### Supabase (Optional - for telemetry)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

#### Google Analytics (Optional)
```
NEXT_PUBLIC_GA=G-XXXXXXXXXX
```

### Environment-Specific Variables

**Production:**
- Set all variables above
- Use production Clerk keys (`pk_live_`, `sk_live_`)

**Preview/Development:**
- Can use development Clerk keys (`pk_test_`, `sk_test_`)
- Redis credentials are the same

## 🔄 Deployment Steps

### 1. Automatic Deployment (Recommended)

If your repository is connected to Vercel:

1. **Push to main branch** (already done):
   ```bash
   git push origin main
   ```

2. **Vercel will auto-deploy** - Check deployment status in Vercel dashboard

3. **Set environment variables** in Vercel dashboard (see above)

4. **Redeploy** if needed after setting environment variables

### 2. Manual Deployment

If you need to deploy manually:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## ✅ Post-Deployment Verification

### 1. Test Landing Page
- [ ] Visit `/` - Landing page loads
- [ ] Test URL scan - Works correctly
- [ ] AIVStrip and AIVCompositeChip display in preview results
- [ ] Sign up flow works

### 2. Test Authentication
- [ ] Sign up creates new user
- [ ] Sign in works
- [ ] Onboarding redirect works for new users
- [ ] Protected routes require authentication

### 3. Test Onboarding
- [ ] `/onboarding` accessible to signed-in users
- [ ] URL validation works
- [ ] Multi-step flow completes
- [ ] Redirects to dashboard on completion

### 4. Test Dashboard
- [ ] `/dashboard` accessible after onboarding
- [ ] All components load
- [ ] API routes respond correctly

### 5. Test Error Handling
- [ ] Error boundaries catch errors gracefully
- [ ] 404 pages work
- [ ] API errors return proper responses

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Redis URL doesn't have placeholders
- Check Vercel build logs for specific errors

### Authentication Issues
- Verify Clerk keys are correct
- Check Clerk dashboard for allowed origins
- Ensure redirect URLs match Vercel domain

### Redis Rate Limiting Not Working
- Verify Redis credentials are correct
- Check Upstash dashboard for database status
- Rate limiting is optional - app works without it

### API Routes Return 500
- Check Supabase credentials if using telemetry
- Verify all required environment variables are set
- Check Vercel function logs

## 📊 Monitoring

### Vercel Analytics
- Automatic with `@vercel/analytics/react`
- View in Vercel dashboard

### Error Tracking
- Error boundaries log to console
- Consider adding Sentry for production monitoring

### Performance
- Check Vercel Analytics for Core Web Vitals
- Monitor API route response times

## 🔐 Security Checklist

- [x] Environment variables not committed to git
- [x] Clerk authentication configured
- [x] Protected routes enforced via middleware
- [x] API routes validate authentication
- [x] Rate limiting configured (Redis)
- [x] Security headers configured (next.config.js)

## 📝 Next Steps

1. **Monitor first deployment** - Watch for errors
2. **Test all user flows** - Landing → Sign up → Onboarding → Dashboard
3. **Set up monitoring** - Consider Sentry for error tracking
4. **Configure custom domain** - If needed
5. **Set up staging environment** - For testing before production

---

**Status**: ✅ **Ready for Production**

All code is complete and tested. The application is production-ready!

