# 🚀 COMPLETE OAUTH SETUP - Step by Step

## 🎯 CURRENT STATUS:
- ✅ Privacy Policy: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy
- ✅ Terms of Service: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms
- ✅ Code Deployed: Latest Vercel deployment ready
- 🔧 Google Cloud Console: Needs OAuth settings update

## 📋 STEP 1: UPDATE GOOGLE CLOUD CONSOLE

### 1.1 OAuth 2.0 Client ID
**Go to**: https://console.cloud.google.com/apis/credentials

1. **Click on your OAuth 2.0 Client ID**
2. **Update "Authorized redirect URIs"**:
   ```
   https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/callback/google
   ```
3. **Update "Authorized JavaScript origins"**:
   ```
   https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app
   ```
4. **Click "Save"**

### 1.2 OAuth Consent Screen
**Go to**: https://console.cloud.google.com/apis/credentials/consent

1. **Click "Edit App"**
2. **Update required fields**:
   - **App name**: `DealershipAI`
   - **User support email**: `kainomura@dealershipai.com`
   - **Developer contact information**: `kainomura@dealershipai.com`
   - **Privacy policy URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy`
   - **Terms of service URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms`
3. **Click "Save and Continue"**
4. **Click "Publish App"** (CRITICAL - must be published!)

## 📋 STEP 2: WAIT FOR PROPAGATION
**Wait 2-3 minutes** for Google's changes to propagate globally.

## 📋 STEP 3: TEST OAUTH

### 3.1 Test Google OAuth API
```bash
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/signin/google"
```

**Expected Result**:
- **Status**: 302
- **Redirect**: `https://accounts.google.com/oauth/authorize?client_id=...`

### 3.2 Test Browser OAuth Flow
1. **Go to**: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/auth/signin
2. **Click**: "Continue with Google"
3. **Expected**: Redirects to Google OAuth consent screen
4. **Complete**: OAuth flow and verify redirect to dashboard

## 📋 STEP 4: VERIFY SUCCESS

### ✅ Success Indicators:
- [ ] Google OAuth redirects to Google (not error page)
- [ ] OAuth consent screen shows "DealershipAI" app
- [ ] Privacy policy and terms links work
- [ ] User can complete sign-in flow
- [ ] Redirects to dashboard after OAuth

### ❌ Failure Indicators:
- [ ] 400 error: "redirect_uri_mismatch"
- [ ] OAuth consent screen not published
- [ ] Privacy policy/terms URLs not accessible

## 🚨 TROUBLESHOOTING

### If OAuth Still Shows 400 Error:
1. **Double-check redirect URI** in Google Cloud Console
2. **Verify OAuth consent screen is published**
3. **Wait 5 more minutes** for propagation
4. **Check NEXTAUTH_URL** environment variable

### If Privacy Policy/Terms Not Found:
1. **Verify URLs** are exactly as shown above
2. **Check deployment** is complete
3. **Test URLs** directly in browser

## 🎯 FINAL CHECKLIST

### ✅ Google Cloud Console:
- [ ] OAuth 2.0 Client ID redirect URI updated
- [ ] OAuth 2.0 Client ID JavaScript origin updated
- [ ] OAuth consent screen app name set
- [ ] OAuth consent screen support email set
- [ ] OAuth consent screen privacy policy URL set
- [ ] OAuth consent screen terms of service URL set
- [ ] OAuth consent screen PUBLISHED

### ✅ Vercel Deployment:
- [ ] Latest code deployed
- [ ] Privacy policy page accessible
- [ ] Terms of service page accessible
- [ ] NEXTAUTH_URL environment variable set

### ✅ Testing:
- [ ] Google OAuth API returns 302 redirect
- [ ] Browser OAuth flow works end-to-end
- [ ] User can sign in and access dashboard

---

**Priority**: URGENT - Required for user sign-ups
**ETA**: 10 minutes to complete all steps
**Status**: Ready to execute
