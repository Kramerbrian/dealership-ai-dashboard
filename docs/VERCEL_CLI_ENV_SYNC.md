# Vercel CLI Environment Variables Sync

Quick guide to sync environment variables from `.env.local` to Vercel using CLI.

## 🚀 Quick Sync (Automated)

### Option 1: Interactive Setup Script

```bash
# Run interactive script (adds to both .env.local and Vercel)
./scripts/add-streaming-env-vars.sh
```

This script will:
1. Prompt for each variable
2. Add to `.env.local`
3. Sync to Vercel (all environments)

### Option 2: Sync Existing .env.local

If you already have `.env.local` with variables:

```bash
# Sync all variables to all Vercel environments
./scripts/sync-env-to-vercel.sh all

# Or sync to specific environment
./scripts/sync-env-to-vercel.sh production
./scripts/sync-env-to-vercel.sh preview
./scripts/sync-env-to-vercel.sh development
```

---

## 📝 Manual Vercel CLI Commands

### Step 1: Ensure you're logged in and linked

```bash
# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link
```

### Step 2: Add variables from .env.local

```bash
# Read from .env.local and add to Vercel
grep "^ANTHROPIC_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add ANTHROPIC_API_KEY production
grep "^ANTHROPIC_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add ANTHROPIC_API_KEY preview
grep "^ANTHROPIC_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add ANTHROPIC_API_KEY development

grep "^OPENAI_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add OPENAI_API_KEY production
grep "^OPENAI_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add OPENAI_API_KEY preview
grep "^OPENAI_API_KEY=" .env.local | cut -d'=' -f2- | vercel env add OPENAI_API_KEY development

grep "^DATABASE_URL=" .env.local | cut -d'=' -f2- | vercel env add DATABASE_URL production
grep "^DATABASE_URL=" .env.local | cut -d'=' -f2- | vercel env add DATABASE_URL preview
grep "^DATABASE_URL=" .env.local | cut -d'=' -f2- | vercel env add DATABASE_URL development
```

### Step 3: Verify

```bash
# List all environment variables
vercel env ls

# Pull environment variables (creates .env.local from Vercel)
vercel env pull .env.local
```

---

## 🔄 One-Liner Sync Script

Create a simple sync script:

```bash
#!/bin/bash
# Quick sync: .env.local → Vercel

ENV_FILE=".env.local"
ENVS=("production" "preview" "development")

for env in "${ENVS[@]}"; do
  echo "Syncing to $env..."
  
  # ANTHROPIC_API_KEY
  if grep -q "^ANTHROPIC_API_KEY=" "$ENV_FILE"; then
    grep "^ANTHROPIC_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | vercel env add ANTHROPIC_API_KEY "$env"
  fi
  
  # OPENAI_API_KEY (optional)
  if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
    grep "^OPENAI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | vercel env add OPENAI_API_KEY "$env"
  fi
  
  # DATABASE_URL
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2- | vercel env add DATABASE_URL "$env"
  fi
done

echo "✅ Sync complete!"
```

---

## ✅ Verification

### Check Vercel Variables

```bash
# List all
vercel env ls

# Filter specific variable
vercel env ls | grep ANTHROPIC_API_KEY
```

### Test Locally

```bash
# Ensure .env.local has variables
cat .env.local | grep -E "(ANTHROPIC|OPENAI|DATABASE_URL)"

# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/health | jq '.services.ai_providers'
```

### Test Production

```bash
# Deploy
vercel --prod

# Test after deployment
curl https://your-domain.vercel.app/api/health | jq '.services.ai_providers'
```

---

## 🐛 Troubleshooting

### "Project not linked"

```bash
vercel link
# Follow prompts to select project
```

### "Not logged in"

```bash
vercel login
# Follow browser authentication
```

### "Variable already exists"

Vercel will prompt to update. You can also remove first:

```bash
vercel env rm ANTHROPIC_API_KEY production
# Then add again
```

### Variables not loading in production

1. Verify variables exist: `vercel env ls`
2. Redeploy: `vercel --prod`
3. Check deployment logs in Vercel dashboard

---

## 📚 Related Documentation

- **Full Setup Guide**: [docs/STREAMING_LLM_ENV_SETUP.md](./STREAMING_LLM_ENV_SETUP.md)
- **Quick Start**: [docs/ENV_QUICK_START.md](./ENV_QUICK_START.md)
- **Summary**: [docs/STREAMING_LLM_SETUP_SUMMARY.md](./STREAMING_LLM_SETUP_SUMMARY.md)

---

**Last Updated**: 2025-11-13

