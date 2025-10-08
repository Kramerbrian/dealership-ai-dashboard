# DealershipAI Production Setup Guide

## 🚀 Complete Production Environment Setup

This guide will walk you through setting up the complete DealershipAI production environment with all integrations.

## 📋 Setup Checklist

- [x] ✅ Environment variables configured
- [x] ✅ API routes created and tested
- [ ] 🔄 Database setup (Supabase)
- [ ] 🔄 Authentication (Clerk)
- [ ] 🔄 Billing (Stripe)
- [ ] 🔄 tRPC integration
- [ ] 🔄 AI APIs configuration
- [ ] 🔄 Deployment

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### 2. Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  tenant_id UUID REFERENCES tenants(id),
  role TEXT CHECK (role IN ('superadmin', 'enterprise_admin', 'dealership_admin', 'user')) NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('enterprise', 'dealership', 'single')) NOT NULL,
  parent_id UUID REFERENCES tenants(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealership data table
CREATE TABLE dealership_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  domain TEXT NOT NULL,
  ai_visibility_score INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  geo_score INTEGER DEFAULT 0,
  aeo_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  analytics_data JSONB DEFAULT '{}',
  pagespeed_data JSONB DEFAULT '{}',
  competitor_data JSONB DEFAULT '{}',
  last_analyzed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can view own tenant data" ON dealership_data FOR SELECT USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
));
```

## 🔐 Authentication Setup (Clerk)

### 1. Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Enable Organizations
4. Configure OAuth providers (Google, etc.)

### 2. Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 💳 Billing Setup (Stripe)

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and get API keys
3. Set up webhook endpoints

### 2. Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🤖 AI APIs Configuration

### 1. OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set up billing

### 2. Anthropic Setup
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Set up billing

### 3. Environment Variables
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## 🔧 tRPC Setup

### 1. Install Dependencies
```bash
npm install @trpc/client @trpc/server @trpc/next
```

### 2. Create tRPC Router
```typescript
// lib/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  getAnalytics: publicProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ input }) => {
      // Implementation
    }),
});

export type AppRouter = typeof appRouter;
```

## 🚀 Deployment

### 1. Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy

### 2. Environment Variables for Production
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Billing
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# External APIs
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PAGESPEED_API_KEY=...
SEMRUSH_API_KEY=...
YELP_API_KEY=...
```

## 📊 Monitoring & Analytics

### 1. Sentry Setup
```env
SENTRY_DSN=https://...
```

### 2. Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and errors

## 🧪 Testing

### 1. Run Test Suite
```bash
npm run test:all
```

### 2. Test API Endpoints
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/analytics
```

## 🎯 Next Steps

1. **Set up Supabase database** with the provided schema
2. **Configure Clerk authentication** with organizations
3. **Set up Stripe billing** integration
4. **Configure AI APIs** with proper keys
5. **Deploy to Vercel** with production environment
6. **Test all integrations** end-to-end

## 📞 Support

- Check logs in Vercel dashboard
- Monitor API usage and costs
- Test with real dealership data
- Monitor performance metrics

---

**Ready to build the $1.14M+ ROI dashboard! 🚀**
