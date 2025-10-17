# 🔧 OAuth 400 Error - Troubleshooting Guide

## 🚨 **STATUS: Still Getting 400 Error**

**Current Issue**: OAuth 400 error persists after updating Google Cloud Console redirect URIs

---

## 🔍 **POSSIBLE CAUSES**

### **1. Google OAuth Propagation Delay**
- **Issue**: Changes can take 5-15 minutes to propagate
- **Solution**: Wait longer or try different approach

### **2. OAuth App Configuration Issues**
- **Issue**: OAuth consent screen not published
- **Issue**: OAuth app not properly configured
- **Issue**: Missing required scopes

### **3. Environment Variable Issues**
- **Issue**: Google OAuth credentials not properly set in Vercel
- **Issue**: NEXTAUTH_URL mismatch

### **4. NextAuth Configuration Issues**
- **Issue**: NextAuth configuration problems
- **Issue**: Provider configuration errors

---

## 🧪 **DIAGNOSTIC TESTS**

### **Test 1: Check OAuth Providers API**
```bash
curl "https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/providers"
```
**Expected**: Should return all providers without errors

### **Test 2: Check Google OAuth Sign-in**
```bash
curl -I "https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/signin/google"
```
**Current**: `HTTP/2 400` (should be `HTTP/2 302`)

### **Test 3: Check OAuth Error Details**
```bash
curl "https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/signin/google"
```
**Expected**: Should show detailed error message

---

## 🔧 **TROUBLESHOOTING STEPS**

### **Step 1: Verify Google OAuth Configuration**

#### **Check OAuth Consent Screen**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. **Verify**: OAuth consent screen is published
3. **Check**: User type is set correctly
4. **Verify**: Scopes are properly configured

#### **Check OAuth Client Configuration**
1. Go to: https://console.cloud.google.com/apis/credentials
2. **Verify**: OAuth 2.0 Client ID is active
3. **Check**: Authorized redirect URIs include:
   ```
   https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/callback/google
   ```
4. **Check**: Authorized JavaScript origins include:
   ```
   https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app
   ```

### **Step 2: Check Vercel Environment Variables**

#### **Verify Environment Variables in Vercel**
1. Go to: https://vercel.com/dashboard
2. Select project: `dealershipai-dashboard`
3. Go to: **Settings** → **Environment Variables**
4. **Verify**: `GOOGLE_CLIENT_ID` is set
5. **Verify**: `GOOGLE_CLIENT_SECRET` is set
6. **Verify**: `NEXTAUTH_URL` is set to production URL

### **Step 3: Check NextAuth Configuration**

#### **Verify NextAuth Configuration**
- **File**: `lib/auth.ts`
- **Check**: Google provider configuration
- **Verify**: Callback URLs are correct

### **Step 4: Test with Different Approach**

#### **Option 1: Use GitHub OAuth (Alternative)**
```bash
curl -I "https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/signin/github"
```
**Expected**: Should work if GitHub OAuth is configured

#### **Option 2: Test Local Development**
```bash
# Test locally
curl -I "http://localhost:3000/api/auth/signin/google"
```
**Expected**: Should work if local OAuth is configured

---

## 🚨 **IMMEDIATE ACTIONS**

### **Action 1: Double-Check Google OAuth Settings**
1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Verify**: OAuth 2.0 Client ID is correct
3. **Check**: Redirect URIs are exactly:
   ```
   https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app/api/auth/callback/google
   ```
4. **Check**: JavaScript origins are exactly:
   ```
   https://dealershipai-dashboard-73b37yycr-brian-kramers-projects.vercel.app
   ```

### **Action 2: Check OAuth Consent Screen**
1. **Go to**: https://console.cloud.google.com/apis/credentials/consent
2. **Verify**: OAuth consent screen is published
3. **Check**: User type is set to "External" or "Internal" as needed

### **Action 3: Verify Vercel Environment Variables**
1. **Go to**: https://vercel.com/dashboard
2. **Check**: All required environment variables are set
3. **Verify**: No typos in variable names or values

---

## 🎯 **EXPECTED RESULTS AFTER FIX**

### **Successful OAuth Flow**
```
✅ HTTP/2 302 (redirect to Google)
✅ User redirected to Google login
✅ User can sign in successfully
✅ User redirected back to dashboard
✅ Full authentication flow working
```

### **Current Status**
```
❌ HTTP/2 400 (malformed request)
❌ OAuth flow fails immediately
❌ Users cannot sign in
❌ Authentication blocked
```

---

## 🚀 **NEXT STEPS**

### **If Still Getting 400 Error**
1. **Wait 15-30 minutes** for Google changes to propagate
2. **Double-check** all OAuth settings in Google Cloud Console
3. **Verify** Vercel environment variables
4. **Test** with GitHub OAuth as alternative
5. **Check** OAuth consent screen status

### **Alternative Solutions**
1. **Use GitHub OAuth** instead of Google
2. **Set up custom domain** for consistent URLs
3. **Create new OAuth app** with correct settings
4. **Use local development** for testing

---

## 📞 **SUPPORT**

If the issue persists after following all steps:
1. **Check Google OAuth documentation**
2. **Verify NextAuth.js configuration**
3. **Test with minimal OAuth setup**
4. **Consider using alternative OAuth provider**

**The 400 error indicates a configuration mismatch that needs to be resolved in the Google Cloud Console or Vercel environment variables.**
