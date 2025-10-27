# 🚀 Vercel Production Deployment

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Deploy to Vercel

### Option A: Using our deploy script
```bash
npm run deploy
```

### Option B: Manual deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

## Step 4: Configure Environment Variables

Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI APIs (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Google APIs (Optional)
GOOGLE_MY_BUSINESS_API_KEY=...
GOOGLE_PLACES_API_KEY=...
GOOGLE_REVIEWS_API_KEY=...

# Analytics (Optional)
NEXT_PUBLIC_GA=G-...
```

## Step 5: Configure Custom Domain (Optional)

1. Go to **Domains** in your Vercel dashboard
2. Add your custom domain:
   - `dealershipai.com`
   - `www.dealershipai.com`
3. Update DNS records as instructed
4. Wait for SSL certificate (5-10 minutes)

## Step 6: Configure Clerk for Production

1. Go to your Clerk dashboard
2. Add production domains:
   - `https://your-app.vercel.app`
   - `https://dealershipai.com` (if using custom domain)
3. Update redirect URLs in Clerk settings

## Step 7: Test Production Deployment

1. Visit your production URL
2. Test the waitlist signup flow
3. Verify authentication works
4. Check database connections
5. Test all API endpoints

## Step 8: Set up Monitoring

### Vercel Analytics
1. Go to **Analytics** in your Vercel dashboard
2. Enable Vercel Analytics
3. Add to your app (already included in layout.tsx)

### Error Tracking (Optional)
1. Sign up for [Sentry](https://sentry.io)
2. Add Sentry to your project:
   ```bash
   npm install @sentry/nextjs
   ```
3. Configure Sentry in your app

## Step 9: Performance Optimization

### Image Optimization
- All images are already optimized with Next.js Image component
- Consider adding WebP format support

### Caching
- API routes have proper caching headers
- Static assets are cached by Vercel CDN
- Database queries use Redis caching

### Bundle Optimization
- Code splitting is implemented
- Dynamic imports for heavy components
- Tree shaking enabled

## Step 10: Security Checklist

- ✅ Environment variables secured
- ✅ API routes protected with authentication
- ✅ Database RLS enabled
- ✅ CORS configured
- ✅ Rate limiting implemented
- ✅ Input validation on all endpoints

## Troubleshooting

### Common Issues:
- **"Build failed"**: Check for TypeScript errors
- **"Environment variables not found"**: Verify all variables are set in Vercel
- **"Database connection failed"**: Check Supabase credentials
- **"Authentication not working"**: Verify Clerk configuration

### Performance Issues:
- **Slow page loads**: Check bundle size and optimize images
- **API timeouts**: Increase Vercel function timeout
- **Database slow**: Check query performance and add indexes

### Support:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)
