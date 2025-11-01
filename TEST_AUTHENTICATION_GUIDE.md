# 🧪 DealershipAI - Authentication Testing Guide

## 🎯 Test Authentication Flow

### Live Deployment
**URL**: https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app

---

## 📝 Authentication Testing Steps

### 1. Test Sign Up Flow (5 minutes)

#### Step-by-Step
1. **Open browser**: Navigate to https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
2. **Look for**: "Sign Up" button or link
3. **Click**: Sign Up button
4. **Enter details**:
   - Email: `test@dealershipai.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
5. **Verify**: Redirect to `/dashboard`
6. **Check**: Session persists

#### Expected Results
- ✅ Sign up form loads
- ✅ Email validation works
- ✅ Password requirements met
- ✅ Registration completes
- ✅ Redirect to dashboard works
- ✅ User session active

---

### 2. Test Sign In Flow (5 minutes)

#### Step-by-Step
1. **Sign out** (if signed in)
2. **Click**: "Sign In" button
3. **Enter credentials**:
   - Email: `test@dealershipai.com`
   - Password: `TestPassword123!`
4. **Click**: Sign In button
5. **Verify**: Redirect to `/dashboard`

#### Expected Results
- ✅ Sign in form loads
- ✅ Credentials are accepted
- ✅ Redirect works
- ✅ User session active
- ✅ Dashboard loads

---

### 3. Test Sign Out Flow (2 minutes)

#### Step-by-Step
1. **Click**: User menu/profile
2. **Click**: "Sign Out"
3. **Verify**: Redirect to home
4. **Check**: Session cleared

#### Expected Results
- ✅ Sign out works
- ✅ Session terminated
- ✅ Redirect to home
- ✅ Cannot access dashboard

---

### 4. Test Session Persistence (2 minutes)

#### Step-by-Step
1. **Sign in**
2. **Refresh page** (F5)
3. **Verify**: Still signed in
4. **Close browser** and reopen
5. **Verify**: Session persists

#### Expected Results
- ✅ Session persists on refresh
- ✅ Session persists after browser restart
- ✅ User stays signed in

---

### 5. Test Protected Routes (5 minutes)

#### Step-by-Step
1. **Sign out** (if signed in)
2. **Navigate to**: `https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app/dashboard`
3. **Verify**: Redirect to sign in
4. **Sign in** again
5. **Navigate to**: `/dashboard`
6. **Verify**: Dashboard loads

#### Expected Results
- ✅ Protected routes require authentication
- ✅ Redirect to sign in works
- ✅ After sign in, access granted

---

## 🚨 Troubleshooting Common Issues

### Issue: "ClerkProvider not found"
**Fix**:
```bash
# Verify environment variables are set
npx vercel env ls

# If missing, add them
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
npx vercel env add CLERK_SECRET_KEY production

# Redeploy
npx vercel --prod
```

### Issue: "Invalid redirect URL"
**Fix**:
1. Go to: https://dashboard.clerk.com
2. Select your app
3. Configure → URLs
4. Add: `https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app`
5. Save changes
6. Redeploy: `npx vercel --prod`

### Issue: "Redirect loop"
**Fix**:
1. Check: `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` is set correctly
2. Update: Redirect URLs in Clerk dashboard
3. Redeploy

### Issue: "Cannot access dashboard"
**Fix**:
1. Check: Sign in actually completed
2. Verify: User has necessary permissions
3. Check: Middleware is configured correctly

---

## 📊 Authentication Status Check

### Check Environment Variables
```bash
npx vercel env ls | grep CLERK
```

Should show:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

### Check Clerk Dashboard
1. Go to: https://dashboard.clerk.com
2. Select: `dealership-ai-dashboard`
3. Check:
   - ✅ Users are appearing after sign up
   - ✅ Sessions are active
   - ✅ No errors in logs

### Check Browser Console
1. Open: Developer tools (F12)
2. Check: Console tab for errors
3. Check: Network tab for failed requests
4. Common errors:
   - Clerk key not found
   - Redirect URL mismatch
   - Session expired

---

## 🎯 Authentication Test Checklist

### Sign Up Testing
- [ ] Form loads correctly
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Registration completes
- [ ] Redirect to dashboard
- [ ] User appears in Clerk dashboard

### Sign In Testing
- [ ] Form loads correctly
- [ ] Credentials are validated
- [ ] Sign in completes
- [ ] Redirect to dashboard
- [ ] Session is active

### Sign Out Testing
- [ ] Sign out works
- [ ] Session terminated
- [ ] Redirect to home
- [ ] Cannot access dashboard

### Session Management
- [ ] Session persists on refresh
- [ ] Session persists after restart
- [ ] Session timeout works (if configured)

### Protected Routes
- [ ] Unauthenticated users redirected
- [ ] Authenticated users allowed
- [ ] Middleware works correctly

---

## 📞 Support Resources

### Clerk Support
- **Dashboard**: https://dashboard.clerk.com
- **Docs**: https://clerk.com/docs
- **Troubleshooting**: https://clerk.com/docs/troubleshooting

### Vercel Support
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs
- **Logs**: `npx vercel logs`

### Quick Debug Commands
```bash
# View logs
npx vercel logs

# Check environment
npx vercel env ls

# Inspect deployment
npx vercel inspect deployment-url

# Redeploy
npx vercel --prod
```

---

## ✅ Success Criteria

### Minimum Requirements
- ✅ Users can sign up
- ✅ Users can sign in
- ✅ Users can sign out
- ✅ Protected routes work
- ✅ Sessions persist

### Recommended Features
- ✅ OAuth providers work (Google, GitHub)
- ✅ Password reset works
- ✅ Email verification works
- ✅ Session timeout works
- ✅ Multi-factor authentication (optional)

---

## 🚀 Next Steps After Authentication Works

1. **Test Dashboard Features** (15 minutes)
   - Verify dashboard loads
   - Test all tabs
   - Check API endpoints

2. **Test Payments** (15 minutes)
   - Test Stripe checkout
   - Verify webhook
   - Check tier updates

3. **Custom Domain** (15 minutes)
   - Add dealershipai.com
   - Update DNS
   - Configure SSL

---

**Status**: ⏳ Ready to Test  
**Time**: 20 minutes to complete all tests  
**Next**: Run through checklist above  

**Start Testing**: Visit the live URL and follow the steps!

