# Google OAuth Quick Reference - DealershipAI

## Current Configuration

**Google OAuth Client ID:**
```
1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com
```

**Status**: ✅ Configured in `.env.local` and Vercel

---

## Usage Examples

### Basic Google Sign-In

```tsx
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

<GoogleSignInButton />
```

### With Custom Redirect

```tsx
<GoogleSignInButton redirectUri="https://dealershipai.com/onboarding" />
```

### With State Parameter

```tsx
<GoogleSignInButton state="/dashboard" />
```

### With Additional Scopes

```tsx
<GoogleSignInButton 
  providerScopes={[
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly'
  ]}
/>
```

### Direct URL Usage

```typescript
// Simple
window.location.href = '/api/auth/sso?provider=GoogleOAuth';

// With state
const state = encodeURIComponent('/dashboard');
window.location.href = `/api/auth/sso?provider=GoogleOAuth&state=${state}`;

// With scopes
const scopes = 'openid email profile https://www.googleapis.com/auth/calendar.readonly';
window.location.href = `/api/auth/sso?provider=GoogleOAuth&provider_scopes=${encodeURIComponent(scopes)}`;
```

---

## Setup Checklist

### Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] OAuth client created (Web application)
- [ ] Redirect URI added: `https://api.workos.com/sso/oauth/callback?client_id=...`
- [ ] App published (not in testing mode)
- [ ] Client ID and Secret copied

### WorkOS Dashboard
- [ ] Navigate to Authentication → OAuth providers → Google
- [ ] Click "Manage"
- [ ] Select "Your app's credentials"
- [ ] Paste Google Client ID
- [ ] Paste Google Client Secret
- [ ] Click "Save"

### Application
- [ ] Component imported: `GoogleSignInButton`
- [ ] SSO endpoint working: `/api/auth/sso?provider=GoogleOAuth`
- [ ] Callback handler working: `/auth/callback`
- [ ] User provisioning tested

---

## Redirect URI Reference

Get your exact Redirect URI from:
**WorkOS Dashboard → Authentication → OAuth providers → Google → Manage**

It will look like:
```
https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Access Blocked" | App not published | Publish in Google Cloud Console |
| "Redirect URI mismatch" | Wrong redirect URI | Copy exact URI from WorkOS Dashboard |
| "Invalid client" | Wrong credentials | Verify Client ID/Secret in WorkOS Dashboard |

---

## Documentation

- **Full Setup Guide**: `WORKOS_GOOGLE_OAUTH_SETUP.md`
- **WorkOS Docs**: https://workos.com/docs/authkit/oauth-providers/google
- **API Endpoint**: `/api/auth/sso?provider=GoogleOAuth`

