# 🔐 Authentication Testing Guide

## ✅ Test Authentication Flow

### Prerequisites
- ✅ Clerk authentication configured
- ✅ Clerk keys added to Vercel environment variables
- ✅ Deployment URL available

---

## 📋 Step-by-Step Testing

### Test 1: Sign Up Flow

1. **Navigate to Sign Up**
   - Visit: `https://your-deployment.vercel.app/auth/signup`
   - Or click "Sign Up" from homepage

2. **Create Account**
   - Enter email: `test@dealershipai.com`
   - Enter password: (meets requirements)
   - Complete Clerk signup flow

3. **Verify Redirect**
   - ✅ Should redirect to `/dashboard` after signup
   - ✅ User session should be active
   - ✅ Dashboard should load with user data

4. **Check Session Persistence**
   - ✅ Refresh page
   - ✅ User should remain logged in
   - ✅ Dashboard should still load

---

### Test 2: Sign In Flow

1. **Sign Out** (if logged in)
   - Click "Sign Out" button
   - ✅ Should redirect to homepage or login

2. **Navigate to Sign In**
   - Visit: `https://your-deployment.vercel.app/auth/signin`
   - Or click "Sign In" from homepage

3. **Sign In**
   - Enter credentials: `test@dealershipai.com`
   - Enter password
   - Complete Clerk signin flow

4. **Verify Redirect**
   - ✅ Should redirect to `/dashboard`
   - ✅ Session active
   - ✅ Dashboard loads correctly

---

### Test 3: Protected Routes

1. **Access Protected Route While Logged Out**
   - Visit: `https://your-deployment.vercel.app/dashboard`
   - ✅ Should redirect to signin page
   - ✅ Should preserve redirect destination

2. **Access Protected Route While Logged In**
   - Visit: `https://your-deployment.vercel.app/dashboard`
   - ✅ Should load dashboard directly
   - ✅ No redirect to signin

---

### Test 4: API Route Protection

1. **Test Protected API While Logged Out**
   ```bash
   curl https://your-deployment.vercel.app/api/zero-click/summary?tenantId=demo
   ```
   - ✅ Should return 401 or redirect (if auth required)

2. **Test Protected API While Logged In**
   - Use browser DevTools → Network tab
   - Make authenticated request
   - ✅ Should return data (if endpoint requires auth)

---

## 🐛 Common Issues & Fixes

### Issue: Redirect Loop
**Symptom**: Endless redirect between signin/dashboard  
**Fix**: 
- Check Clerk redirect URLs in dashboard
- Verify `signInFallbackRedirectUrl` and `signUpFallbackRedirectUrl` in layout

### Issue: 401 on Protected Routes
**Symptom**: Getting 401 even when logged in  
**Fix**:
- Verify Clerk keys in Vercel environment
- Check API route auth middleware
- Ensure `@clerk/nextjs/server` imports correct

### Issue: Session Not Persisting
**Symptom**: Logged out after refresh  
**Fix**:
- Check Clerk session token expiration
- Verify cookies are set correctly
- Check browser cookie settings

---

## ✅ Success Criteria

- [ ] Can sign up with new account
- [ ] Redirects to dashboard after signup
- [ ] Can sign in with existing account
- [ ] Can sign out successfully
- [ ] Session persists across page refreshes
- [ ] Protected routes require authentication
- [ ] Redirect URLs work correctly
- [ ] No console errors related to auth

---

## 📝 Test Checklist

Copy this checklist when testing:

```
Authentication Flow Test - [Date]
=====================================

Sign Up Flow:
[ ] Navigate to signup page
[ ] Enter email
[ ] Enter password
[ ] Complete signup
[ ] Redirects to dashboard ✓
[ ] User data loads ✓
[ ] Session persists on refresh ✓

Sign In Flow:
[ ] Navigate to signin page
[ ] Enter credentials
[ ] Complete signin
[ ] Redirects to dashboard ✓
[ ] User data loads ✓
[ ] Session persists on refresh ✓

Sign Out:
[ ] Click sign out
[ ] Redirects to homepage ✓
[ ] Cannot access dashboard ✓

Protected Routes:
[ ] /dashboard redirects when logged out ✓
[ ] /dashboard loads when logged in ✓
[ ] API routes require auth ✓

Issues Found:
- 
- 
- 

Status: [ ] PASS [ ] FAIL
```

---

## 🚀 Quick Test Commands

### Test Deployment URL
```bash
curl -I https://your-deployment.vercel.app/auth/signin
```
Should return 200 OK

### Test Protected Route
```bash
curl -I https://your-deployment.vercel.app/dashboard
```
Should return redirect (if logged out) or 200 (if logged in)

### Check Clerk Keys (in Vercel)
```bash
npx vercel env ls
```
Should show:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

**Status**: ⏳ Ready to test  
**Time**: ~10 minutes  
**Difficulty**: Easy

