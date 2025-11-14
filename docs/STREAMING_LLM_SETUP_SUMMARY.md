# Streaming LLM Setup Summary

**Quick reference for AIM VIN-DEX Pulse Suite environment variables**

## Required Environment Variables

| Variable | Required | Purpose | Get It From |
|----------|----------|---------|------------|
| `ANTHROPIC_API_KEY` | ✅ **Yes** | Primary LLM for streaming (Claude) | https://console.anthropic.com |
| `OPENAI_API_KEY` | ⚠️ Optional | Fallback LLM (GPT-4o-mini) | https://platform.openai.com |
| `DATABASE_URL` | ✅ **Yes** | Prisma connection for PulseTask queue | Supabase Dashboard |

---

## Setup Methods

### 🏠 Local Development (`.env.local`)

```bash
# Create file in project root
cat > .env.local << EOF
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...  # Optional
DATABASE_URL=postgresql://user:pass@host:port/db
EOF
```

**Location**: Project root (already in `.gitignore`)

---

### ☁️ Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/[team]/dealership-ai-dashboard/settings/environment-variables
2. **Add each variable**:
   - Click **Add New**
   - Paste key and value
   - Select: ✅ Production ✅ Preview ✅ Development
   - Click **Save**
3. **Redeploy**: Deployments → ⋯ → Redeploy

---

### 💻 Vercel CLI

```bash
# Login and link
vercel login
vercel link

# Add variables (production)
vercel env add ANTHROPIC_API_KEY production
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production  # Optional

# Add for all environments
for env in production preview development; do
  vercel env add ANTHROPIC_API_KEY $env
  vercel env add DATABASE_URL $env
done

# Deploy
vercel --prod
```

---

### 🗄️ Supabase

**Note**: For Next.js apps, use Vercel. Supabase secrets are for Edge Functions only.

If using Supabase Edge Functions:
1. Dashboard → Settings → Secrets
2. Add: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`

---

## Verification

### Local
```bash
npm run dev
curl http://localhost:3000/api/health | jq '.services.ai_providers'
```

### Production
```bash
curl https://your-domain.vercel.app/api/health | jq '.services.ai_providers'
```

**Expected**:
```json
{
  "anthropic": "available",
  "openai": "available"
}
```

---

## Quick Links

- **Full Guide**: [docs/STREAMING_LLM_ENV_SETUP.md](./STREAMING_LLM_ENV_SETUP.md)
- **Quick Start**: [docs/ENV_QUICK_START.md](./ENV_QUICK_START.md)
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Anthropic client not configured" | Check `ANTHROPIC_API_KEY` is set and restart dev server |
| "Prisma Client not initialized" | Verify `DATABASE_URL` format and run `npx prisma generate` |
| Variables not loading in Vercel | Redeploy after adding variables |

---

**Last Updated**: 2025-11-13

