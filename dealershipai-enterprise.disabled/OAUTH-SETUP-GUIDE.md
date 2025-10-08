# OAuth Setup Guide for DealershipAI

This guide will help you set up OAuth providers for NextAuth.js authentication.

## 🔧 Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🐙 GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in Application Details**
   - **Application name**: DealershipAI
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

3. **Get Credentials**
   - Copy the **Client ID** → `GITHUB_ID`
   - Generate a **Client Secret** → `GITHUB_SECRET`

## 🔍 Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth Client**
   - **Name**: DealershipAI
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

5. **Get Credentials**
   - Copy the **Client ID** → `GOOGLE_CLIENT_ID`
   - Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET`

## 🚀 Testing Authentication

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Visit the test page**
   - Go to: http://localhost:3000/test-auth
   - Check the configuration status
   - Try signing in with configured providers

3. **Check API endpoints**
   ```bash
   # Check available providers
   curl http://localhost:3000/api/auth/providers
   
   # Check session
   curl http://localhost:3000/api/auth/session
   ```

## 🔒 Production Setup

For production deployment:

1. **Update NEXTAUTH_URL**
   ```bash
   NEXTAUTH_URL="https://your-domain.com"
   ```

2. **Update OAuth Callback URLs**
   - GitHub: `https://your-domain.com/api/auth/callback/github`
   - Google: `https://your-domain.com/api/auth/callback/google`

3. **Generate a secure secret**
   ```bash
   openssl rand -base64 32
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **"client_id is required" error**
   - Make sure environment variables are set correctly
   - Restart the development server after adding variables

2. **"Failed to fetch" error**
   - Check if the development server is running
   - Verify NEXTAUTH_URL matches your local URL

3. **OAuth redirect mismatch**
   - Ensure callback URLs match exactly in OAuth provider settings
   - Check for trailing slashes in URLs

### Debug Mode

Enable NextAuth debug mode by adding to your `.env.local`:

```bash
NEXTAUTH_DEBUG=true
```

This will show detailed logs in the console.

## 📚 Next Steps

Once OAuth is configured:

1. **Test authentication flow**
2. **Integrate with your app components**
3. **Set up user database storage**
4. **Configure role-based access control**
5. **Deploy to production**

## 🔗 Useful Links

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Auth.js (NextAuth v5)](https://authjs.dev/)
