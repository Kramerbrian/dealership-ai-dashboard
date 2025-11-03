# Google OAuth Redirect URI for DealershipAI

## Your Redirect URI

Based on your WorkOS Client ID, your Redirect URI is:

```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

---

## How to Add This to Google Cloud Console

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project

### Step 2: Navigate to Credentials
1. In the left sidebar: **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (or create a new one)

### Step 3: Add Redirect URI
1. Click on your OAuth 2.0 Client ID
2. Scroll down to **"Authorized redirect URIs"**
3. Click **"+ ADD URI"**
4. Paste this EXACT URI:
   ```
   https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
   ```
5. Click **"Save"**

### Step 4: Verify
- Make sure the URI is added correctly
- No trailing slashes
- No extra spaces
- Includes the full query parameter (`?client_id=...`)

---

## Verification

After adding the Redirect URI, verify:

- [ ] URI added to "Authorized redirect URIs"
- [ ] URI matches exactly (including query parameter)
- [ ] OAuth consent screen is published
- [ ] OAuth client is "Web application" type

---

## Quick Script

Run this to see your Redirect URI:

```bash
./scripts/get-workos-redirect-uri.sh
```

---

## Important Notes

1. **Exact Match Required**: The Redirect URI must match EXACTLY between WorkOS and Google
2. **Query Parameter Included**: The `?client_id=...` part must be included
3. **HTTPS Only**: Must use `https://` not `http://`
4. **No Trailing Slash**: Don't add a trailing `/` at the end

---

## Next Steps

After adding the Redirect URI to Google Cloud Console:

1. Get your Google Client ID and Secret from Google Cloud Console
2. Add them to WorkOS Dashboard:
   - WorkOS Dashboard → Authentication → OAuth providers → Google → Manage
   - Select "Your app's credentials"
   - Paste Client ID and Secret
   - Click Save
3. Test the flow:
   - Visit: `/api/auth/sso?provider=GoogleOAuth`
   - Or use: `/test/google-oauth` page

