# OAuth SSO Setup Guide for DealershipAI

## Overview
This guide will help you set up OAuth authentication for DealershipAI using Google, GitHub, Microsoft Azure AD, and Facebook providers.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# OAuth Providers
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft Azure AD OAuth (Optional)
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Facebook OAuth (Optional)
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

## Provider Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env.local`

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "DealershipAI"
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`

### 3. Microsoft Azure AD Setup (Optional)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: "DealershipAI"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `https://yourdomain.com/api/auth/callback/azure-ad`
5. Go to "Certificates & secrets" → "New client secret"
6. Copy Application (client) ID, Directory (tenant) ID, and Client secret to your `.env.local`

### 4. Facebook OAuth Setup (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Go to "Facebook Login" → "Settings"
5. Add Valid OAuth Redirect URIs:
   - `https://yourdomain.com/api/auth/callback/facebook`
6. Copy App ID and App Secret to your `.env.local`

## Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin`
3. Test each OAuth provider by clicking the respective buttons
4. Verify that users are redirected properly after authentication

## Production Deployment

For production deployment on Vercel:

1. Add all environment variables to your Vercel project settings
2. Update `NEXTAUTH_URL` to your production domain
3. Update all OAuth provider redirect URIs to use your production domain
4. Redeploy your application

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate your OAuth client secrets
- Monitor OAuth usage in your provider dashboards

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**: Ensure your redirect URIs match exactly in your OAuth provider settings
2. **"Client ID not found"**: Verify your environment variables are correctly set
3. **"Access denied"**: Check that your OAuth app is properly configured and approved

### Debug Mode:
Add `debug: true` to your NextAuth configuration in `lib/auth.ts` for detailed logging.

## Next Steps

After setting up OAuth:

1. Test the complete authentication flow
2. Set up user onboarding after first login
3. Configure role-based access control
4. Set up user profile management
5. Implement session management and logout functionality