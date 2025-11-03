# Complete Google OAuth Setup - Steps 1-3

Follow these steps to complete your Google OAuth integration.

---

## 🔗 Your Configuration Details

**Redirect URI:**
```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

**Google Client ID:**
```
1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com
```

**WorkOS Client ID:**
```
client_01K93QEQNK49CEMSNQXAKMYZPZ
```

---

## ✅ Step 1: Add Redirect URI to Google Cloud Console

### Instructions:

1. **Open Google Cloud Console**
   - Direct link: https://console.cloud.google.com/apis/credentials
   - Sign in with your Google account

2. **Select Your Project**
   - If you see a project dropdown, make sure the correct project is selected
   - If you need to create a project:
     - Click "Select a project" → "New Project"
     - Name: `DealershipAI`
     - Click "Create"

3. **Navigate to Credentials**
   - You should already be at: **APIs & Services** → **Credentials**
   - If not, click **"APIs & Services"** in the left sidebar, then **"Credentials"**

4. **Create or Edit OAuth Client**
   
   **Option A: Create New OAuth Client**
   - Click **"+ CREATE CREDENTIALS"** button (top of page)
   - Select **"OAuth 2.0 Client ID"**
   - If prompted, configure OAuth consent screen first (see Step 2 below)
   
   **Option B: Edit Existing OAuth Client**
   - Find your OAuth 2.0 Client ID in the list
   - Click on it to edit

5. **Configure Client**
   - **Application type**: Must be **"Web application"**
   - **Name**: `DealershipAI WorkOS OAuth` (or any name you prefer)

6. **Add Redirect URI**
   - Scroll to **"Authorized redirect URIs"** section
   - Click **"+ ADD URI"** button
   - Paste this EXACT URI:
     ```
     https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
     ```
   - **Important**: Copy the entire URI including the query parameter
   - Make sure there are no extra spaces or characters

7. **Save**
   - Scroll down and click **"Save"** or **"Create"**

### Verification:
- [ ] Redirect URI added to "Authorized redirect URIs"
- [ ] URI matches exactly (check for typos)
- [ ] Application type is "Web application"

**💡 Tip**: Keep the browser tab open - you'll need your Client ID and Secret in Step 3!

---

## ✅ Step 2: Configure & Publish OAuth Consent Screen

### Instructions:

1. **Navigate to OAuth Consent Screen**
   - Direct link: https://console.cloud.google.com/apis/consent
   - OR: **APIs & Services** → **OAuth consent screen** (left sidebar)

2. **Configure Consent Screen** (if not already configured)

   **If you see "Configure Consent Screen":**
   
   a. **Choose User Type**
      - Select **"External"** (for general public access)
      - Click **"Create"**
   
   b. **App Information**
      - **App name**: `DealershipAI`
      - **User support email**: Your email address
      - **App logo**: (optional - can skip)
      - **App domain**: `dealershipai.com` (optional)
      - **Application home page**: `https://dealershipai.com` (optional)
      - **Privacy policy link**: (optional)
      - **Terms of service link**: (optional)
      - **Authorized domains**: (optional)
      - Click **"Save and Continue"**
   
   c. **Scopes**
      - Click **"Add or Remove Scopes"**
      - Ensure these scopes are selected:
        - `openid`
        - `email`
        - `profile`
      - Click **"Update"** then **"Save and Continue"**
   
   d. **Test Users** (if app is in Testing mode)
      - Add test user email addresses if needed
      - Click **"Save and Continue"**
   
   e. **Summary**
      - Review your configuration
      - Click **"Back to Dashboard"**

3. **Publish the App** (CRITICAL!)

   a. **Check Publishing Status**
      - Look at the top of the OAuth consent screen page
      - Find the **"Publishing status"** section
   
   b. **If Status Shows "Testing":**
      - Click the **"PUBLISH APP"** button (top right, yellow/orange button)
      - In the confirmation dialog, click **"Confirm"**
      - Wait for the status to change to **"In production"** (~30 seconds)
   
   c. **If Status Shows "In production":**
      - ✅ You're already published! Skip to Step 3.

### Verification:
- [ ] OAuth consent screen configured
- [ ] Status shows **"In production"** (NOT "Testing")
- [ ] Required scopes added: `openid`, `email`, `profile`

**⚠️ CRITICAL**: App MUST be "In production" for users to sign in!

---

## ✅ Step 3: Add Credentials to WorkOS Dashboard

### Instructions:

1. **Get Your Google Credentials**
   
   **From Google Cloud Console** (should still be open from Step 1):
   
   - Go back to: https://console.cloud.google.com/apis/credentials
   - Click on your OAuth 2.0 Client ID
   - You should see:
     - **Your Client ID**: `1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com`
     - **Your Client Secret**: Click **"Show"** to reveal it (starts with `GOCSPX-...`)
   - **Copy both values** to your clipboard or a secure note

2. **Open WorkOS Dashboard**
   - Direct link: https://dashboard.workos.com/
   - Sign in with your WorkOS account

3. **Navigate to Google OAuth Settings**
   - In the left sidebar, click **"Authentication"**
   - Click the **"OAuth providers"** sub-tab
   - Find the **"Google"** section
   - Click the **"Manage"** button

4. **Configure Google OAuth**
   
   a. **Select Credentials Type**
      - You'll see options: "Use default credentials" and "Your app's credentials"
      - **Select "Your app's credentials"** (NOT default!)
   
   b. **Add Your Credentials**
      - **Google Client ID**: 
        - Paste: `1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com`
        - Or paste your Client ID from Google Cloud Console
      
      - **Google Client Secret**: 
        - Paste your Client Secret from Google Cloud Console
        - It starts with `GOCSPX-` followed by a long string
   
   c. **Save**
      - Click the **"Save"** button
      - Wait for confirmation message

### Verification:
- [ ] "Your app's credentials" selected (not default)
- [ ] Client ID pasted correctly
- [ ] Client Secret pasted correctly
- [ ] "Save" button clicked
- [ ] No error messages displayed

**💡 Tip**: If you get an error, double-check:
- Client ID and Secret match what's in Google Cloud Console
- Credentials are from the same Google Cloud project
- OAuth client is "Web application" type

---

## ✅ Step 4: Test the Integration

### Test Method 1: Direct URL

Open in your browser:
```
http://localhost:3000/api/auth/sso?provider=GoogleOAuth
```

**Expected Flow:**
1. Redirects to Google sign-in page
2. After sign-in, redirects back to your app
3. User is logged in and redirected to dashboard

### Test Method 2: Test Page

Navigate to:
```
http://localhost:3000/test/google-oauth
```

Use the interactive test interface with multiple test methods.

### Test Method 3: React Component

```tsx
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

// In your component:
<GoogleSignInButton />
```

---

## 🔍 Verify Everything is Working

Run this verification script:

```bash
./scripts/verify-google-oauth-setup.sh
```

Or check manually:

- [ ] No "Redirect URI mismatch" errors
- [ ] No "Access Blocked" errors
- [ ] Google sign-in page appears
- [ ] User can successfully sign in
- [ ] User is redirected back to your app
- [ ] Session is created
- [ ] User data is populated

---

## ⚠️ Troubleshooting

### Error: "Redirect URI Mismatch"

**Cause**: URI in Google doesn't match WorkOS exactly

**Fix**:
1. Copy the exact Redirect URI from WorkOS Dashboard
2. Make sure it's added exactly (including query parameter) in Google Cloud Console
3. No trailing slashes, no extra spaces

### Error: "Access Blocked: This app is in testing mode"

**Cause**: OAuth app not published in Google Cloud Console

**Fix**:
1. Go to: https://console.cloud.google.com/apis/consent
2. Click "PUBLISH APP"
3. Wait for status to change to "In production"
4. Try again

### Error: "Invalid Client"

**Cause**: Wrong credentials in WorkOS Dashboard

**Fix**:
1. Verify Client ID and Secret in Google Cloud Console
2. Copy them exactly to WorkOS Dashboard
3. Make sure "Your app's credentials" is selected (not default)

---

## 📋 Quick Checklist Summary

- [ ] **Step 1**: Redirect URI added to Google Cloud Console
- [ ] **Step 2**: OAuth consent screen published (status: "In production")
- [ ] **Step 3**: Credentials added to WorkOS Dashboard
- [ ] **Step 4**: Test flow works end-to-end

---

## 🎯 Success Indicators

When everything is configured correctly:

✅ Google sign-in page shows your app name (not "workos.com")  
✅ No "Access Blocked" errors  
✅ Smooth redirect after authentication  
✅ User profile data received  
✅ User session created  
✅ Redirect to dashboard works

---

**Estimated Time**: 10-15 minutes  
**Status**: Ready to complete! 🚀

