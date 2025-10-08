# Clerk Authentication Setup Guide

## ✅ Step 1: Clerk Keys Added to Vercel
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✓
- CLERK_SECRET_KEY ✓

## Step 2: Configure OAuth Providers in Clerk Dashboard

### A. Enable Google OAuth (Recommended)

1. In Clerk Dashboard, go to: **Configure → SSO Connections**
2. Click **"Add connection"** → Select **"Google"**
3. Clerk will show you the redirect URI: 
   ```
   https://exciting-quagga-65.clerk.accounts.dev/v1/oauth_callback
   ```

4. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Authorized redirect URIs: Paste the Clerk callback URL
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

5. Back in Clerk Dashboard:
   - Paste Google Client ID
   - Paste Google Client Secret
   - Click "Save"

### B. Enable GitHub OAuth (Optional)

1. In Clerk Dashboard: **Configure → SSO Connections → Add connection → GitHub**
2. Note the callback URL from Clerk

3. Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Application name: DealershipAI Dashboard
   - Homepage URL: https://dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app
   - Authorization callback URL: Paste Clerk's callback URL
   - Click "Register application"
   - Generate a client secret
   - Copy **Client ID** and **Client Secret**

4. Back in Clerk Dashboard:
   - Paste GitHub Client ID
   - Paste GitHub Client Secret  
   - Click "Save"

## Step 3: Configure Multi-Tenant Organizations

1. In Clerk Dashboard, go to: **Configure → Organizations**
2. Enable "Organizations" feature
3. Configure settings:
   - ✅ Allow users to create organizations
   - ✅ Require organization membership
   - ✅ Enable invitations

4. Set up roles:
   - **org:admin** - Full organization control
   - **org:member** - Standard user access

## Step 4: Update Application Domain in Clerk

1. Go to **Configure → Domains**
2. Add your production domain:
   ```
   dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app
   ```
3. This enables authentication to work on your deployed app

## Step 5: Redeploy with Authentication

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
vercel --prod
```

## Step 6: Test Authentication Flow

1. Visit: https://dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app
2. Click "Sign In"
3. Try signing in with:
   - Email/Password
   - Google (if configured)
   - GitHub (if configured)

## What Happens After Authentication

Once authenticated:
- User is created in Clerk
- User record is synced to Supabase `users` table
- User is assigned to a tenant (organization)
- Dashboard shows personalized data based on tenant

## Testing Multi-Tenant Setup

### Create Test Organizations:

1. **Tenant 1: Single Dealership**
   - Sign up as: dealer1@example.com
   - Create organization: "Lou Glutz Motors"
   - View only this dealership's data

2. **Tenant 2: Dealership Group**
   - Sign up as: group-admin@example.com
   - Create organization: "AutoNation Group"
   - View multiple dealerships under this group

3. **Tenant 3: Enterprise**
   - Sign up as: enterprise@example.com
   - Create organization: "Automotive Analytics Corp"
   - Access all dealerships with analytics

## Webhook Setup (Optional - for user sync)

If you want to automatically sync Clerk users to Supabase:

1. In Clerk Dashboard: **Configure → Webhooks**
2. Add endpoint: 
   ```
   https://dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app/api/webhooks/clerk
   ```
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organization.created`
   - `organization.updated`

4. Copy the webhook signing secret

5. Add to Vercel:
   ```bash
   echo "YOUR_WEBHOOK_SECRET" | vercel env add CLERK_WEBHOOK_SECRET production
   ```

## Troubleshooting

**Issue: "Clerk is not configured"**
- Check environment variables are set in Vercel
- Verify keys start with `pk_test_` and `sk_test_`
- Redeploy after adding keys

**Issue: OAuth not working**
- Verify redirect URIs match exactly in Google/GitHub
- Check OAuth app is in "Published" status
- Clear browser cache and try again

**Issue: Multi-tenant not working**
- Ensure Organizations are enabled in Clerk
- Check middleware.ts has tenant isolation logic
- Verify RLS policies are enabled in Supabase

## Next Steps

After authentication is working:
1. Invite team members to test
2. Create sample organizations
3. Test role-based access control
4. Set up billing per organization
