# 🔧 Update Google Cloud Console with New URLs

## 🎉 PRIVACY POLICY & TERMS OF SERVICE CREATED!

### ✅ NEW PAGES AVAILABLE:
- **Privacy Policy**: https://dealershipai.com/privacy
- **Terms of Service**: https://dealershipai.com/terms

## 🚀 UPDATE GOOGLE CLOUD CONSOLE

### Step 1: Update OAuth 2.0 Client ID
**Go to**: https://console.cloud.google.com/apis/credentials

1. **Click on your OAuth 2.0 Client ID**
2. **Update "Authorized redirect URIs"**:
   ```
   https://dealershipai.com/api/auth/callback/google
   ```
3. **Update "Authorized JavaScript origins"**:
   ```
   https://dealershipai.com
   ```
4. **Click "Save"**

### Step 2: Update OAuth Consent Screen
**Go to**: https://console.cloud.google.com/apis/credentials/consent

1. **Click "Edit App"**
2. **Update required fields**:
   - **App name**: DealershipAI
   - **User support email**: your-email@example.com
   - **Developer contact information**: your-email@example.com
   - **Privacy policy URL**: `https://dealershipai.com/privacy`
   - **Terms of service URL**: `https://dealershipai.com/terms`
3. **Click "Save and Continue"**
4. **Click "Publish App"** (if not already published)

## 🧪 TEST OAUTH AFTER UPDATES

### Wait 2-3 minutes for changes to propagate, then test:

```bash
# Test Google OAuth
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai.com/api/auth/signin/google"
```

### Expected Result:
- **Status**: 302
- **Redirect**: `https://accounts.google.com/oauth/authorize?client_id=...` ✅

## 📋 COMPLETE CHECKLIST

### ✅ OAuth 2.0 Client ID:
- [ ] Authorized redirect URI updated
- [ ] Authorized JavaScript origin updated
- [ ] Changes saved

### ✅ OAuth Consent Screen:
- [ ] App name set to "DealershipAI"
- [ ] User support email added
- [ ] Developer contact information added
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] App published (status: "In production")

### ✅ Vercel Environment Variables:
- [ ] NEXTAUTH_URL updated to latest deployment
- [ ] GOOGLE_CLIENT_ID set
- [ ] GOOGLE_CLIENT_SECRET set
- [ ] NEXTAUTH_SECRET set

## 🎯 SUCCESS CRITERIA

### ✅ Google OAuth Working:
- Redirects to Google OAuth consent screen
- NOT redirecting to error page
- OAuth flow completes successfully

### ✅ Browser Test Working:
1. Go to: https://dealershipai.com/auth/signin
2. Click "Continue with Google"
3. Redirects to Google OAuth consent screen
4. Complete OAuth flow
5. Redirects to dashboard

## 📊 CURRENT STATUS

### ✅ COMPLETED:
- Privacy policy page created
- Terms of service page created
- Pages deployed and accessible
- NEXTAUTH_URL updated

### 🔧 IN PROGRESS:
- Google Cloud Console OAuth settings update
- OAuth consent screen publishing

### 🎯 NEXT STEPS:
1. Update Google Cloud Console OAuth settings
2. Update OAuth consent screen with new URLs
3. Publish OAuth consent screen
4. Test OAuth flow

## 🚨 IMPORTANT NOTES

### Latest Deployment URL:
```
https://dealershipai.com
```

### Required OAuth Settings:
- **Redirect URI**: `https://dealershipai.com/api/auth/callback/google`
- **JavaScript Origin**: `https://dealershipai.com`
- **Privacy Policy**: `https://dealershipai.com/privacy`
- **Terms of Service**: `https://dealershipai.com/terms`

---

**Priority**: HIGH - Required for OAuth to work
**ETA**: 5 minutes to complete all updates
**Status**: Ready to execute
