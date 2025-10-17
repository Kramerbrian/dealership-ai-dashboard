# OAuth Provider Configuration Guide

## Overview
This guide will help you configure OAuth providers (Google, GitHub, Microsoft) in the Ory Console for your DealershipAI application.

## Prerequisites
- Ory Console access: https://console.ory.sh
- Project: `optimistic-haslett-3r8udelhc2`
- OAuth provider developer accounts (Google, GitHub, Microsoft)

---

## 1. Google OAuth Setup

### Step 1.1: Google Cloud Console Configuration
1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create/Select Project**:
   - Create new project or select existing one
   - Note the project ID
3. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
   - Search for "Google Identity" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `DealershipAI OAuth`
   - **Authorized redirect URIs**:
     ```
     https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/google
     ```
   - Click **Create**
   - **Copy Client ID and Client Secret**

### Step 1.2: Ory Console Configuration
1. **Go to Ory Console**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`
3. **Navigate to OAuth2/OpenID Connect**:
   - Go to **Identity** → **OAuth2 and OpenID Connect** → **Providers**
4. **Add Google Provider**:
   - Click **Add Provider**
   - Select **Google**
   - **Provider ID**: `google`
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - **Scope**: `openid email profile`
   - Click **Save**

---

## 2. GitHub OAuth Setup

### Step 2.1: GitHub Developer Settings
1. **Go to GitHub Developer Settings**: https://github.com/settings/developers
2. **Create New OAuth App**:
   - Click **New OAuth App**
   - **Application name**: `DealershipAI`
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**:
     ```
     https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/github
     ```
   - Click **Register application**
   - **Copy Client ID and Client Secret**

### Step 2.2: Ory Console Configuration
1. **Go to Ory Console**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`
3. **Navigate to OAuth2/OpenID Connect**:
   - Go to **Identity** → **OAuth2 and OpenID Connect** → **Providers**
4. **Add GitHub Provider**:
   - Click **Add Provider**
   - Select **GitHub**
   - **Provider ID**: `github`
   - **Client ID**: Paste from GitHub
   - **Client Secret**: Paste from GitHub
   - **Scope**: `user:email`
   - Click **Save**

---

## 3. Microsoft OAuth Setup

### Step 3.1: Azure Portal Configuration
1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to Azure Active Directory**:
   - Go to **Azure Active Directory** → **App registrations**
   - Click **New registration**
3. **Register Application**:
   - **Name**: `DealershipAI`
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/self-service/methods/oidc/callback/microsoft`
   - Click **Register**
4. **Get Credentials**:
   - **Application (client) ID**: Copy this value
   - Go to **Certificates & secrets** → **New client secret**
   - **Description**: `DealershipAI Secret`
   - **Expires**: `24 months`
   - Click **Add** → **Copy the secret value**
   - **Directory (tenant) ID**: Copy from Overview page

### Step 3.2: Ory Console Configuration
1. **Go to Ory Console**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`
3. **Navigate to OAuth2/OpenID Connect**:
   - Go to **Identity** → **OAuth2 and OpenID Connect** → **Providers**
4. **Add Microsoft Provider**:
   - Click **Add Provider**
   - Select **Microsoft**
   - **Provider ID**: `microsoft`
   - **Client ID**: Paste from Azure Portal
   - **Client Secret**: Paste from Azure Portal
   - **Tenant ID**: Paste from Azure Portal
   - **Scope**: `openid email profile`
   - Click **Save**

---

## 4. SAML Configuration (Enterprise)

### Step 4.1: SAML Provider Setup
1. **Get SAML Certificate**:
   - Obtain SAML certificate from your identity provider
   - Convert to PEM format if needed
2. **Configure SAML Settings**:
   - **Entity ID**: Your SAML entity identifier
   - **SSO URL**: Your SAML SSO endpoint
   - **SLO URL**: Your SAML SLO endpoint (optional)
   - **Audience**: `https://your-domain.com`

### Step 4.2: Ory Console Configuration
1. **Go to Ory Console**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`
3. **Navigate to OAuth2/OpenID Connect**:
   - Go to **Identity** → **OAuth2 and OpenID Connect** → **Providers**
4. **Add SAML Provider**:
   - Click **Add Provider**
   - Select **SAML**
   - **Provider ID**: `saml`
   - **Entity ID**: Your SAML entity ID
   - **SSO URL**: Your SAML SSO URL
   - **Certificate**: Upload your SAML certificate
   - **Audience**: Your application audience
   - Click **Save**

---

## 5. Webhook Configuration

### Step 5.1: Configure Webhooks
1. **Go to Ory Console**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`
3. **Navigate to Webhooks**:
   - Go to **Settings** → **Webhooks**
4. **Add Webhook**:
   - **URL**: `https://your-domain.com/api/webhooks/ory`
   - **Events**: Select the following events:
     - `session.created`
     - `session.ended`
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - **Secret**: Generate a webhook secret
   - Click **Save**

---

## 6. Testing OAuth Providers

### Step 6.1: Test Each Provider
1. **Deploy your application** with the configured environment variables
2. **Visit the sign-up page**: `https://your-domain.com/sign-up`
3. **Test each OAuth provider**:
   - Click "Continue with Google"
   - Click "Continue with GitHub"
   - Click "Continue with Microsoft"
4. **Verify the flow**:
   - OAuth provider login page appears
   - After login, user is redirected back to your app
   - User is authenticated and redirected to dashboard

### Step 6.2: Troubleshooting
- **Check Ory Console logs** for authentication errors
- **Verify redirect URIs** match exactly
- **Check environment variables** are set correctly
- **Test with different browsers** to rule out caching issues

---

## 7. Production Checklist

- [ ] Google OAuth configured and tested
- [ ] GitHub OAuth configured and tested
- [ ] Microsoft OAuth configured and tested
- [ ] SAML configured (if needed)
- [ ] Webhooks configured
- [ ] Environment variables set in Vercel
- [ ] All OAuth providers tested in production
- [ ] Error handling implemented
- [ ] User data mapping configured
- [ ] Session management working

---

## 8. Security Considerations

1. **Client Secrets**: Store securely in environment variables
2. **Redirect URIs**: Use HTTPS in production
3. **Scopes**: Request only necessary permissions
4. **Webhook Security**: Verify webhook signatures
5. **Rate Limiting**: Implement rate limiting for OAuth flows
6. **Error Handling**: Don't expose sensitive information in errors

---

## Support

If you encounter issues:
1. Check Ory Console logs
2. Verify OAuth provider configurations
3. Test with Ory's built-in test tools
4. Check environment variables
5. Review Ory documentation: https://www.ory.sh/docs/
