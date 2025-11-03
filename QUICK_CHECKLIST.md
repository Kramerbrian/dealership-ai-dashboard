# Google OAuth Setup - Quick Checklist

## ✅ Application Side (DONE)

- [x] Production WorkOS credentials in `.env.local`
- [x] Vercel Production environment configured
- [x] Vercel Preview environment configured
- [x] Vercel Development environment configured
- [x] Dev server running with new credentials
- [x] SSO endpoint working correctly

## ⚠️ Manual Steps (DO THIS NOW)

### Google Cloud Console

- [ ] Open: https://console.cloud.google.com/apis/credentials
- [ ] Click your OAuth 2.0 Client ID
- [ ] Remove old Redirect URI (if exists with old Client ID):
  - Old: `...client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ`
- [ ] Add new Redirect URI:
  ```
  https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG
  ```
- [ ] Click "Save"
- [ ] Verify OAuth consent screen is published:
  - Go to: https://console.cloud.google.com/apis/consent
  - Status should be "In production"

### WorkOS Dashboard (Verify)

- [ ] Open: https://dashboard.workos.com/
- [ ] Go to: Authentication → OAuth providers → Google
- [ ] Verify Google Client ID and Secret are configured
- [ ] Ensure "Your app's credentials" is selected

## 🧪 After Completing Above

Test your integration:

```bash
# Option 1: Automated test
./scripts/test-google-oauth.sh

# Option 2: Visit test page
# http://localhost:3000/test/google-oauth

# Option 3: Direct test
# http://localhost:3000/api/auth/sso?provider=GoogleOAuth
```

---

**Current Status:** Application ready ✅ | Google Cloud Console needs update ⚠️

