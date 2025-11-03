# WorkOS Google OAuth Integration Guide for DealershipAI

## Overview

This guide explains how to integrate Google OAuth authentication using WorkOS for DealershipAI. WorkOS simplifies Google OAuth by handling the OAuth flow, allowing you to support Google authentication alongside other SSO providers with a single integration.

---

## Quick Start (Testing with Default Credentials)

### Staging Environment Testing

WorkOS provides default Google OAuth credentials for testing in the **Staging environment**:

```typescript
// Simply use the provider parameter - no configuration needed!
window.location.href = '/api/auth/sso?provider=GoogleOAuth';
```

**Note**: Default credentials are only available in Staging. For production, you must configure your own Google OAuth credentials (see steps below).

---

## Production Setup

### Step 1: Get Redirect URI from WorkOS Dashboard

1. **Access WorkOS Dashboard**
   - Go to https://dashboard.workos.com/
   - Sign in to your account

2. **Navigate to OAuth Providers**
   - In the left navigation, select **Authentication**
   - Click on **OAuth providers** sub-tab
   - Find the **Google** section

3. **Get Redirect URI**
   - Click **Manage** button
   - In the **Google OAuth** configuration dialog, locate the **Redirect URI**
   - **Copy this Redirect URI** - you'll need it for Google Cloud Console

The Redirect URI looks like:
```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

---

### Step 2: Configure OAuth Consent Screen in Google Cloud Console

1. **Access Google Cloud Platform Console**
   - Go to https://console.cloud.google.com/
   - Sign in with your Google account
   - **Select your project** from the project dropdown (or create a new project)

2. **Configure OAuth Consent Screen**
   - In the left navigation, select **APIs & Services** → **OAuth consent screen**
   - Choose **External** user type (for general public)
   - Fill in required information:
     - **App name**: `DealershipAI`
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **Save and Continue**

3. **Add Scopes**
   - Add the following scopes:
     - `openid`
     - `email`
     - `profile`
   - Click **Save and Continue**

4. **Configure Test Users** (if app is in testing mode)
   - Add test user email addresses
   - Click **Save and Continue**

---

### Step 3: Create OAuth 2.0 Client Credentials

1. **Navigate to Credentials**
   - In Google Cloud Console, go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**

2. **Create OAuth Client**
   - **Application type**: Select **Web application**
   - **Name**: `DealershipAI WorkOS OAuth`
   - **Authorized redirect URIs**: 
     - Click **Add URI**
     - Paste the **Redirect URI** you copied from WorkOS Dashboard
     - Click **Create**

3. **Copy Credentials**
   - You'll see a dialog with:
     - **Client ID** (starts with numbers, e.g., `1039185326912-...`)
     - **Client Secret** (starts with `GOCSPX-...`)
   - **Copy both values immediately** - the secret won't be shown again!
   - Save them securely

---

### Step 4: Configure Google Credentials in WorkOS Dashboard

1. **Return to WorkOS Dashboard**
   - Go back to https://dashboard.workos.com/
   - Navigate to **Authentication** → **OAuth providers** → **Google**

2. **Add Your Credentials**
   - Click **Manage**
   - Select **Your app's credentials** (not default credentials)
   - Paste your **Google Client ID** into the Client ID field
   - Paste your **Google Client Secret** into the Client Secret field
   - Click **Save**

---

### Step 5: Publish Google OAuth Application

**Important**: Your app must be published for production use!

1. **Go to Google Cloud Console**
   - Navigate to **APIs & Services** → **OAuth consent screen**
   - Go to the **Audience** tab

2. **Publish App**
   - If status shows **"In production"** → ✅ You're done!
   - If status shows **"Testing"**:
     - Click **Publish app**
     - Click **Confirm** in the dialog
     - Wait for publishing to complete

**Warning**: Users will get "Access Blocked" errors if your app is in testing mode!

---

## Using Google OAuth in Your Application

### Option 1: Direct Provider-based OAuth (Recommended for Google-only)

Use this when you want users to sign in with Google regardless of their organization:

```typescript
// Redirect to Google OAuth
window.location.href = '/api/auth/sso?provider=GoogleOAuth';
```

**Or create a sign-in button:**

```tsx
// components/auth/GoogleSignInButton.tsx
'use client';

export function GoogleSignInButton() {
  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/sso?provider=GoogleOAuth';
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}
```

### Option 2: With State Parameter (for Deep Linking)

```typescript
const redirectPath = '/dashboard';
const state = encodeURIComponent(redirectPath);
window.location.href = `/api/auth/sso?provider=GoogleOAuth&state=${state}`;
```

### Option 3: With Custom Redirect URI

```typescript
const customRedirect = 'https://dealershipai.com/onboarding';
window.location.href = `/api/auth/sso?provider=GoogleOAuth&redirect_uri=${encodeURIComponent(customRedirect)}`;
```

---

## Optional: Custom Google OAuth Domain

By default, Google OAuth shows "Continue to workos.com". You can customize this:

### Step 1: Add Custom Domain in WorkOS Dashboard

1. Go to **Authentication** → **OAuth providers** → **Google**
2. Click **Setup Custom Domain**
3. Enter your custom domain (e.g., `auth.dealershipai.com`)
4. Click **Set Domain**

### Step 2: Add CNAME Record

In your DNS settings, add:
- **Type**: CNAME
- **Host**: `auth.dealershipai.com` (or your custom domain)
- **Value**: `cname.workosdns.com`

### Step 3: Verify DNS

1. Return to WorkOS Dashboard
2. Click **Verify DNS**
3. Wait for verification (usually < 1 minute)

### Step 4: Add New Redirect URI to Google

1. WorkOS will provide a new redirect URI starting with your custom domain
2. Copy this URI
3. In Google Cloud Console → **APIs & Services** → **Credentials**
4. Add the new redirect URI to **Authorized redirect URIs**
5. **Keep the old `workos.com` URI** for now (for backwards compatibility)

### Step 5: Test and Finalize

1. Click **Test Google Redirect URI** in WorkOS Dashboard
2. If successful, click **Save custom Google OAuth settings**
3. Test your Google OAuth flow
4. Once confirmed working, you can remove the old `workos.com` URI from Google

---

## Optional: Additional OAuth Scopes

### Configure Scopes in WorkOS Dashboard

1. Go to **Authentication** → **OAuth providers** → **Google** → **Manage**
2. Scroll to **OAuth Scopes** section
3. Add additional scopes as needed (e.g., `https://www.googleapis.com/auth/calendar`)
4. Enable **Return Google OAuth tokens** if you need access/refresh tokens
5. Click **Save**

### Dynamic Scopes (Per Request)

You can also specify scopes dynamically using the `provider_scopes` parameter:

```typescript
const scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly'
].join(' ');

window.location.href = `/api/auth/sso?provider=GoogleOAuth&provider_scopes=${encodeURIComponent(scopes)}`;
```

**Important Notes:**
- Additional scopes must also be configured on your OAuth consent screen in Google Cloud Console
- Sensitive/restricted scopes require Google app verification
- Users may see "unverified app" warnings if scopes don't match

---

## Update SSO Route to Support Scopes

Update your SSO route to support `provider_scopes`:

```typescript
// app/api/auth/sso/route.ts (already supports provider, just need to add scopes support)
const providerScopes = searchParams.get('provider_scopes');

// In the provider section:
if (provider) {
  authorizationUrl = workos.sso.getAuthorizationUrl({
    provider,
    redirectUri,
    clientId,
    state,
    ...(providerScopes ? { providerScopes: providerScopes.split(' ') } : {}),
  });
}
```

---

## Callback Handling

The existing callback handler (`/auth/callback`) automatically handles Google OAuth responses:

```typescript
// app/auth/callback/route.ts
// This already handles Google OAuth via WorkOS:
const { profile, accessToken } = await workos.sso.getProfileAndToken({
  code,
  clientId,
});
```

The profile will contain:
- `id` - WorkOS user ID
- `email` - User's email
- `first_name` - User's first name
- `last_name` - User's last name
- `idp_id` - Google user ID
- `connection_id` - Connection ID
- `connection_type` - Will be `GoogleOAuth`
- `organization_id` - If user belongs to an organization

---

## Testing Checklist

- [ ] Google OAuth app created in Google Cloud Console
- [ ] Redirect URI added to Google Cloud Console
- [ ] OAuth consent screen configured and published
- [ ] Client ID and Secret added to WorkOS Dashboard
- [ ] Test sign-in flow works
- [ ] User profile received correctly
- [ ] JIT provisioning creates user in database
- [ ] Session cookies set correctly
- [ ] User redirected to dashboard

---

## Troubleshooting

### "Access Blocked" Error

**Cause**: OAuth app not published in Google Cloud Console

**Fix**: 
1. Go to Google Cloud Console → OAuth consent screen
2. Click **Publish app**
3. Wait for publishing to complete

### "Redirect URI Mismatch" Error

**Cause**: Redirect URI in Google Cloud Console doesn't match WorkOS

**Fix**:
1. Copy exact Redirect URI from WorkOS Dashboard
2. Add it to Google Cloud Console → Credentials → Authorized redirect URIs
3. Ensure there are no trailing slashes or spaces

### "Invalid Client" Error

**Cause**: Wrong Client ID or Secret in WorkOS Dashboard

**Fix**:
1. Verify Client ID and Secret are correct in WorkOS Dashboard
2. Ensure credentials are from the correct Google Cloud project
3. Check that credentials are for "Web application" type

### User Sees "Continue to workos.com"

**Cause**: Using default WorkOS credentials or custom domain not configured

**Fix**:
- Configure your own Google OAuth credentials (see Step 4)
- OR set up custom domain (see Optional: Custom Google OAuth Domain section)

---

## Current Google OAuth Client ID

Based on your `.env.local`:

```
GOOGLE_OAUTH_CLIENT_ID=1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com
```

**Note**: Make sure this Client ID is:
1. Added to WorkOS Dashboard (Google OAuth section)
2. Has the correct Redirect URI configured in Google Cloud Console
3. OAuth consent screen is published

---

## Next Steps

1. ✅ Verify Google OAuth Client ID is in WorkOS Dashboard
2. ✅ Ensure Redirect URI matches between Google and WorkOS
3. ✅ Test Google OAuth sign-in flow
4. ✅ Verify user provisioning works
5. ⚠️ Consider setting up custom domain (optional)
6. ⚠️ Configure additional scopes if needed (optional)

---

## API Reference

- **SSO Authorization**: `GET /api/auth/sso?provider=GoogleOAuth`
- **Callback Handler**: `GET /auth/callback` (automatic)
- **WorkOS Documentation**: https://workos.com/docs/authkit/oauth-providers/google

---

## Summary

Your DealershipAI application already has Google OAuth support built in via WorkOS. Simply:

1. Configure Google OAuth in WorkOS Dashboard with your credentials
2. Use `/api/auth/sso?provider=GoogleOAuth` to initiate sign-in
3. The callback handler automatically processes the response

The integration is ready to use!

