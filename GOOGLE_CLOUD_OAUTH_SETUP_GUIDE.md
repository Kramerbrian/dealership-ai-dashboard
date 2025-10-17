# 🔧 Google Cloud Console OAuth Setup Guide

## 🎯 CURRENT STATUS:
- ✅ Google Cloud SDK installed
- 🔧 OAuth configuration needed
- ❌ Google OAuth: 400 error (redirect_uri_mismatch)

## 📋 METHOD 1: GOOGLE CLOUD CLI (Recommended)

### Step 1: Authenticate with Google Cloud
```bash
# Add gcloud to PATH
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Authenticate
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Run OAuth Setup Script
```bash
./setup-google-cloud-oauth.sh
```

### Step 3: Configure OAuth Client (if needed)
```bash
# List existing OAuth clients
gcloud auth application-default print-access-token

# Create new OAuth client (if needed)
gcloud auth application-default print-access-token
```

## 📋 METHOD 2: MANUAL CONFIGURATION (Fallback)

### Step 1: Go to Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials

### Step 2: Update OAuth 2.0 Client ID
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

### Step 3: Update OAuth Consent Screen
**Go to**: https://console.cloud.google.com/apis/credentials/consent

1. **Click "Edit App"**
2. **Update these fields**:
   - **App name**: `DealershipAI`
   - **User support email**: `kainomura@dealershipai.com`
   - **Developer contact information**: `kainomura@dealershipai.com`
   - **Privacy policy URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy`
   - **Terms of service URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms`
3. **Click "Save and Continue"**
4. **Click "Publish App"** (CRITICAL!)

## 📋 METHOD 3: API-BASED CONFIGURATION

### Step 1: Enable Required APIs
```bash
# Enable Google Cloud Console API
gcloud services enable console.googleapis.com

# Enable OAuth2 API
gcloud services enable oauth2.googleapis.com
```

### Step 2: Create Service Account (if needed)
```bash
# Create service account
gcloud iam service-accounts create dealershipai-oauth \
    --display-name="DealershipAI OAuth Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:dealershipai-oauth@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountTokenCreator"
```

### Step 3: Configure OAuth Client via API
```bash
# Get access token
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

# Update OAuth client (replace CLIENT_ID with your actual client ID)
curl -X PUT \
  "https://console.googleapis.com/v1/projects/YOUR_PROJECT_ID/oauthClients/CLIENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "DealershipAI OAuth Client",
    "redirectUris": [
      "https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/callback/google"
    ],
    "javascriptOrigins": [
      "https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app"
    ]
  }'
```

## 🧪 TESTING OAUTH CONFIGURATION

### Step 1: Wait for Propagation
**Wait 2-3 minutes** for Google's changes to propagate globally.

### Step 2: Test OAuth API
```bash
./test-oauth-complete.sh
```

### Step 3: Test Browser Flow
1. **Go to**: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/auth/signin
2. **Click**: "Continue with Google"
3. **Expected**: Redirects to Google OAuth consent screen
4. **Complete**: OAuth flow and verify redirect to dashboard

## 📊 VERIFICATION CHECKLIST

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

### ✅ Testing:
- [ ] Google OAuth returns 302 redirect
- [ ] Redirects to Google OAuth consent screen
- [ ] Shows "DealershipAI" app name
- [ ] User can complete sign-in flow
- [ ] Redirects to dashboard after OAuth

## 🚨 TROUBLESHOOTING

### If OAuth Still Shows 400 Error:
1. **Double-check the exact URL** in Google Cloud Console
2. **Make sure OAuth consent screen is published**
3. **Wait 5 more minutes** for propagation
4. **Check for typos** in the redirect URI

### If CLI Authentication Fails:
1. **Use manual configuration** (Method 2)
2. **Check project permissions**
3. **Verify billing is enabled**
4. **Try different authentication method**

### If API Configuration Fails:
1. **Check service account permissions**
2. **Verify API is enabled**
3. **Check access token validity**
4. **Use manual configuration as fallback**

## 🎯 SUCCESS CRITERIA

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
**ETA**: 10 minutes to complete OAuth configuration
**Status**: Ready to execute
