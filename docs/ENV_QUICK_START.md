# Environment Variables Quick Start

**For Streaming LLM Infrastructure (AIM VIN-DEX Pulse Suite)**

## 🚀 3-Minute Setup

### Option 1: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/[your-team]/dealership-ai-dashboard/settings/environment-variables
2. Click **Add New** for each:

   ```
   ANTHROPIC_API_KEY = sk-ant-api03-... (Required)
   OPENAI_API_KEY = sk-proj-... (Optional)
   DATABASE_URL = postgresql://... (Required)
   ```
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click **Save** and **Redeploy**

### Option 2: Vercel CLI

```bash
vercel login
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel env add DATABASE_URL production
# Optional: vercel env add OPENAI_API_KEY production
vercel --prod
```

### Option 3: Local Development

Create `.env.local` in project root:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...  # Optional
DATABASE_URL=postgresql://...
```

## 📚 Full Documentation

See **[docs/STREAMING_LLM_ENV_SETUP.md](./STREAMING_LLM_ENV_SETUP.md)** for:
- Detailed setup instructions
- API key acquisition guides
- Troubleshooting
- Security best practices

## ✅ Verify Setup

```bash
# Local
npm run dev
curl http://localhost:3000/api/health

# Production
curl https://your-domain.vercel.app/api/health
```

Check response includes:
```json
{
  "services": {
    "ai_providers": {
      "anthropic": "available"
    }
  }
}
```

