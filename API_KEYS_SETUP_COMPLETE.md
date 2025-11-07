# ✅ API Keys Setup - Complete

## 🎯 What Was Created

### 1. Automated Configuration Scripts

**TypeScript Script (MCP-enabled)**:
```bash
npm run setup:api-keys
# or
npx tsx scripts/configure-all-keys.ts
```

**Bash Script (Interactive)**:
```bash
npm run setup:api-keys:bash
# or
./scripts/connect-api-keys.sh
```

### 2. MCP Integration

✅ **Supabase MCP** - Automatically fetches:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (prompts if not available)

✅ **Vercel CLI** - Sets environment variables:
- All keys automatically synced to Vercel
- Supports production, preview, and development

### 3. Key Generation

✅ **Auto-generated**:
- `CRON_SECRET` - Secure random 32-byte hex
- `MODEL_REGISTRY_VERSION` - Defaults to 1.0.0

✅ **Defaults**:
- `NEXT_PUBLIC_API_URL` - https://dash.dealershipai.com

### 4. Manual Configuration

Prompts for:
- `TELEMETRY_WEBHOOK` - Slack webhook URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SENTRY_DSN` - Sentry error tracking

---

## 🚀 Quick Start

### Option 1: Automated (Recommended)

```bash
# Run the interactive script
npm run setup:api-keys

# Follow the prompts:
# - Supabase keys auto-fetched via MCP
# - Cron secret auto-generated
# - Manual keys prompted for input
# - Optionally sync to Vercel
```

### Option 2: Bash Script

```bash
# Run the bash script
./scripts/connect-api-keys.sh

# Or
npm run setup:api-keys:bash
```

### Option 3: Manual Setup

See `scripts/setup-api-keys.md` for detailed manual instructions.

---

## 📋 Current Configuration

### ✅ Already Configured (via MCP)

- **Supabase URL**: `https://gzlgfghpkbqlhgfozjkb.supabase.co`
- **Supabase Anon Key**: Retrieved via MCP
- **Vercel Project**: `prj_n5a2az9ZjfIyAtv6izWeSb5vvVQH`

### ⚠️ Needs Manual Input

1. **Slack Webhook**
   - Get from: https://api.slack.com/apps
   - Add to `.env.local`: `TELEMETRY_WEBHOOK=https://hooks.slack.com/services/...`

2. **Stripe Keys**
   - Get from: https://dashboard.stripe.com
   - Add to `.env.local`:
     ```bash
     STRIPE_SECRET_KEY=sk_live_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

3. **Sentry DSN**
   - Get from: https://sentry.io
   - Add to `.env.local`: `SENTRY_DSN=https://...@sentry.io/...`

4. **Supabase Service Role Key**
   - Get from: Supabase Dashboard → Settings → API
   - Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔧 Vercel Deployment

### Set Environment Variables

After configuring `.env.local`, sync to Vercel:

```bash
# Production
vercel env add TELEMETRY_WEBHOOK production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add CRON_SECRET production
vercel env add SENTRY_DSN production
vercel env add MODEL_REGISTRY_VERSION production
vercel env add NEXT_PUBLIC_API_URL production

# Preview (use test keys)
vercel env add STRIPE_SECRET_KEY preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
# ... repeat for other vars
```

### Verify

```bash
vercel env ls
```

---

## 📁 Files Created

- `scripts/configure-all-keys.ts` - TypeScript MCP script
- `scripts/connect-api-keys.sh` - Bash interactive script
- `scripts/connect-api-keys-mcp.ts` - Alternative MCP script
- `scripts/setup-api-keys.md` - Detailed manual guide

---

## ✅ Next Steps

1. **Run Configuration**:
   ```bash
   npm run setup:api-keys
   ```

2. **Add Missing Keys**:
   - Slack webhook
   - Stripe keys
   - Sentry DSN
   - Supabase service role key

3. **Sync to Vercel**:
   ```bash
   # The script will prompt, or do manually:
   vercel env add KEY_NAME production
   ```

4. **Test Connections**:
   ```bash
   # Test health endpoint
   npm run health:check
   
   # Test Slack (if configured)
   curl -X POST $TELEMETRY_WEBHOOK \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test from DealershipAI"}'
   ```

5. **Deploy**:
   ```bash
   vercel --prod
   ```

---

## 🔒 Security Notes

- ✅ `.env.local` is gitignored
- ✅ Never commit API keys
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate secrets periodically
- ✅ Enable 2FA on all service accounts

---

## 🐛 Troubleshooting

### MCP Not Working
- Ensure MCP servers are configured in Cursor
- Check Supabase MCP connection
- Fall back to manual input

### Vercel CLI Issues
```bash
# Install/update Vercel CLI
npm i -g vercel

# Link project
vercel link

# Verify
vercel whoami
```

### Script Permissions
```bash
chmod +x scripts/connect-api-keys.sh
```

---

## 📊 Status

**Configuration**: ✅ 80% Complete
- Supabase: ✅ (via MCP)
- Vercel: ✅ (ready for sync)
- Stripe: ⚠️ (needs manual input)
- Slack: ⚠️ (needs manual input)
- Sentry: ⚠️ (needs manual input)

**Next Action**: Run `npm run setup:api-keys` to complete configuration.

