# DealershipAI Enterprise - Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Environment Setup

#### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe Billing
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# AI Services
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."

# Redis (for caching and queues)
REDIS_URL="redis://..."

# Email
RESEND_API_KEY="re_..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://app.dealershipai.com"
NODE_ENV="production"
```

### 2. Database Setup

#### Supabase Configuration
1. Create a new Supabase project
2. Run the Prisma migration:
   ```bash
   npx prisma migrate deploy
   ```
3. Enable Row Level Security (RLS) on all tables
4. Set up the RLS policies as defined in the schema

#### Database Seeding
```bash
npm run db:seed
```

### 3. Clerk Setup

#### Organization Configuration
1. Enable Organizations in Clerk Dashboard
2. Configure organization roles:
   - `admin` → `dealership_admin`
   - `member` → `user`
3. Set up webhook endpoints:
   - `https://your-domain.com/api/webhooks/clerk`

#### Webhook Events to Subscribe
- `organization.created`
- `organization.updated`
- `organization.deleted`
- `organizationMembership.created`
- `organizationMembership.updated`
- `organizationMembership.deleted`

### 4. Stripe Setup

#### Product Configuration
Create the following products in Stripe:

1. **Test Drive** - $0/month
2. **Intelligence** - $499/month
3. **Boss Mode** - $999/month
4. **Enterprise** - Custom pricing

#### Webhook Configuration
Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

Required events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 5. Vercel Deployment

#### Deploy Command
```bash
vercel --prod
```

#### Environment Variables in Vercel
Add all environment variables in the Vercel dashboard under Project Settings → Environment Variables.

#### Custom Domain
1. Add your domain in Vercel dashboard
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### 6. Monitoring & Analytics

#### Sentry Setup
1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Configure error tracking

#### Vercel Analytics
Enable in Vercel dashboard for performance monitoring.

### 7. Security Checklist

- [ ] All environment variables are set
- [ ] Database RLS policies are active
- [ ] Clerk webhooks are configured
- [ ] Stripe webhooks are configured
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place

### 8. Performance Optimization

#### Caching Strategy
- Redis for session storage
- Vercel Edge caching for static assets
- Database query optimization

#### CDN Configuration
- Vercel automatically provides global CDN
- Configure custom headers for optimal caching

### 9. Backup & Recovery

#### Database Backups
- Supabase provides automatic backups
- Set up additional backup strategy if needed

#### Code Backups
- GitHub repository as primary backup
- Regular deployment snapshots

### 10. Post-Deployment Testing

#### Functional Tests
- [ ] User registration/login
- [ ] Organization creation
- [ ] Dashboard data loading
- [ ] Review management
- [ ] Billing integration
- [ ] Webhook processing

#### Performance Tests
- [ ] Page load times < 2s
- [ ] API response times < 500ms
- [ ] Database query performance
- [ ] Memory usage monitoring

### 11. Go-Live Checklist

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Clerk organizations enabled
- [ ] Stripe products created
- [ ] Webhooks configured and tested
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring tools active
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation updated

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify `DATABASE_URL` format
- Check Supabase connection limits
- Ensure RLS policies are correct

#### Clerk Authentication Issues
- Verify webhook secret
- Check organization settings
- Ensure proper role mapping

#### Stripe Integration Problems
- Verify webhook endpoints
- Check product configuration
- Test webhook events

#### Performance Issues
- Monitor database queries
- Check Redis connection
- Optimize API responses

## 📞 Support

For deployment issues:
- Check Vercel deployment logs
- Review Supabase logs
- Monitor Sentry for errors
- Contact support team

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring alerts
2. Configure backup schedules
3. Plan scaling strategy
4. Set up customer onboarding flow
5. Implement feature flags
6. Schedule regular maintenance
