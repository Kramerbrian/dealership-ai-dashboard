# ✅ Vercel Setup Progress Tracker

## Copy this checklist as you add variables

### Required Variables (9)
- [ ] 1. NODE_ENV
- [ ] 2. NEXT_PUBLIC_APP_URL
- [ ] 3. DATABASE_URL
- [ ] 4. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] 5. CLERK_SECRET_KEY
- [ ] 6. NEXT_PUBLIC_CLERK_SIGN_IN_URL
- [ ] 7. NEXT_PUBLIC_CLERK_SIGN_UP_URL
- [ ] 8. NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
- [ ] 9. NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

### Recommended Variables (9)
- [ ] 10. NEXT_PUBLIC_SUPABASE_URL
- [ ] 11. NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] 12. SUPABASE_SERVICE_ROLE_KEY
- [ ] 13. NEXT_PUBLIC_SENTRY_DSN
- [ ] 14. SENTRY_DSN ⭐ (Important!)
- [ ] 15. SENTRY_ORG
- [ ] 16. SENTRY_PROJECT
- [ ] 17. OPENAI_API_KEY
- [ ] 18. ANTHROPIC_API_KEY

---

## Post-Setup Checklist

- [ ] All 18 variables added to Vercel
- [ ] All variables have Production ✅ Preview ✅ Development ✅
- [ ] Redeployed project in Vercel
- [ ] Build completed successfully
- [ ] Health check passing: `curl https://dealershipai.com/api/health`
- [ ] Checked Sentry dashboard for errors
- [ ] Verified production URL works

---

## Quick Commands

### Verify Environment Variables Locally
```bash
npm run verify:env
```

### Check Sentry DSN
```bash
npm run check:sentry
```

### Export Vercel Variables
```bash
npm run export:vercel-env
```

### Test Health Endpoint (after deployment)
```bash
curl https://dealershipai.com/api/health
```

---

**Progress:** 0/18 variables added

**Time Estimate:** 10-15 minutes total

**Status:** Ready to start! 🚀

