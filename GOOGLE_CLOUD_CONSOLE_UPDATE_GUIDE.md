# 🔧 GOOGLE CLOUD CONSOLE UPDATE GUIDE

## 🎯 CURRENT STATUS:
- ✅ Privacy Policy: Working
- ✅ Terms of Service: Working  
- ✅ OAuth Providers API: Working
- ❌ Google OAuth: 400 Error (redirect_uri_mismatch)

## 🚨 IMMEDIATE ACTION REQUIRED:

### Step 1: Update OAuth 2.0 Client ID
**Go to**: https://console.cloud.google.com/apis/credentials

1. **Click on your OAuth 2.0 Client ID** (should show your app name)
2. **In "Authorized redirect URIs" section**:
   - **Remove any old URLs** with different deployment IDs
   - **Add this exact URL**:
     ```
     https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/callback/google
     ```
3. **In "Authorized JavaScript origins" section**:
   - **Remove any old URLs** with different deployment IDs
   - **Add this exact URL**:
     ```
     https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app
     ```
4. **Click "Save"**

### Step 2: Update OAuth Consent Screen
**Go to**: https://console.cloud.google.com/apis/credentials/consent

1. **Click "Edit App"**
2. **Fill in these exact values**:
   - **App name**: `DealershipAI`
   - **User support email**: `kainomura@dealershipai.com`
   - **Developer contact information**: `kainomura@dealershipai.com`
   - **Privacy policy URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy`
   - **Terms of service URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms`
3. **Click "Save and Continue"**
4. **Click "Publish App"** (CRITICAL - must be published!)

### Step 3: Wait for Propagation
**Wait 2-3 minutes** for Google's changes to propagate globally.

### Step 4: Test OAuth
```bash
./test-oauth-complete.sh
```

## 📋 EXACT URLS TO USE:

### OAuth 2.0 Client ID:
```
Authorized redirect URIs:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/callback/google

Authorized JavaScript origins:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app
```

### OAuth Consent Screen:
```
App name: DealershipAI
User support email: kainomura@dealershipai.com
Developer contact information: kainomura@dealershipai.com
Privacy policy URL: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy
Terms of service URL: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms
```

## 🧪 VERIFICATION STEPS:

### 1. Test OAuth API
```bash
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/signin/google"
```

**Expected Result**:
- **Status**: 302
- **Redirect**: `https://accounts.google.com/oauth/authorize?client_id=...`

### 2. Test Browser Flow
1. **Go to**: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/auth/signin
2. **Click**: "Continue with Google"
3. **Expected**: Redirects to Google OAuth consent screen
4. **Complete**: OAuth flow and verify redirect to dashboard

## 🚨 TROUBLESHOOTING:

### If Still Getting 400 Error:
1. **Double-check the exact URL** in Google Cloud Console
2. **Make sure OAuth consent screen is published**
3. **Wait 5 more minutes** for propagation
4. **Check for typos** in the redirect URI

### If OAuth Consent Screen Not Published:
1. **Go to OAuth consent screen**
2. **Click "Publish App"**
3. **Confirm publication**
4. **Wait 2-3 minutes**

## 🎯 SUCCESS CRITERIA:

### ✅ OAuth Working:
- [ ] Google OAuth returns 302 redirect
- [ ] Redirects to Google OAuth consent screen
- [ ] Shows "DealershipAI" app name
- [ ] User can complete sign-in flow
- [ ] Redirects to dashboard after OAuth

### ✅ All Pages Working:
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Sign-in page loads
- [ ] Dashboard accessible after OAuth

---

**Priority**: URGENT - Required for user sign-ups
**ETA**: 5 minutes to complete Google Cloud Console updates
**Status**: Ready to execute
