# Streaming LLM Environment Variables Setup

Complete guide for configuring environment variables required for the AIM VIN-DEX Pulse Suite streaming infrastructure.

## Required Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Primary LLM provider for streaming (Claude) |
| `OPENAI_API_KEY` | ⚠️ Optional | Fallback LLM provider (GPT-4o-mini) |
| `DATABASE_URL` | ✅ Yes | Prisma connection for PulseTask queue |

---

## Method 1: Local Development (.env.local)

### Step 1: Create `.env.local` file

In your project root directory:

```bash
touch .env.local
```

### Step 2: Add variables

Open `.env.local` and add:

```bash
# Anthropic API Key (Required)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI API Key (Optional - fallback)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database URL (Required for Prisma/PulseTask)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

### Step 3: Get your API keys

#### Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign in or create account
3. Navigate to **API Keys**
4. Click **Create Key**
5. Name it (e.g., "DealershipAI Production")
6. Copy the key (starts with `sk-ant-api03-`)
7. **Important**: Add billing information for production use

#### OpenAI API Key (Optional)
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click **Create new secret key**
4. Name it (e.g., "DealershipAI Fallback")
5. Copy the key (starts with `sk-proj-`)

#### Database URL
If using Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, select **URI**
5. Copy the connection string
6. Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Step 4: Verify local setup

```bash
# Check variables are loaded
npm run dev

# Test streaming endpoint
curl -N -X POST http://localhost:3000/api/stream/llm-json \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3.5-haiku",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Method 2: Supabase (Project Secrets)

Supabase can store secrets for serverless functions, but for Next.js apps, use Vercel or `.env.local`.

### For Supabase Edge Functions (if applicable)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Secrets**
4. Add secrets:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `DATABASE_URL`

**Note**: For Next.js apps deployed on Vercel, use Vercel environment variables instead.

---

## Method 3: Vercel CLI

### Step 1: Install and login

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Link your project

```bash
# Navigate to project root
cd /path/to/dealership-ai-dashboard

# Link to Vercel project
vercel link
```

Follow prompts:
- **Set up and develop?** → Yes
- **Which scope?** → Select your team/personal account
- **Link to existing project?** → Yes (or create new)

### Step 3: Add environment variables

#### Add for Production

```bash
# Anthropic API Key (Required)
vercel env add ANTHROPIC_API_KEY production
# Paste your key when prompted: sk-ant-api03-...

# OpenAI API Key (Optional)
vercel env add OPENAI_API_KEY production
# Paste your key when prompted: sk-proj-...

# Database URL (Required)
vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

#### Add for Preview and Development

```bash
# Repeat for preview environment
vercel env add ANTHROPIC_API_KEY preview
vercel env add OPENAI_API_KEY preview
vercel env add DATABASE_URL preview

# Repeat for development environment
vercel env add ANTHROPIC_API_KEY development
vercel env add OPENAI_API_KEY development
vercel env add DATABASE_URL development
```

### Step 4: Verify variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally (creates .env.local)
vercel env pull .env.local
```

### Step 5: Redeploy

```bash
# Deploy to production
vercel --prod

# Or trigger redeploy from dashboard
# Vercel will automatically use new environment variables
```

---

## Method 4: Vercel Dashboard (Recommended)

### Step 1: Open Vercel Dashboard

1. Go to https://vercel.com
2. Select your project: **dealership-ai-dashboard**
3. Navigate to **Settings** → **Environment Variables**

Direct link: `https://vercel.com/[your-team]/dealership-ai-dashboard/settings/environment-variables`

### Step 2: Add ANTHROPIC_API_KEY

1. Click **Add New**
2. **Key**: `ANTHROPIC_API_KEY`
3. **Value**: `sk-ant-api03-...` (your Anthropic API key)
4. **Environments**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 3: Add OPENAI_API_KEY (Optional)

1. Click **Add New**
2. **Key**: `OPENAI_API_KEY`
3. **Value**: `sk-proj-...` (your OpenAI API key)
4. **Environments**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 4: Add DATABASE_URL

1. Click **Add New**
2. **Key**: `DATABASE_URL`
3. **Value**: `postgresql://...` (your database connection string)
4. **Environments**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 5: Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

---

## Verification Checklist

### ✅ Local Development

```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are loaded (don't commit this file!)
cat .env.local | grep -E "(ANTHROPIC|OPENAI|DATABASE_URL)"

# Test streaming endpoint
curl -N -X POST http://localhost:3000/api/stream/llm-json \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3.5-haiku",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

### ✅ Vercel Production

```bash
# Check environment variables
vercel env ls

# Test production endpoint (after deployment)
curl -N -X POST https://your-domain.vercel.app/api/stream/llm-json \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3.5-haiku",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

### ✅ Health Check

Visit your health endpoint:
```
https://your-domain.vercel.app/api/health
```

Check the response includes:
```json
{
  "services": {
    "ai_providers": {
      "anthropic": "available",
      "openai": "available"
    }
  }
}
```

---

## Troubleshooting

### Issue: "Anthropic client not configured"

**Solution**: 
- Verify `ANTHROPIC_API_KEY` is set in `.env.local` (local) or Vercel (production)
- Restart dev server: `npm run dev`
- Redeploy on Vercel after adding variables

### Issue: "OpenAI client not configured"

**Solution**: 
- This is optional - only needed if you want OpenAI fallback
- If you only use Anthropic, you can skip `OPENAI_API_KEY`

### Issue: "Prisma Client not initialized"

**Solution**: 
- Verify `DATABASE_URL` is set correctly
- Run `npx prisma generate` to regenerate Prisma client
- Check database connection string format

### Issue: "Module not found: Can't resolve '@/lib/prisma'"

**Solution**: 
- Ensure Prisma is installed: `npm install @prisma/client prisma`
- Run `npx prisma generate`
- Check `lib/prisma.ts` exists

---

## Security Best Practices

1. **Never commit `.env.local`** to git
   - Already in `.gitignore`
   - Contains sensitive API keys

2. **Use different keys for dev/prod**
   - Create separate Anthropic/OpenAI keys for each environment
   - Limit production keys to production domains

3. **Rotate keys regularly**
   - Update keys every 90 days
   - Revoke old keys after rotation

4. **Monitor API usage**
   - Set up billing alerts in Anthropic/OpenAI dashboards
   - Track usage via `/api/health` endpoint

---

## Quick Reference

### Local Development
```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...  # Optional
DATABASE_URL=postgresql://...
```

### Vercel CLI
```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production  # Optional
vercel env add DATABASE_URL production
```

### Vercel Dashboard
1. Settings → Environment Variables
2. Add each variable
3. Select all environments
4. Save and redeploy

---

## Support

For issues:
- Check health endpoint: `/api/health`
- Review logs: Vercel Dashboard → Deployments → Logs
- Test locally first: `npm run dev`

**Last Updated**: 2025-11-13

