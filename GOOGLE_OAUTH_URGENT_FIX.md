# 🚨 URGENT: Google OAuth Redirect URI Mismatch

## 🔍 ISSUE IDENTIFIED

The Google OAuth error is clear:
**"redirect_uri_mismatch"**

**Current Google Cloud Console redirect URI**: `https://www.dealershipai.com/api/auth/callback/google`
**Actual deployment URL**: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app`

## ✅ IMMEDIATE FIX REQUIRED

### Step 1: Update Google Cloud Console (2 minutes)

**Go to**: https://console.cloud.google.com/apis/credentials

1. **Click on your OAuth 2.0 Client ID**
2. **Scroll down to "Authorized redirect URIs"**
3. **REMOVE**: `https://www.dealershipai.com/api/auth/callback/google`
4. **ADD**: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/callback/google`
5. **Scroll down to "Authorized JavaScript origins"**
6. **REMOVE**: `https://www.dealershipai.com`
7. **ADD**: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app`
8. **Click "Save"**

### Step 2: Update NEXTAUTH_URL (1 minute)

```bash
# Remove old NEXTAUTH_URL
vercel env rm NEXTAUTH_URL production

# Add correct NEXTAUTH_URL
echo "https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app" | vercel env add NEXTAUTH_URL production
```

### Step 3: Test OAuth (1 minute)

```bash
# Test Google OAuth
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/signin/google"
```

## 🎯 EXPECTED RESULTS

### Before Fix:
- Status: 302
- Redirect: `/auth/signin?error=google` ❌

### After Fix:
- Status: 302
- Redirect: `https://accounts.google.com/oauth/authorize?client_id=...` ✅

## 📋 CURRENT DEPLOYMENT INFO

**Latest Deployment**: https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app

**Required Redirect URI**: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/callback/google`

**Required JavaScript Origin**: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app`

## 🚨 CRITICAL ISSUES TO FIX

1. **Google Cloud Console redirect URI is wrong**
   - Current: `https://www.dealershipai.com/api/auth/callback/google`
   - Should be: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/callback/google`

2. **NEXTAUTH_URL environment variable is wrong**
   - Current: `https://www.dealershipai.com`
   - Should be: `https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app`

## 🧪 TEST COMMANDS

### Test OAuth Providers
```bash
curl -s "https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/providers" | jq .
```

### Test Google OAuth
```bash
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/signin/google"
```

### Test Facebook OAuth
```bash
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-99qpfoapm-brian-kramers-projects.vercel.app/api/auth/signin/facebook"
```

## 🎯 SUCCESS CRITERIA

### ✅ Google OAuth Working
- Redirects to Google OAuth consent screen
- NOT redirecting to error page

### ✅ Facebook OAuth Working
- Redirects to Facebook OAuth consent screen
- NOT redirecting to error page

## 📞 SUPPORT

**Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred

**Vercel Environment Variables**: https://vercel.com/docs/environment-variables

---

**Priority**: 🚨 CRITICAL - OAuth not working
**ETA**: 5 minutes to fix
**Status**: Ready to execute
