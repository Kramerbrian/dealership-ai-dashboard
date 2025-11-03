# WorkOS Redirect URI - Production Configuration

## Updated Redirect URI

With your new production WorkOS Client ID, your Redirect URI is:

```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
```

---

## ⚠️ IMPORTANT: Update Google Cloud Console

If you've already configured Google OAuth with the old Client ID, you need to update the Redirect URI.

### Old Redirect URI (Test/Staging):
```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

### New Redirect URI (Production):
```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
```

---

## Steps to Update

### 1. Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs":
   - **Option A**: Update the existing URI to the new one
   - **Option B**: Add the new URI (keep old one for now, then remove after testing)
4. **Paste the new URI**:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
   ```
5. Click "Save"

### 2. WorkOS Dashboard

1. Go to: https://dashboard.workos.com/
2. Navigate to: Authentication → OAuth providers → Google
3. Click "Manage"
4. Verify your Google Client ID and Secret are still configured
5. The Client ID in WorkOS Dashboard should match your Google OAuth Client ID (not the WorkOS Client ID)

---

## Verification

After updating, test the OAuth flow:

```bash
./scripts/test-google-oauth.sh
```

Or visit:
- Test page: `http://localhost:3000/test/google-oauth`
- Direct test: `http://localhost:3000/api/auth/sso?provider=GoogleOAuth`

---

## Quick Reference

**WorkOS Client ID**: `client_01K93QER29GBSGXH7TZR5M9WRG`  
**Redirect URI**: `https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG`

**Note**: This is the WorkOS Client ID. Your Google OAuth Client ID is different and should be configured in WorkOS Dashboard.

