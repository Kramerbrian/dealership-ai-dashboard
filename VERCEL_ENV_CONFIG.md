# Vercel Environment Variables Configuration

## Required Environment Variables for Production

### 1. Ory Authentication Configuration
```bash
# Core Ory Settings
ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
NEXT_PUBLIC_ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
ORY_PROJECT_ID=360ebb8f-2337-48cd-9d25-fba49a262f9c
ORY_WORKSPACE_ID=83af532a-eee6-4ad8-96c4-f4802a90940a

# Ory API Keys (get from Ory Console)
ORY_API_KEY=your_ory_api_key_here
ORY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Database Configuration
```bash
# Supabase Database
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Redis Cache Configuration
```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 4. JWT Configuration
```bash
# JWT Secret for token signing
JWT_SECRET=your_jwt_secret_key_here
```

### 5. OAuth Provider Configuration
```bash
# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Microsoft OAuth (get from Azure Portal)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=your_microsoft_tenant_id
```

### 6. SAML Configuration (for Enterprise)
```bash
# SAML Settings
SAML_CERT=your_saml_certificate_content
SAML_AUDIENCE=https://your-domain.com
SAML_ENTITY_ID=your_entity_id
SAML_SSO_URL=your_saml_sso_url
SAML_SLO_URL=your_saml_slo_url
```

### 7. Monitoring & Security
```bash
# Sentry Error Tracking
SENTRY_DSN=your_sentry_dsn

# Security
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

## How to Configure in Vercel Dashboard

### Step 1: Access Environment Variables
1. Go to: https://vercel.com/brian-kramers-projects/dealershipai-dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New** for each variable

### Step 2: Add Variables
For each environment variable:
1. **Name**: Enter the variable name (e.g., `ORY_SDK_URL`)
2. **Value**: Enter the variable value
3. **Environment**: Select `Production` (and optionally `Preview` and `Development`)
4. Click **Save**

### Step 3: Redeploy
After adding all environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or trigger a new deployment by pushing to your repository

## Getting Required Values

### Ory API Keys
1. Go to: https://console.ory.sh
2. Select project: `optimistic-haslett-3r8udelhc2`
3. Go to **Settings** → **API Keys**
4. Create new API key → Copy to `ORY_API_KEY`
5. Go to **Settings** → **Webhooks** → Create webhook secret → Copy to `ORY_WEBHOOK_SECRET`

### Google OAuth
1. Go to: https://console.cloud.google.com
2. Create/select project
3. Enable Google+ API
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Authorized redirect URI: `https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/google`
6. Copy Client ID and Client Secret

### GitHub OAuth
1. Go to: https://github.com/settings/developers
2. Click **New OAuth App**
3. Authorization callback URL: `https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/github`
4. Copy Client ID and Client Secret

### Microsoft OAuth
1. Go to: https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Redirect URI: `https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/microsoft`
4. Copy Client ID, Client Secret, and Tenant ID

## Environment Variables Checklist

- [ ] ORY_SDK_URL
- [ ] NEXT_PUBLIC_ORY_SDK_URL
- [ ] ORY_PROJECT_ID
- [ ] ORY_WORKSPACE_ID
- [ ] ORY_API_KEY
- [ ] ORY_WEBHOOK_SECRET
- [ ] DATABASE_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] JWT_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET
- [ ] MICROSOFT_CLIENT_ID
- [ ] MICROSOFT_CLIENT_SECRET
- [ ] MICROSOFT_TENANT_ID
- [ ] SENTRY_DSN
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET

## Testing Environment Variables

After configuration, test by:
1. Deploying to production
2. Visiting the sign-up page
3. Testing OAuth providers
4. Checking browser console for errors
5. Verifying database connections
