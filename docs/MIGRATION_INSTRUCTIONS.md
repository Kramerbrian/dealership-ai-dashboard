# Migration Instructions

## ✅ Step 1: Environment Variables

`.env.local` has been created from `.env.example`. 

**Next:** Add your actual keys to `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `GA4_PROPERTY_ID`

## ✅ Step 2: Supabase Migration

The migration file is located at: `supabase/migrations/20251107_integrations.sql`

### Option A: Via Supabase CLI (if linked)
```bash
cd supabase
supabase migration up
```

### Option B: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251107_integrations.sql`
4. Paste and run the SQL

### Migration SQL:
```sql
create extension if not exists "uuid-ossp";

create table if not exists public.integrations(
  id uuid primary key default uuid_generate_v4(),
  tenant_id text not null,
  kind text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists integrations_tenant_kind_idx 
  on public.integrations(tenant_id, kind);

create index if not exists integrations_kind_idx 
  on public.integrations(kind);

create index if not exists integrations_tenant_idx 
  on public.integrations(tenant_id);

create index if not exists integrations_metadata_placeid_idx 
  on public.integrations((metadata->>'place_id'))
  where kind='reviews';

create index if not exists integrations_metadata_engines_idx 
  on public.integrations((metadata->'engines'))
  where kind='visibility';

alter table public.integrations enable row level security;

create policy "service_role_full_access" 
  on public.integrations for all 
  using(auth.role()='service_role');
```

## ✅ Step 3: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
npx vercel --prod
```

### Option B: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy

### Required Environment Variables in Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` (use your Vercel domain)
- `GA4_PROPERTY_ID`

## 🔍 Verification

After deployment, test these endpoints:

1. **Drive Dashboard**: `https://your-domain.vercel.app/drive`
2. **Pulse Snapshot**: `https://your-domain.vercel.app/api/pulse/snapshot?domain=example.com` (requires auth)
3. **GA4 OAuth Start**: `https://your-domain.vercel.app/api/oauth/ga4/start`

## 📝 Notes

- The migration creates the `integrations` table with RLS enabled
- Service role has full access (for server-side operations)
- All adapters gracefully handle missing integrations
- Redis caching is optional (falls back to direct fetches)

---

**Status:** 
- ✅ `.env.local` created
- ⏳ Supabase migration (run manually)
- ⏳ Vercel deployment (run manually)

