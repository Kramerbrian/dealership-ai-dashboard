# Deployment Status

## Completed Steps

### 1. Repository Update
- ✅ Updated Reddit integration to use OAuth (Path B) instead of Devvit token
- ✅ Created `lib/reddit/reddit-oauth-client.ts` for OAuth script flow
- ✅ Updated `/api/ugc/reddit` to use OAuth client
- ✅ Added documentation: `docs/REDDIT_OAUTH_SETUP.md`

### 2. Files Modified
- `lib/reddit/reddit-oauth-client.ts` - New OAuth client (Path B)
- `app/api/ugc/reddit/route.ts` - Updated to use OAuth
- `docs/REDDIT_OAUTH_SETUP.md` - Setup documentation

### 3. Git Status
- ✅ Changes committed: "Deploy dashboard: Update Reddit integration to OAuth (Path B), add reddit-oauth-client"

## Next Steps (Manual)

### 1. Download and Integrate agent_package.zip
```bash
# Download from GitHub
curl -L -o /tmp/agent_package.zip https://raw.githubusercontent.com/Kramerbrian/dealership-ai-dashboard/main/agent_package.zip

# Unzip into repo root
unzip -o /tmp/agent_package.zip -d .

# Move legacy API routes (if they exist)
mkdir -p app/api_disabled
# Move any routes using SendGrid/Cheerio to app/api_disabled
```

### 2. Move Legacy API Routes
If you have routes using `@sendgrid/mail` or `cheerio`, move them:
```bash
# Example (adjust paths as needed)
mv app/api/capture-email app/api_disabled/ 2>/dev/null || true
mv app/api/analyze app/api_disabled/ 2>/dev/null || true
```

### 3. Set Environment Variables in Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables:

**Required:**
- `NEXT_PUBLIC_MAPBOX_KEY` - Mapbox access token
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `REDDIT_CLIENT_ID` - Reddit OAuth client ID (NEW)
- `REDDIT_CLIENT_SECRET` - Reddit OAuth client secret (NEW)
- `REDDIT_USER_AGENT` - Reddit user agent string (NEW)

**Optional:**
- `NEXT_PUBLIC_BASE_URL` - Production domain URL

### 4. Commit and Push
```bash
git add .
git commit -m "Deploy dashboard from agent_package.zip"
git push origin main
```

### 5. Monitor Vercel Build
- Watch build logs in Vercel dashboard
- Verify build completes successfully
- Check for any missing environment variables

### 6. Post-Deploy Verification

**Landing Page:**
- ✅ `https://dealershipai.com` renders landing page
- ✅ AI analyzer and map components load
- ✅ CTA redirects to `/sign-in`

**Dashboard:**
- ✅ `https://dash.dealershipai.com` requires Clerk auth
- ✅ `/dash` shows Pulse overview
- ✅ `/dash/onboarding` works
- ✅ `/dash/insights/ai-story` loads
- ✅ `/dash/autopilot` displays

**Reddit UGC:**
- ✅ `/api/ugc/reddit?dealershipName=Test&limit=10` returns data
- ✅ UGC dashboard tab shows Reddit feed

## Notes

- **Reddit Integration**: Now uses OAuth (Path B) - see `docs/REDDIT_OAUTH_SETUP.md`
- **Devvit Token**: Not used for dashboard - only for CLI/Devvit apps
- **Legacy Routes**: Any SendGrid/Cheerio routes should be moved to `app/api_disabled`

## Error Handling

If build fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Check for missing dependencies
4. Verify no legacy routes are causing issues
