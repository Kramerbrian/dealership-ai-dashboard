# Sentry Error Tracking Configuration

## Sentry Auth Token Setup

### Purpose
The `SENTRY_AUTH_TOKEN` is used for:
- **Source Maps Upload**: Automatically upload source maps during builds for better error debugging
- **Release Tracking**: Create and track releases in Sentry
- **API Access**: Allow CI/CD and build processes to interact with Sentry API

### Generate Token

1. **Go to Sentry Dashboard**:
   ```
   https://sentry.io/settings/account/api/auth-tokens/
   ```

2. **Create New Token**:
   - Click "Create New Token"
   - Name: `DealershipAI Production` (or appropriate name)
   - Select scopes:
     - ✅ `project:read` - Read project information
     - ✅ `project:releases` - Create and manage releases
     - ✅ `org:read` - Read organization info
     - ✅ `project:write` - Write to projects (for source maps)

3. **Copy Token**:
   - The token will look like: `sntrys_xxxxxxxxxxxxxxxxxxxxx`
   - **⚠️ Copy it immediately** - you won't see it again!

### Environment Variables

#### Required Variables

```bash
# Sentry DSN (for error tracking in app)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# Sentry Auth Token (for source maps & releases)
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxx

# Optional: Sentry Organization
SENTRY_ORG=your-org-slug

# Optional: Sentry Project
SENTRY_PROJECT=dealership-ai-dashboard
```

### Configuration Locations

#### ✅ Local Development (.env.local)
```bash
SENTRY_AUTH_TOKEN=your-actual-token-here
```
**⚠️ Never commit the actual token!**

#### ✅ Vercel
Add to all environments:
```bash
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_AUTH_TOKEN preview
vercel env add SENTRY_AUTH_TOKEN development
```

#### ℹ️ Supabase
**Not needed** - Sentry auth token is for build/deployment processes, not database operations.

### Usage in Build Process

The token is automatically used by `@sentry/nextjs` during:
- `npm run build` - Uploads source maps if configured
- Vercel deployments - Automatically uploads source maps

### Verification

After adding the token, verify it works:

1. **Check build logs**:
   ```bash
   npm run build
   # Look for: "Uploading source maps to Sentry..."
   ```

2. **Check Sentry dashboard**:
   - Go to: Settings → Projects → Your Project → Source Maps
   - Verify source maps are being uploaded

3. **Test error tracking**:
   - Trigger a test error in your app
   - Check Sentry dashboard for the error

### Security Notes

- ⚠️ **Never commit tokens to git** - `.env.local` is already in `.gitignore`
- ⚠️ **Rotate tokens regularly** - Especially if exposed
- ⚠️ **Use minimal scopes** - Only grant necessary permissions
- ✅ **Use different tokens** - One for production, one for development if needed

### Troubleshooting

#### "No Sentry auth token configured"
- **Issue**: Source maps won't upload
- **Fix**: Add `SENTRY_AUTH_TOKEN` to environment variables

#### "Invalid auth token"
- **Issue**: Token expired or incorrect
- **Fix**: Generate a new token and update all environments

#### "Source maps not uploading"
- **Check**: Token has `project:write` scope
- **Check**: `SENTRY_ORG` and `SENTRY_PROJECT` are set (if needed)
- **Check**: Build process is running (not just dev server)

---

**Token Generation URL**: https://sentry.io/settings/account/api/auth-tokens/  
**Last Updated**: 2025-11-02

