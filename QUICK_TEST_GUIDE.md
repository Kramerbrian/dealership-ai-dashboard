# ⚡ Quick Test Guide

## 🎯 5-Minute Smoke Test

### 1. Landing Page (1 min)
1. Visit: https://dealership-ai-dashboard-qkaslz71g-brian-kramer-dealershipai.vercel.app
2. ✅ Page loads
3. ✅ Enter URL → Click "Analyze works
4. ✅ Mobile menu works (if on mobile)

### 2. Sign Up (2 min)
1. Click "Get Your Free Report"
2. Complete sign up
3. ✅ Should redirect to `/onboarding`

### 3. Onboarding (2 min)
1. Enter website URL (e.g., "example.com")
2. Skip optional steps
3. Click "Go to Dashboard"
4. ✅ Should redirect to `/dashboard`

### 4. Verify (30 sec)
1. Check Clerk Dashboard → Users → Your user
2. ✅ `publicMetadata.onboarding_complete` = `true`
3. ✅ `publicMetadata.domain` = your domain

---

## 🔍 If Something Fails

### Check Browser Console
1. Open DevTools (F12)
2. Look for red errors
3. Screenshot errors

### Check Vercel Logs
```bash
npx vercel logs <deployment-id>
```

### Check Clerk Dashboard
- Verify redirect URLs are set
- Check user metadata is updating

---

## ✅ Success Criteria

- [ ] Landing page loads
- [ ] Sign up redirects to onboarding
- [ ] Onboarding completes and redirects to dashboard
- [ ] Clerk metadata updates correctly
- [ ] No console errors

**If all pass → Production ready! 🚀**

