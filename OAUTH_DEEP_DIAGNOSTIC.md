# 🔍 OAuth Deep Diagnostic

## 🚨 CURRENT STATUS
Both Google and GitHub OAuth are still returning `error=google` and `error=github` respectively.

## 🔧 TROUBLESHOOTING STEPS

### Step 1: Verify Google Cloud Console Settings

**Go to**: https://console.cloud.google.com/apis/credentials

**Check these EXACT settings**:

#### OAuth 2.0 Client ID Configuration:
1. **Authorized redirect URIs** - Should include:
   ```
   https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/google
   ```

2. **Authorized JavaScript origins** - Should include:
   ```
   https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app
   ```

### Step 2: Check OAuth Consent Screen
1. **Go to**: https://console.cloud.google.com/apis/credentials/consent
2. **Verify**: OAuth consent screen is **PUBLISHED** (not in testing mode)
3. **Check**: User type is set to "External" or "Internal" as needed

### Step 3: Verify Environment Variables
```bash
# Check if environment variables are set correctly
vercel env ls
```

**Required variables**:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### Step 4: Test with Different Approach
Let me create a test to check the exact OAuth configuration:

```bash
# Test OAuth providers configuration
curl -s "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/providers" | jq .

# Test CSRF token
curl -s "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/csrf" | jq .

# Test session
curl -s "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/session" | jq .
```

## 🎯 POSSIBLE ISSUES

### Issue 1: Google Cloud Console Not Updated
- **Symptom**: Still getting `error=google`
- **Fix**: Update redirect URI in Google Cloud Console
- **Check**: Verify the URI is exactly: `https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/google`

### Issue 2: OAuth Consent Screen Not Published
- **Symptom**: OAuth redirects to error page
- **Fix**: Publish OAuth consent screen in Google Cloud Console
- **Check**: Go to OAuth consent screen and click "Publish"

### Issue 3: Environment Variables Mismatch
- **Symptom**: OAuth configuration errors
- **Fix**: Verify environment variables match Google Cloud Console
- **Check**: Compare `GOOGLE_CLIENT_ID` with Google Cloud Console

### Issue 4: GitHub OAuth Not Configured
- **Symptom**: `error=github`
- **Fix**: Set up GitHub OAuth app
- **Check**: Go to GitHub Settings → Developer settings → OAuth Apps

## 🚀 IMMEDIATE ACTIONS

### Action 1: Update Google Cloud Console (5 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. **Add redirect URI**: `https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/google`
4. **Add JavaScript origin**: `https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app`
5. **Save changes**

### Action 2: Publish OAuth Consent Screen (2 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click "Publish App" if not already published
3. Verify user type and scopes

### Action 3: Set Up GitHub OAuth (5 minutes)
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. **Application name**: DealershipAI
4. **Homepage URL**: `https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app`
5. **Authorization callback URL**: `https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/github`
6. **Generate client secret**
7. **Update Vercel environment variables** with GitHub credentials

### Action 4: Test After Changes (2 minutes)
```bash
# Wait 5 minutes for changes to propagate
sleep 300

# Test OAuth
./test-oauth-after-fix.sh
```

## 📋 CHECKLIST

- [ ] Google Cloud Console redirect URI updated
- [ ] Google Cloud Console JavaScript origin updated
- [ ] OAuth consent screen published
- [ ] GitHub OAuth app created
- [ ] Vercel environment variables updated
- [ ] Wait 5 minutes for propagation
- [ ] Test OAuth flow

## 🎯 SUCCESS CRITERIA

### ✅ Google OAuth Working
- Redirects to: `https://accounts.google.com/oauth/authorize?client_id=...`
- NOT redirecting to: `/auth/signin?error=google`

### ✅ GitHub OAuth Working
- Redirects to: `https://github.com/login/oauth/authorize?client_id=...`
- NOT redirecting to: `/auth/signin?error=github`

### ✅ Browser Test Working
1. Go to sign-in page
2. Click OAuth button
3. Redirects to OAuth provider (not error page)
4. Complete OAuth flow
5. Redirects to dashboard

---

**Priority**: HIGH - Required for OAuth to work
**ETA**: 15 minutes to complete all fixes
**Status**: Ready to execute
