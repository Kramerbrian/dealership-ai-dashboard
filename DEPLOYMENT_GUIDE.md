# 🚀 DealershipAI Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Vercel account (recommended) or your preferred hosting platform
- Domain name (optional but recommended)

## 🔧 Environment Variables Setup

### Required Variables

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth Providers (at least one required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_DASHBOARD_URL=https://yourdomain.com
```

### Optional Variables

```bash
# Caching (Vercel KV recommended)
KV_URL=your-vercel-kv-url
KV_REST_API_URL=your-vercel-kv-rest-url
KV_REST_API_TOKEN=your-vercel-kv-token

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA=G-XXXXXXXXXX

# External APIs
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=your-gsc-client-id
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=your-gsc-client-secret
PAGESPEED_INSIGHTS_API_KEY=your-pagespeed-api-key
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from the list above

4. **Configure Custom Domain** (Optional)
   - In Vercel dashboard, go to Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` to match your domain

### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings
   - Add all environment variables

### Option 3: Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t dealershipai .
   docker run -p 3000:3000 --env-file .env.local dealershipai
   ```

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

### GitHub OAuth (Optional)

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://yourdomain.com/api/auth/callback/github`

## 📊 Monitoring Setup

### Sentry Error Monitoring

1. Create account at [Sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Copy the DSN to `NEXT_PUBLIC_SENTRY_DSN`

### Google Analytics

1. Create GA4 property
2. Copy the Measurement ID to `NEXT_PUBLIC_GA`

### Vercel Analytics

- Automatically enabled on Vercel deployments
- No additional setup required

## 🗄️ Database Setup

### Vercel KV (Recommended)

1. In Vercel dashboard, go to Storage
2. Create a new KV database
3. Copy the connection details to environment variables

### Redis (Alternative)

1. Set up Redis instance (Redis Cloud, AWS ElastiCache, etc.)
2. Add `REDIS_URL` to environment variables

## 🔧 Post-Deployment Checklist

- [ ] OAuth providers configured and working
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring tools connected
- [ ] Cache system operational
- [ ] API endpoints responding
- [ ] Dashboard loading correctly
- [ ] Modals functioning properly
- [ ] Error tracking working

## 🚨 Troubleshooting

### Common Issues

1. **OAuth 400 Error**
   - Check `NEXTAUTH_URL` matches your domain
   - Verify OAuth redirect URIs are correct

2. **Cache Not Working**
   - Verify KV/Redis credentials
   - Check network connectivity

3. **Modals Not Loading**
   - Check API endpoints are accessible
   - Verify CORS settings

4. **Performance Issues**
   - Enable caching
   - Check database connections
   - Monitor with Sentry

### Debug Mode

Enable debug logging:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Caching**
   - Vercel KV for API responses
   - Redis for session storage

2. **Image Optimization**
   - Use Next.js Image component
   - Enable WebP format

3. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading for modals

4. **CDN Configuration**
   - Static assets served from CDN
   - API responses cached

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review environment variables
3. Check monitoring logs
4. Contact support if needed

## 🎉 Success!

Once deployed, your DealershipAI dashboard will be:
- ✅ Secure with OAuth SSO
- ✅ Fast with caching
- ✅ Monitored with error tracking
- ✅ Scalable for production traffic
- ✅ Ready for your first customers!