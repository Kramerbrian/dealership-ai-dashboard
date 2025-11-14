# Quick Start: Orchestrator System

## 🚀 Complete Setup in 5 Minutes

### Step 1: Deploy Supabase Schema

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to: https://app.supabase.com/project/gzlgfghpkbqlhgfozjkb/sql
2. Copy entire contents of `supabase/schema.sql`
3. Paste and click "Run"
4. ✅ Done!

**Option B: Using Supabase CLI**
```bash
# Already linked to project: gzlgfghpkbqlhgfozjkb
supabase db push
```

---

### Step 2: Set Environment Variables

**Quick Setup Script:**
```bash
./scripts/setup-env-orchestrator.sh
```

**Or manually edit `.env.local`:**
```bash
# Required for OEM parsing
OPENAI_API_KEY=sk-...

# Optional - for Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional - for rollback (production only)
VERCEL_TOKEN=vercel_...

# Optional - for Supabase access
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get keys:**
- **OPENAI_API_KEY**: https://platform.openai.com/api-keys
- **SLACK_WEBHOOK_URL**: https://api.slack.com/apps → Incoming Webhooks
- **VERCEL_TOKEN**: https://vercel.com/account/tokens
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API

---

### Step 3: Test Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
./scripts/test-orchestrator.sh
```

**Or test manually:**
```bash
# Test orchestrator status
curl http://localhost:3000/api/orchestrator/status | jq '.'

# Test OEM parsing
curl -X POST http://localhost:3000/api/oem/parse \
  -H "Content-Type: application/json" \
  -d '{"oem": "Toyota", "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"}'

# Trigger orchestrator
curl -X POST http://localhost:3000/api/orchestrator-background
```

---

### Step 4: Deploy to Production

**1. Set environment variables in Vercel:**
- Go to: Vercel Dashboard → Project Settings → Environment Variables
- Add all variables from Step 2
- Select: Production, Preview, Development

**2. Push to GitHub:**
```bash
git push origin main
```

**3. Verify deployment:**
- Check Vercel dashboard for successful build
- Verify cron job: Settings → Cron Jobs → `/api/orchestrator-background`
- Test orchestrator console: `/pulse/meta/orchestrator-console` (admin only)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Supabase schema deployed (7 tables created)
- [ ] Environment variables set in `.env.local`
- [ ] Dev server starts without errors
- [ ] Orchestrator status endpoint returns `{"ok": true}`
- [ ] OEM parsing works (requires OPENAI_API_KEY)
- [ ] Orchestrator background runs successfully
- [ ] `public/system-state.json` is created after orchestrator run

---

## 🐛 Troubleshooting

**"Connection refused"**
- Dev server not running → `npm run dev`

**"OPENAI_API_KEY not configured"**
- Add to `.env.local` → Restart dev server

**"Unauthorized" (production)**
- Normal for cron endpoints
- Use manual trigger for testing

**Supabase schema errors**
- Use dashboard method (Option A above)
- Check SQL syntax in `supabase/schema.sql`

---

## 📚 Additional Resources

- **Full Testing Guide**: `docs/TESTING_ORCHESTRATOR.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Supabase Deployment**: `docs/SUPABASE_DEPLOYMENT.md`
- **Internal Operations**: `README_INTERNAL.md`

---

**Ready to go!** 🎉

