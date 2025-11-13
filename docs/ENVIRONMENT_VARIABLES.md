# Environment Variables Guide

## Required for Production

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Mapbox
```bash
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_public_token
# OR
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token

# Optional: Custom style URLs
NEXT_PUBLIC_MAPBOX_DARK_STYLE=mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y
NEXT_PUBLIC_MAPBOX_LIGHT_STYLE=mapbox://styles/briankramer/cmhxie6qr009n01sa6jz81fur
NEXT_PUBLIC_MAPBOX_LANDING_STYLE=mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y
```

### Orchestrator API (Optional)
```bash
ORCHESTRATOR_API=https://api.dealershipai.com/v1
ORCHESTRATOR_TOKEN=your_secret_key
```

### Application
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
# OR for production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_BASE_URL=https://dealershipai.com
```

## Optional but Recommended

### Redis (Upstash)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Analytics
```bash
NEXT_PUBLIC_GA=G-XXXXXXXXXX
```

### Email Service
```bash
SENDGRID_API_KEY=SG.xxxxx
RESEND_API_KEY=re_xxxxx
```

## Setting in Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable for:
   - **Production** (required)
   - **Preview** (recommended)
   - **Development** (optional)

## Local Development

Create `.env.local` file in project root:

```bash
# Copy from .env.example
cp .env.example .env.local

# Add your values
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# etc.
```

## Security Notes

- ✅ **NEXT_PUBLIC_*** variables are exposed to the browser
- ❌ **Never** expose secrets (CLERK_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.) with NEXT_PUBLIC_ prefix
- ✅ Use Vercel's environment variable encryption
- ✅ Rotate keys regularly
- ✅ Use different keys for development/production

