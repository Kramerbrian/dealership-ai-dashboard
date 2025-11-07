# 🚀 Quick Start Guide

## ✅ Deployment Status

**Production URL**: https://dealership-ai-dashboard-ipj5z4xj1-brian-kramers-projects.vercel.app

**Status**: ✅ Deployed Successfully

---

## 🔧 Add Missing API Keys

### Option 1: Interactive Script

```bash
./scripts/add-telemetry-webhook.sh
```

### Option 2: Manual Vercel CLI

```bash
# Get your Slack webhook URL from:
# https://api.slack.com/apps → Your App → Incoming Webhooks

vercel env add TELEMETRY_WEBHOOK production
# Paste your webhook URL when prompted
```

### Option 3: Vercel Dashboard

1. Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. Add `TELEMETRY_WEBHOOK` with your Slack webhook URL
3. Select "Production" environment
4. Save

---

## 🧪 Test Health Endpoint

The deployment is protected by Vercel authentication. To test:

### Option 1: Use Vercel MCP (in Cursor)

The health endpoint requires authentication. Use the Vercel MCP tools to access it.

### Option 2: Test Locally

```bash
npm run dev
curl http://localhost:3000/api/health
```

### Option 3: Use Vercel CLI

```bash
vercel inspect [deployment-url] --logs
```

---

## 📋 Environment Variables Checklist

### ✅ Already Configured
- `CRON_SECRET` ✅
- `MODEL_REGISTRY_VERSION` ✅
- `NEXT_PUBLIC_API_URL` ✅
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- `NEXT_PUBLIC_SENTRY_DSN` ✅

### ⚠️ Needs Configuration
- `TELEMETRY_WEBHOOK` - Slack webhook URL

---

## 🎯 Next Steps

1. **Add Slack Webhook** (see above)
2. **Test I2E Components** - Integrate into dashboard
3. **Verify Cron Jobs** - Check Vercel cron logs
4. **Monitor Health** - Set up alerts

---

## 📚 Documentation

- `DEPLOYMENT_COMPLETE.md` - Full deployment summary
- `API_KEYS_SETUP_COMPLETE.md` - API keys guide
- `app/components/i2e/README.md` - I2E components docs

---

## 🆘 Troubleshooting

### Health Endpoint Returns Auth Page
- Deployment is protected (expected)
- Use Vercel MCP or test locally
- Or disable protection in Vercel dashboard

### Webhook Not Working
- Verify webhook URL is correct
- Check Slack app permissions
- Test with curl (see script output)

### Build Errors
- Check logs: `vercel logs [deployment-url]`
- Verify all dependencies installed
- Run `npm run build` locally first

---

**Status**: 🚀 **Ready for Production Use**
