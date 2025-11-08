# Deployment Status

## ✅ Vercel Deployment

**Status:** Building in progress

**Deployment URL:** https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app

**Inspect:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/Ge5brMUxBGWhDgbffk9MSNvwk3Y1

### Next Steps for Vercel:

1. **Add Environment Variables** in Vercel Dashboard:
   - Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `GOOGLE_OAUTH_CLIENT_ID`
     - `GOOGLE_OAUTH_CLIENT_SECRET`
     - `GOOGLE_OAUTH_REDIRECT_URI` (use your Vercel domain: `https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app/api/oauth/ga4/callback`)
     - `GA4_PROPERTY_ID`

2. **Redeploy** after adding environment variables:
   ```bash
   npx vercel --prod
   ```

## ⚠️ Supabase Migration

**Status:** Needs manual execution

The Supabase CLI tried to connect to a local database. You need to run the migration against your remote Supabase instance.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251107_integrations.sql`
4. Paste and click **Run**

### Option 2: Via Supabase CLI (if linked to remote)

```bash
# Link to your remote project first
supabase link --project-ref your-project-ref

# Then run migration
supabase migration up
```

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

## 🔍 Verification Checklist

After both are complete:

- [ ] Supabase migration executed
- [ ] Vercel environment variables added
- [ ] Vercel deployment successful
- [ ] Test Drive dashboard: `https://your-domain.vercel.app/drive`
- [ ] Test Pulse API: `https://your-domain.vercel.app/api/pulse/snapshot?domain=example.com` (requires auth)
- [ ] Test GA4 OAuth: `https://your-domain.vercel.app/api/oauth/ga4/start`

## 📝 Notes

- The Vercel build is using Next.js 15.5.6
- All dependencies installed successfully
- Build cache restored from previous deployment
- 3 low severity vulnerabilities detected (non-blocking)

---

**Last Updated:** 2025-11-07 12:09 UTC

