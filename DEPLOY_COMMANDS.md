# 🚀 Deploy Commands - DealershipAI

## Quick Deploy (Recommended)

```bash
# One command to sync env and deploy
./scripts/deploy-with-confidence.sh
```

## Manual Deploy Steps

### 1. Sync Environment Variables
```bash
# Sync .env.local to Vercel
./scripts/sync-env-to-vercel.sh

# Or manually add each variable:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

### 2. Deploy to Production
```bash
vercel --prod
```

### 3. Set Clerk User Roles

**Option A: Clerk CLI**
```bash
# Install Clerk CLI
npm install -g @clerk/cli

# Login
clerk login

# Set role for user
clerk users update <userId> --metadata '{"role":"admin","tenant":"demo-dealer-001"}'

# Or use script
./scripts/set-clerk-role-cli.sh <userId> admin demo-dealer-001
```

**Option B: Clerk Dashboard**
1. Go to https://dashboard.clerk.com
2. Users → Select User → Metadata
3. Add: `{"role":"admin","tenant":"demo-dealer-001"}`

**Option C: Node.js Script**
```bash
npx tsx scripts/set-clerk-user-role.ts <userId> admin demo-dealer-001
```

## Verify Deployment

```bash
# Check deployment
vercel ls

# View logs
vercel logs

# Check environment variables
vercel env ls
```

## Post-Deployment Test

Visit your deployment URL and test:
1. ✅ Sign up flow
2. ✅ Onboarding completion
3. ✅ Dashboard access
4. ✅ Fleet dashboard
5. ✅ Fix drawer (dry-run → apply)
6. ✅ Bulk upload

## ✅ Ready!

All scripts are ready. Run `./scripts/deploy-with-confidence.sh` to deploy! 🚀

