# Google OAuth Setup Checklist for DealershipAI

## Step-by-Step Setup Guide

Follow these steps in order to complete your Google OAuth integration.

---

## ✅ Step 1: Get Redirect URI from WorkOS Dashboard

### Instructions:
1. **Open WorkOS Dashboard**
   - URL: https://dashboard.workos.com/
   - Sign in with your WorkOS account

2. **Navigate to OAuth Providers**
   - Click **Authentication** in the left sidebar
   - Click **OAuth providers** sub-tab
   - Find the **Google** section

3. **Get Redirect URI**
   - Click the **"Manage"** button
   - In the **Google OAuth** dialog, find **"Redirect URI"**
   - **Copy the entire Redirect URI** to your clipboard
   
   It will look like:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
   ```

### Verification:
- [ ] Redirect URI copied to clipboard
- [ ] Redirect URI contains `api.workos.com` and your `client_id`

**💡 Tip**: Keep this URI handy - you'll need it for Google Cloud Console

---

## ✅ Step 2: Configure Google Cloud Console

### 2a. Access Google Cloud Console

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select or Create Project**
   - Click the project dropdown in the top navigation
   - Select your project OR create a new one named "DealershipAI"

### 2b. Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - In left sidebar: **APIs & Services** → **OAuth consent screen**

2. **Configure Consent Screen**
   - **User Type**: Select **External** (for general public)
   - Click **Create**

3. **Fill in App Information**
   - **App name**: `DealershipAI`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - Click **Save and Continue**

4. **Add Scopes**
   - Add these scopes:
     - `openid`
     - `email`
     - `profile`
   - Click **Save and Continue**

5. **Test Users** (if app is in Testing mode)
   - Add test user email addresses if needed
   - Click **Save and Continue**

### 2c. Create OAuth 2.0 Client Credentials

1. **Navigate to Credentials**
   - In left sidebar: **APIs & Services** → **Credentials**

2. **Create OAuth Client ID**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"OAuth 2.0 Client ID"**

3. **Configure Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `DealershipAI WorkOS OAuth`
   - **Authorized redirect URIs**: 
     - Click **"+ ADD URI"**
     - **Paste the Redirect URI** you copied from WorkOS Dashboard
     - Click **Create**

4. **Copy Credentials**
   - You'll see a popup with:
     - **Your Client ID** (e.g., `1039185326912-...apps.googleusercontent.com`)
     - **Your Client Secret** (e.g., `GOCSPX-...`)
   - **⚠️ COPY BOTH VALUES IMMEDIATELY** - the secret won't be shown again!
   - Save them securely (password manager recommended)

### 2d. Publish OAuth App

**⚠️ CRITICAL**: Your app must be published for production use!

1. **Go to OAuth Consent Screen**
   - Navigate to: **APIs & Services** → **OAuth consent screen**
   - Click the **"Audience"** tab

2. **Check Publishing Status**
   - If status shows **"In production"** → ✅ You're done!
   - If status shows **"Testing"**:
     - Click **"Publish app"** button
     - Click **"Confirm"** in the dialog
     - Wait for publishing to complete (~1-2 minutes)

**Warning**: Users will get "Access Blocked" errors if your app is in Testing mode!

### Verification:
- [ ] OAuth consent screen configured
- [ ] OAuth client created (Web application type)
- [ ] Redirect URI added to authorized redirect URIs
- [ ] Client ID and Secret copied and saved securely
- [ ] OAuth app published (status: "In production")

---

## ✅ Step 3: Add Credentials to WorkOS Dashboard

1. **Return to WorkOS Dashboard**
   - URL: https://dashboard.workos.com/
   - Navigate to: **Authentication** → **OAuth providers** → **Google**

2. **Configure Google OAuth**
   - Click **"Manage"** button
   - Select **"Your app's credentials"** (NOT "Use default credentials")

3. **Add Credentials**
   - **Google Client ID**: Paste your Client ID from Google Cloud Console
   - **Google Client Secret**: Paste your Client Secret from Google Cloud Console
   - Click **"Save"**

### Verification:
- [ ] Credentials pasted correctly
- [ ] "Your app's credentials" selected (not default)
- [ ] "Save" clicked successfully
- [ ] No error messages displayed

---

## ✅ Step 4: Test the Flow

### Option 1: Direct URL Test

Open in your browser:
```
http://localhost:3000/api/auth/sso?provider=GoogleOAuth
```

Or in production:
```
https://dealershipai.com/api/auth/sso?provider=GoogleOAuth
```

**Expected Behavior**:
- Redirects to Google OAuth sign-in
- After sign-in, redirects back to `/auth/callback`
- User is logged in and redirected to dashboard

### Option 2: Use Test Page

Navigate to:
```
http://localhost:3000/test/google-oauth
```

This page provides:
- Multiple test methods
- Configuration checker
- Quick links to all necessary pages

### Option 3: Use React Component

```tsx
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

// In your component:
<GoogleSignInButton />
```

### Verification:
- [ ] Google OAuth sign-in page appears
- [ ] User can sign in with Google account
- [ ] User is redirected back to your app
- [ ] User session is created
- [ ] User is redirected to dashboard or specified location

---

## 🔍 Troubleshooting

### Issue: "Access Blocked" Error

**Cause**: OAuth app not published

**Fix**:
1. Go to Google Cloud Console → OAuth consent screen
2. Click "Publish app"
3. Wait for publishing to complete
4. Try again

### Issue: "Redirect URI Mismatch" Error

**Cause**: Redirect URI in Google doesn't match WorkOS

**Fix**:
1. Get exact Redirect URI from WorkOS Dashboard
2. Copy it exactly (including all parameters)
3. Add to Google Cloud Console → Credentials → Authorized redirect URIs
4. Ensure no trailing slashes or extra characters

### Issue: "Invalid Client" Error

**Cause**: Wrong credentials in WorkOS Dashboard

**Fix**:
1. Verify Client ID and Secret are correct
2. Ensure credentials are from the same Google Cloud project
3. Check that credentials are for "Web application" type
4. Re-copy and paste in WorkOS Dashboard

### Issue: Google Shows "workos.com" Instead of Your Domain

**Cause**: Using default WorkOS credentials or custom domain not configured

**Fix**:
- Configure your own credentials (Step 3 above)
- OR set up custom domain (see WORKOS_GOOGLE_OAUTH_SETUP.md)

---

## 📋 Quick Verification Checklist

Run through this checklist after setup:

- [ ] Redirect URI copied from WorkOS Dashboard
- [ ] Redirect URI added to Google Cloud Console
- [ ] OAuth consent screen published in Google
- [ ] Client ID and Secret copied from Google
- [ ] Credentials added to WorkOS Dashboard
- [ ] Test sign-in works end-to-end
- [ ] User profile data received correctly
- [ ] JIT provisioning creates user in database
- [ ] Session cookies set correctly

---

## 🚀 Quick Setup Script

You can also use the automated setup script:

```bash
./scripts/setup-google-oauth.sh
```

This script will guide you through each step interactively.

---

## 📚 Additional Resources

- **Full Setup Guide**: `WORKOS_GOOGLE_OAUTH_SETUP.md`
- **Quick Reference**: `GOOGLE_OAUTH_QUICK_REFERENCE.md`
- **WorkOS Docs**: https://workos.com/docs/authkit/oauth-providers/google
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## ✅ Success Indicators

When everything is set up correctly, you should see:

1. ✅ Google OAuth sign-in page shows your app name
2. ✅ No "Access Blocked" errors
3. ✅ Smooth redirect flow after authentication
4. ✅ User data populated in your database
5. ✅ User session active after sign-in

---

**Current Status**: Ready for configuration
**Estimated Time**: 10-15 minutes
**Difficulty**: Easy

