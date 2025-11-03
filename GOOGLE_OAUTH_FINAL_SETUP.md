# Google OAuth Final Setup - Production

## ✅ Current Status

**WorkOS Production Credentials:**
- Client ID: `client_01K93QER29GBSGXH7TZR5M9WRG`
- API Key: `sk_a2V5XzAxSzk0RFg0MjgwM0ZNUVY0RVZUWjZHUFhLLGExM1NaaU5lbHBObTdhWUxBYjNXMnJkRVk`

**Configuration:**
- ✅ Local environment (`.env.local`) - Updated
- ✅ Vercel Production - Updated
- ✅ Vercel Preview - Updated
- ✅ Vercel Development - Updated
- ✅ Dev server - Running with new credentials

---

## 🔗 Redirect URI to Add to Google Cloud Console

**Copy this EXACT URI:**

```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
```

---

## 📋 Step-by-Step: Update Google Cloud Console

### 1. Open Google Cloud Console

**Direct Link:** https://console.cloud.google.com/apis/credentials

### 2. Select Your OAuth Client

- Find your OAuth 2.0 Client ID in the list
- Click on it to edit

### 3. Update Authorized Redirect URIs

**Option A: If you have the old URI**
1. Find the old URI: `...client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ`
2. Click the ✕ to remove it
3. Click **"+ ADD URI"**
4. Paste the new URI:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
   ```
5. Click **"Save"**

**Option B: If adding for the first time**
1. Scroll to **"Authorized redirect URIs"** section
2. Click **"+ ADD URI"**
3. Paste:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
   ```
4. Click **"Save"**

### 4. Verify OAuth Consent Screen

**Go to:** https://console.cloud.google.com/apis/consent

- Check the **"Audience"** tab
- Status should be **"In production"**
- If it shows **"Testing"**, click **"PUBLISH APP"**

---

## ✅ Verification Checklist

After updating Google Cloud Console:

- [ ] New Redirect URI added (with `client_01K93QER29GBSGXH7TZR5M9WRG`)
- [ ] Old Redirect URI removed (if existed with old Client ID)
- [ ] OAuth consent screen published
- [ ] WorkOS Dashboard has Google credentials configured

---

## 🧪 Test Your Setup

### Test Method 1: Interactive Test Page

Open: **http://localhost:3000/test/google-oauth**

Features:
- Multiple test methods
- Configuration checker
- Quick links to setup pages

### Test Method 2: Direct SSO Test

Open: **http://localhost:3000/api/auth/sso?provider=GoogleOAuth**

Expected flow:
1. Redirects to WorkOS authorization URL
2. Then to Google sign-in page
3. After sign-in, back to `/auth/callback`
4. User logged in and redirected to dashboard

### Test Method 3: Automated Script

```bash
./scripts/test-google-oauth.sh
```

---

## 🔍 Troubleshooting

### Error: "Redirect URI mismatch"

**Fix:**
1. Double-check the URI matches exactly (including query parameter)
2. Ensure no trailing slashes or extra spaces
3. Verify Client ID in URI matches your WorkOS Client ID

### Error: "Access Blocked: This app is in testing mode"

**Fix:**
1. Go to: https://console.cloud.google.com/apis/consent
2. Click **"PUBLISH APP"**
3. Wait for status to change to "In production"
4. Try again

### Error: "Invalid Client"

**Fix:**
1. Verify Google Client ID in WorkOS Dashboard matches Google Cloud Console
2. Verify Google Client Secret is correct
3. Ensure "Your app's credentials" is selected (not default)

---

## 📊 Configuration Summary

| Location | Status | Client ID |
|----------|--------|-----------|
| `.env.local` | ✅ Updated | `client_01K93QER29GBSGXH7TZR5M9WRG` |
| Vercel Production | ✅ Updated | `client_01K93QER29GBSGXH7TZR5M9WRG` |
| Vercel Preview | ✅ Updated | `client_01K93QER29GBSGXH7TZR5M9WRG` |
| Vercel Development | ✅ Updated | `client_01K93QER29GBSGXH7TZR5M9WRG` |
| Google Cloud Console | ⚠️ Needs Update | Add Redirect URI |
| WorkOS Dashboard | ⚠️ Verify | Google OAuth credentials |

---

## 🎯 Quick Commands

**Get Redirect URI:**
```bash
./scripts/get-workos-redirect-uri.sh
```

**Test Integration:**
```bash
./scripts/test-google-oauth.sh
```

**Verify Setup:**
```bash
./scripts/verify-google-oauth-setup.sh
```

---

## 🚀 Once Complete

After updating Google Cloud Console:

1. ✅ Test OAuth flow works
2. ✅ Verify user authentication succeeds
3. ✅ Check user provisioning in database
4. ✅ Confirm session cookies are set

**You're all set for production!** 🎉

