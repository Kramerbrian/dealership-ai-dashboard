# 🚀 Quick Setup Summary - Google OAuth

## Your Redirect URI (Copy This!)

```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

---

## ⚡ 3-Step Quick Setup

### 1️⃣ Add Redirect URI to Google Cloud Console

**Go to**: https://console.cloud.google.com/apis/credentials

1. Click on your OAuth 2.0 Client ID (or create one)
2. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
3. Paste this EXACT URI:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
   ```
4. Click **"Save"**

**⚠️ Important**: Copy the URI exactly, including the query parameter!

---

### 2️⃣ Publish OAuth App

**Go to**: https://console.cloud.google.com/apis/consent

1. Check the **"Audience"** tab
2. If status shows **"Testing"**:
   - Click **"Publish app"**
   - Click **"Confirm"**
3. Wait for publishing to complete (~1 minute)

**⚠️ Critical**: Users will get "Access Blocked" if app is in Testing mode!

---

### 3️⃣ Add Credentials to WorkOS

**Go to**: https://dashboard.workos.com/

1. Navigate to: **Authentication** → **OAuth providers** → **Google**
2. Click **"Manage"**
3. Select **"Your app's credentials"** (NOT default)
4. Paste:
   - **Client ID**: `1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com`
   - **Client Secret**: (from Google Cloud Console)
5. Click **"Save"**

---

## ✅ Test It!

### Option 1: Direct Test
Open in browser:
```
http://localhost:3000/api/auth/sso?provider=GoogleOAuth
```

### Option 2: Test Page
```
http://localhost:3000/test/google-oauth
```

### Option 3: Use Component
```tsx
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

<GoogleSignInButton />
```

---

## 🔍 Verify Setup

Run verification script:
```bash
./scripts/verify-google-oauth-setup.sh
```

---

## 📚 Full Documentation

- **Setup Checklist**: `GOOGLE_OAUTH_SETUP_CHECKLIST.md`
- **Redirect URI Guide**: `GOOGLE_OAUTH_REDIRECT_URI.md`
- **Full Setup Guide**: `WORKOS_GOOGLE_OAUTH_SETUP.md`
- **Quick Reference**: `GOOGLE_OAUTH_QUICK_REFERENCE.md`

---

## ⚠️ Common Issues

### "Redirect URI Mismatch"
- **Fix**: Make sure URI in Google matches exactly (including query parameter)

### "Access Blocked"
- **Fix**: Publish your OAuth app in Google Cloud Console

### "Invalid Client"
- **Fix**: Verify Client ID and Secret are correct in WorkOS Dashboard

---

**🎯 Estimated Time**: 5-10 minutes  
**✅ Once complete**: Google OAuth will work for all users!

