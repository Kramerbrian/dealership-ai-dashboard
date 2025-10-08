# Clerk Authentication Setup Guide

## 🔐 Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Next.js Environment (for frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Optional: JWT Configuration
CLERK_JWT_KEY=your-jwt-key

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Queue Management
QSTASH_TOKEN=qst_...
QSTASH_URL=https://qstash.upstash.io/v2/publish

# Security
CRON_SECRET=your-secure-cron-secret
```

## 🚀 Getting Started with Clerk

### 1. Create Clerk Account
1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Multi-tenant" for DealershipAI

### 2. Configure Your Application
1. **Application Name**: DealershipAI
2. **Authentication Methods**: 
   - Email/Password ✅
   - Social Logins (Google, Microsoft) ✅
   - Magic Links ✅
3. **Multi-tenancy**: Enable Organizations ✅

### 3. Get Your API Keys
1. Go to "API Keys" in your Clerk dashboard
2. Copy the following:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 4. Set Up Webhooks
1. Go to "Webhooks" in your Clerk dashboard
2. Create a new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select these events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
   - `organizationMembership.created`
   - `organizationMembership.updated`
   - `organizationMembership.deleted`
4. Copy the webhook secret (starts with `whsec_`)

## 🏗️ Integration Options

### Option 1: Next.js API Routes (Recommended)
Your existing Next.js app with Clerk middleware:

```typescript
// app/api/protected/route.ts
import { clerkMiddleware, getAuth } from '@clerk/express';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = clerkMiddleware();

export async function GET(request: NextRequest) {
  const { isAuthenticated, userId, orgId } = getAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ 
    userId, 
    tenantId: orgId || userId 
  });
}
```

### Option 2: Express.js Server
Standalone Express server with Clerk:

```bash
# Run the Express server
node server-express.js
```

## 👥 User Roles & Permissions

### Role Hierarchy
1. **SuperAdmin** - System-wide access
2. **Enterprise Admin** - Manage enterprise groups
3. **Dealership Admin** - Manage single dealership  
4. **User** - View-only access

### Setting User Roles
```typescript
// Set user role in Clerk metadata
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'dealership_admin',
    permissions: ['read:dealership', 'write:dealership', 'read:scores']
  }
});
```

### Checking Permissions
```typescript
// In your API routes
const { userId } = getAuth(request);
const user = await clerkClient.users.getUser(userId);
const userRole = user.publicMetadata?.role;

if (userRole !== 'superadmin') {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

## 🏢 Multi-Tenant Configuration

### Organization Setup
1. **Enterprise Organizations**: For large dealer groups
2. **Dealership Organizations**: For individual dealerships
3. **User Organizations**: For individual users

### Tenant Isolation
```typescript
// Filter data by tenant
const { orgId, userId } = getAuth(request);
const tenantId = orgId || userId;

const dealerships = await db.dealerships.findMany({
  where: { tenant_id: tenantId }
});
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys regularly

### 2. Webhook Security
- Always verify webhook signatures
- Use HTTPS endpoints
- Validate webhook payloads

### 3. Role-Based Access Control
- Check permissions on every request
- Use middleware for common checks
- Log all permission changes

## 🧪 Testing

### 1. Test Authentication
```bash
# Test user endpoint
curl -H "Authorization: Bearer your-jwt-token" \
  http://localhost:3000/api/user
```

### 2. Test Webhooks
```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "data": {...}}'
```

### 3. Test Role-Based Access
```bash
# Test admin endpoint
curl -H "Authorization: Bearer admin-jwt-token" \
  http://localhost:3000/api/admin
```

## 🚀 Deployment

### 1. Vercel Deployment
```bash
# Set environment variables in Vercel
vercel env add CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET

# Deploy
vercel --prod
```

### 2. Update Webhook URL
1. Go to Clerk dashboard
2. Update webhook URL to: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Test webhook delivery

## 🔧 Troubleshooting

### Common Issues

1. **"User not authenticated"**
   - Check if JWT token is valid
   - Verify CLERK_SECRET_KEY is correct
   - Ensure middleware is applied

2. **Webhook verification failed**
   - Check CLERK_WEBHOOK_SECRET
   - Verify webhook URL is accessible
   - Check svix headers are present

3. **Role checking not working**
   - Verify user metadata is set
   - Check role comparison logic
   - Ensure proper error handling

### Debug Mode
```bash
# Enable debug logging
DEBUG=clerk:* npm run dev
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Express.js Integration](https://clerk.com/docs/quickstarts/express)
- [Webhook Guide](https://clerk.com/docs/webhooks)
- [Multi-tenancy Guide](https://clerk.com/docs/organizations)

## 🎯 Next Steps

1. **Set up Clerk account** and get API keys
2. **Configure environment variables** in `.env.local`
3. **Test authentication** with the provided endpoints
4. **Set up webhooks** for user/organization events
5. **Configure user roles** and permissions
6. **Deploy to production** with proper security

Your DealershipAI system is now ready with enterprise-grade authentication! 🚀
