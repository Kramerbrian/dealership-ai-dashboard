# Vercel Environment Variables Setup Guide

## 🚀 Quick Setup Options

### Option 1: Vercel Dashboard (Recommended)
1. **Go to**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/environment-variables
2. **Click**: "Add New" for each variable
3. **Add the variables below one by one**

### Option 2: Vercel CLI (Interactive)
Run these commands one by one and provide the values when prompted:

```bash
vercel env add ORY_SDK_URL
vercel env add NEXT_PUBLIC_ORY_SDK_URL
vercel env add ORY_PROJECT_ID
vercel env add ORY_WORKSPACE_ID
vercel env add ORY_API_KEY
vercel env add ORY_WEBHOOK_SECRET
vercel env add JWT_SECRET
vercel env add DATABASE_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

## 📋 Environment Variables to Add

### Core Ory Configuration
```bash
ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
NEXT_PUBLIC_ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
ORY_PROJECT_ID=360ebb8f-2337-48cd-9d25-fba49a262f9c
ORY_WORKSPACE_ID=83af532a-eee6-4ad8-96c4-f4802a90940a
```

### Ory API Keys (Get from Ory Console)
```bash
ORY_API_KEY=your_ory_api_key_here
ORY_WEBHOOK_SECRET=your_webhook_secret_here
```

### JWT Configuration
```bash
JWT_SECRET=dealershipai-jwt-secret-key-2024-production
```

### Database Configuration (Update with your actual values)
```bash
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Redis Cache Configuration (Update with your actual values)
```bash
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 🔑 Getting Ory API Keys

### Step 1: Access Ory Console
1. **Go to**: https://console.ory.sh
2. **Select Project**: `optimistic-haslett-3r8udelhc2`

### Step 2: Get API Key
1. **Go to**: Settings → API Keys
2. **Click**: "Create API Key"
3. **Copy the key** → Use as `ORY_API_KEY`

### Step 3: Get Webhook Secret
1. **Go to**: Settings → Webhooks
2. **Create a new webhook** or get existing secret
3. **Copy the secret** → Use as `ORY_WEBHOOK_SECRET`

## 📊 Environment Variables Checklist

- [ ] `ORY_SDK_URL`
- [ ] `NEXT_PUBLIC_ORY_SDK_URL`
- [ ] `ORY_PROJECT_ID`
- [ ] `ORY_WORKSPACE_ID`
- [ ] `ORY_API_KEY` (get from Ory Console)
- [ ] `ORY_WEBHOOK_SECRET` (get from Ory Console)
- [ ] `JWT_SECRET`
- [ ] `DATABASE_URL` (update with your actual value)
- [ ] `SUPABASE_URL` (update with your actual value)
- [ ] `SUPABASE_ANON_KEY` (update with your actual value)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (update with your actual value)
- [ ] `UPSTASH_REDIS_REST_URL` (update with your actual value)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (update with your actual value)

## 🎯 After Adding Variables

1. **Redeploy**: Go to Vercel dashboard → Deployments → Redeploy latest
2. **Test**: Visit your production URL
3. **Verify**: Check that authentication flow works

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard
- **Environment Variables**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/environment-variables
- **Ory Console**: https://console.ory.sh
- **Ory Project**: https://console.ory.sh/projects/360ebb8f-2337-48cd-9d25-fba49a262f9c
